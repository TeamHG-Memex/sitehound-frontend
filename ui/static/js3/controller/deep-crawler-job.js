/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('deepcrawlerController', ['$scope', '$filter', '$routeParams', 'deepcrawlerFactory',
function ($scope, $filter, $routeParams, deepcrawlerFactory, $mdDialog) {

    $scope.jobId = $routeParams.jobId;

/** filters **/
    $scope.sources = [
        {"name":"Clear web", "codes":["searchengine", "deepdeep"], "shortCode":"SE"},
        {"name":"Dark web", "codes":["tor"], "shortCode":"TOR"}
    ];
/*
    $scope.relevances= [
        {"name": "Relevant", "code":"true", "aggCode": "relevant", "jsCode": true},
        {"name": "Not relevant", "code":"false", "aggCode": "irrelevant", "jsCode": false},
        {"name": "Skipped", "code":"null", "aggCode": "skipped", "jsCode": null},
        {"name": "Pending", "code":"unset", "aggCode": "pending", "jsCode": undefined}
    ];
*/
    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;


    function init(){

        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            tab.aggregatedResults=null;
            tab.elems=[];
            tab.lastId=null;
            // tab.relevanceSelection = [];
            tab.disabled=false;

            // for(var j=0; j<$scope.relevances.length; j++){
            //     tab.relevanceSelection.push($scope.relevances[j].code);
            // }
            $scope.tabs[source.shortCode] = tab;
            console.log("ready to fetch: " + source.shortCode);
            fetch(tab);
        }
        // getAggregated();
    }

	$scope.bottomOfPageReached = function(tab){
	    if($scope.showProgress){
	        return; // don't double do it
        }
	    console.log("bottomOfPageReached:" + tab);
		fetch(tab);
	};

    /** Begins results */

    $scope.crawlJob = {};
    $scope.showProgress=false;

    $scope.filters = {};

    function fetch(tab){
        var filters = {};
        filters["sources"] = tab.source.codes;
        // if(tab.relevanceSelection.length==0){
        //     return;
        // }
        // filters["relevances"] = tab.relevanceSelection;

        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
        }

        $scope.showProgress=true;
        // seedUrlFactory.get($scope.master.workspaceId, filters)
        deepcrawlerFactory.getDomainsByJobId($scope.master.workspaceId, $scope.jobId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				$scope.crawlJob = response.data;

				$scope.crawlJob["pagesFetched"]=0;
				$scope.crawlJob["status"]=$scope.crawlJob["status"];
				$scope.crawlJob["rpm"]=0;

				if(response.data["progress"]){
				    $scope.crawlJob["pagesFetched"]=response.data["progress"]["pagesFetched"];
                    $scope.crawlJob["status"]=response.data["progress"]["status"];
                    $scope.crawlJob["rpm"]=response.data["progress"]["rpm"];;

				    if(response.data["progress"]["domains"]){
				        var tempResults = response.data["progress"]["domains"];
                        Array.prototype.push.apply(tab.elems, tempResults);

                        tab.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
                            (tab.elems.length > 0 ? tab.elems[tab.elems.length-1]._id : null) ;
                    }
                }
                tab.disabled= (tab.elems.length ==0);
                $scope.showProgress=false;
			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }

    init();
}]);
