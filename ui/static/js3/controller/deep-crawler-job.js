/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('deepcrawlerController', ['$scope', '$filter', '$routeParams', 'deepcrawlerFactory',
function ($scope, $filter, $routeParams, deepcrawlerFactory, $mdDialog) {

    $scope.jobId = $routeParams.jobId;

    $scope.elems=[];
    // $scope.lastId=null;

    /** Begins results */

    $scope.crawlJob = {};
    $scope.showProgress=false;

    $scope.filters = {};

    $scope.fetch = function(){
        fetch();
    };

    function fetch(){
        var filters = {};
        // filters["sources"] = tab.source.codes;
        // if(tab.relevanceSelection.length==0){
        //     return;
        // }
        // filters["relevances"] = tab.relevanceSelection;

        // if($scope.lastId){
        //     filters["lastId"] = [$scope.lastId];
        // }

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
                    $scope.crawlJob["rpm"]=response.data["progress"]["rpm"];

				    if(response.data["progress"]["domains"]){
				        var tempResults = response.data["progress"]["domains"];
				        $scope.elems = tempResults;
                        // Array.prototype.push.apply($scope.elems, tempResults);
                        //
                        // $scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
                        //     ($scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null) ;
                    }
                }
                // tab.disabled= (tab.elems.length ==0);
                $scope.showProgress=false;
			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }

    fetch();
}]);
