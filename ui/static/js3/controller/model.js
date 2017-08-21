/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('modelController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {

/** filters **/
    $scope.sources = [
        {"name":"Clear web", "codes":["searchengine", "deepdeep"], "shortCode":"SE"},
        // {"name":"Seeds", "code":"imported", "shortCode":"MANUAL"},
        {"name":"Dark web", "codes":["tor"], "shortCode":"TOR"},
        // {"name":"DeepDeep", "code":"deepdeep", "shortCode":"DD"}
    ];

    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;

    function init(){
        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            // tab.nResults=null;
            tab.aggregatedResults=null;
            tab.elems=[];
            tab.lastId=null;
            tab.selected=[];
            tab.allSelected=false;
            $scope.tabs[source.shortCode] = tab;
            fetch(tab, getNextElem);
            tab.currentElem=null;
        }
        getAggregated();
    }

    function getNextElem(tab){
        if(tab.elems.length>0){
            tab.currentElem = tab.elems.splice(0, 1);
        }
        else{
            $scope.showProgress=true;
            fetch(tab, getNextElem);
        }
        if(tab.elems.length<4){
            fetch(tab);
        }
    }


    $scope.label= function (ev, tab, elem, relevance) {
        tab.currentElem=null;
        seedUrlFactory.label($scope.master.workspaceId, elem._id, relevance)
        .then(
			function (response) {
                getAggregated();
            },
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			}
        );
        getNextElem(tab);
    };


    /** Begins results */

    $scope.showProgress=false;

    function fetch(tab, callback){
        var filters = {};
        filters["sources"] = tab.source.codes;
        filters["relevances"] = ["unset"];
        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
        }

        seedUrlFactory.get($scope.master.workspaceId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;
				Array.prototype.push.apply(tab.elems, tempResults);

				if(tab.allSelected){
                    for(var i=0; i<tempResults.length;i++){
                        tab.selected.push(tempResults[i]._id);
                    }
                }
				tab.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					(tab.elems.length > 0 ? tab.elems[tab.elems.length-1]._id : null) ;

                tab.disabled= (tab.elems.length ==0);

                // everything was labeled
                if(tempResults.length>0 && callback!=null){
                    callback(tab);
                }
				$scope.showProgress=false;
			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }


    /** aggregated results by source */

	function getAggregated() {
        // var tOut = $scope.startLoading();
		seedUrlFactory.getAggregated($scope.master.workspaceId)
			.then(
			    function (response) {
                    buildAggregatedBy(response.data);
                    // $scope.endLoading(tOut);
                },
                function (error) {
                    // $scope.endLoading(tOut);
                    $scope.status = 'Unable to load data: ' + error.message;
                }
			);
	};

    // var foo = function Status() {
    //       // constructor() {
    //         this.relevant = 0;
    //         this.irrelevant=0;
    //         this.skipped=0;
    //         this.pending=0;
    // };

    function buildAggregatedBy(seedUrlAggregated){

        var resultStruct = {
        "SE":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0},
        // "DD":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0},
        // "MANUAL":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0},
        "TOR":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0}
        };

        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" || value._id.crawlEntityType =="DD" || value._id.crawlEntityType =="MANUAL" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined ? "pending" : value._id.relevant === null ? "skipped" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["skipped"] + resultStruct[crawlEntityType]["pending"];
        });

        $scope.tabs["SE"].aggregatedResults=resultStruct["SE"];
        $scope.tabs["TOR"].aggregatedResults=resultStruct["TOR"];

    }


    /**
     * sends
     * 1) for the ones displayed, the checked status
     * 2) for the ones not yet fetched, the main/submain checkbox status
     * @param ev
     */
	$scope.newSmartCrawl = function (ev) {
	    console.log(ev);
        alert("deepcrawl!");
    };


    init();
}]);


