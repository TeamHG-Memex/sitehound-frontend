/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('modelController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {

/** filters **/
    $scope.sources = [
        {"name":"Search Engines", "code":"searchengine", "shortCode":"SE", "results":0},
        // {"name":"Seeds", "code":"imported", "shortCode":"MANUAL", "results":0},
        {"name":"Onions", "code":"tor", "shortCode":"TOR", "results":0},
        // {"name":"DeepDeep", "code":"deepdeep", "shortCode":"DD", "results":0}
    ];

    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;

    function init(){
        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            tab.nResults=null;
            tab.elems=[];
            tab.lastId=null;
            tab.selected=[];
            tab.allSelected=false;
            $scope.tabs[source.shortCode] = tab;
            fetch(tab, getNextElem);
            tab.currentElem=null;
        }
        $scope.getAggregated();
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
        getNextElem(tab);
        seedUrlFactory.label($scope.master.workspaceId, elem._id, relevance);
    };

/*
    $scope.toggleAll = function(tab) {
        if (tab.selected.length == tab.elems.length){
            tab.selected = [];
            tab.allSelected=false;
        } else {
            for(var i=0; i<tab.elems.length; i++){
                var idx = tab.selected.indexOf(tab.elems[i]._id);
                if (idx == -1) {
                    tab.selected.push(tab.elems[i]._id);
                }
            }
            if(tab.elems.length!=tab.nResults){
                // not all were displayed yet
                var res = confirm("Also apply selection to all " + tab.nResults + " results?");
                if(res){
                    tab.allSelected= true;
                }
                else{
                    tab.allSelected=false;
                }
            }

        }
    };

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(item);
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.isIndeterminate = function(tab) {
        return tab.selected.length !== 0 && (tab.selected.length !== tab.elems.length);
    };

    $scope.isChecked = function(tab) {
        return tab.selected.length !== 0 && (tab.selected.length === tab.elems.length);
    };
*/


    /** Begins results */

	// $scope.currentResults=0;
    $scope.showProgress=false;
	// $scope.bottomOfPageReached = function(tab){
	//     if($scope.showProgress){
	//         return; // don't double do it
     //    }
	//     $scope.showProgress=true;
	//     console.log("bottomOfPageReached:" + tab);
	// 	fetch(tab);
	// };

    function fetch(tab, callback){
        var filters = {};
        filters["sources"] = [tab.source.code];
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

	$scope.getAggregated = function() {
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

    function buildAggregatedBy(seedUrlAggregated){
        var resultStruct = {
        "SE":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "DD":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "MANUAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "TOR":{"relevant":0, "irrelevant":0, "neutral":0, "total":0}
        };
        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined || value._id.relevant === null ? "neutral" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["neutral"] ;
        });

        setTabsValue("SE", resultStruct["SE"]["total"]);
        // setTabsValue("MANUAL", resultStruct["MANUAL"]["total"]);
        setTabsValue("TOR", resultStruct["TOR"]["total"]);
        // setTabsValue("DD", resultStruct["DD"]["total"]);
    }

    function setTabsValue(shortCode, value){
        $scope.tabs[shortCode].nResults=value;
    }


    /**
     * sends
     * 1) for the ones displayed, the checked status
     * 2) for the ones not yet fetched, the main/submain checkbox status
     * @param ev
     */
	$scope.newDeepCrawl = function (ev) {
	    console.log(ev);
        alert("deepcrawl!");
    };


    init();
}]);


