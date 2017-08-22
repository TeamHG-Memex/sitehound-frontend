/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('allLabeledController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, $mdDialog) {

/** filters **/
    $scope.sources = [
        {"name":"Clear web", "codes":["searchengine", "deepdeep"], "shortCode":"SE"},
        {"name":"Dark web", "codes":["tor"], "shortCode":"TOR"}
    ];

    $scope.relevances= [
        {"name": "Relevant", "code":"true", "aggCode": "relevant", "jsCode": true},
        {"name": "Not relevant", "code":"false", "aggCode": "irrelevant", "jsCode": false},
        {"name": "Skipped", "code":"null", "aggCode": "skipped", "jsCode": null},
        {"name": "Pending", "code":"unset", "aggCode": "pending", "jsCode": undefined}
    ];

    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;


    $scope.toggleSelection = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(item);
        }
        return true; // for chaining
    };

    $scope.inSelection = function (item, list) {
        var idx = list.indexOf(item);
        return idx > -1;
    };


    $scope.clear = function(tab){
        tab.elems = [];
        tab.lastId = null;
        return true; // for chaining
    };

    function init(){

        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            tab.aggregatedResults=null;
            tab.elems=[];
            tab.lastId=null;
            tab.relevanceSelection = [];
            tab.disabled=false;

            for(var j=0; j<$scope.relevances.length; j++){
                tab.relevanceSelection.push($scope.relevances[j].code);
            }
            $scope.tabs[source.shortCode] = tab;
            console.log("ready to fetch: " + source.shortCode);
            fetch(tab);
        }
        getAggregated();
    }

	$scope.bottomOfPageReached = function(tab){
	    if($scope.showProgress){
	        return; // don't double do it
        }
	    console.log("bottomOfPageReached:" + tab);
		fetch(tab);
	};

    $scope.label= function (ev, tab, elem, relevance) {
        elem.relevant=relevance;

        var code;
        if(elem.relevant===true){
            code="true";
        } else if(elem.relevant===false){
            code="false";
        } else if(elem.relevant===null){
            code="null";
        } else if(elem.relevant===undefined){
            code="unset";
        }

        if(!$scope.inSelection(code, tab.relevanceSelection)){
            var found=false;
            var i =0
            for(i; i<tab.elems.length; i++){
                if(tab.elems[i]._id==elem._id){
                    found=true;
                    break;
                }
            }
            if(found){
                var removed = tab.elems.splice(i, 1);
                console.log(removed.url);
                if(tab.elems.length<3){
                    fetch(tab);
                }
            }
        }

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
    };


    /** Begins results */

    $scope.showProgress=false;

    $scope.filters = {};
    $scope.filters.relevance = {};
    function fetch(tab){
        var filters = {};
        filters["sources"] = tab.source.codes;
        if(tab.relevanceSelection.length==0){
            return;
        }
        filters["relevances"] = tab.relevanceSelection;
        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
        }

        $scope.showProgress=true;
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

                // tab.disabled= (tab.elems.length ==0);

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
	}

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
    // $scope.relevanceFilter = function(input, tab){
    //     debugger;
		// return !input.deleted ;//&& $scope.inSelection(elem, );
	// };
}]);


/*

ngApp.filter('relevanceFilter', function () {
return function (arr, tab) {
    debugger;
    if(arr.length>0){

    }
    return tab.relevanceSelection.indexOf(elem.relevant)>-1;

}});
 */
