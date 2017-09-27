ngApp.controller('smartCrawlerResultsController', ['$scope', '$routeParams', '$rootScope', '$interval', 'smartCrawlerFactory', 'jobFactory',
    function ($scope, $routeParams, $rootScope, $interval, smartCrawlerFactory, jobFactory) {

    $scope.master.init();

    $scope.jobId = $routeParams.jobId;

    function getCurrentJob(){
        jobFactory.getById($scope.master.workspaceId, $scope.jobId)
        .then(
            function(response){
                console.log(response.data);
                $scope.crawlJob = response.data;
            },
		    function(){}
        );
    }

    var isRunning = false;
    function backgroundService(){
        if(!isRunning && $scope.master.workspaceId){
            isRunning = true;

           getCurrentJob();

            $interval.cancel($rootScope.backgroundServicePromise);
            $rootScope.backgroundServicePromise = $interval(backgroundService, 15000);
            isRunning=false;

            $scope.hasNext = true; // resets to fetch for new results
        }
    }
    backgroundService();


    /** RESULTS **/

	$scope.refresh = function () {
		$scope.hasNext = true;
		$scope.bottomOfPageReached();
    };

    function fetch(){

        if($scope.showProgress){
            return;
        }

		$scope.showProgress = true;

        smartCrawlerFactory.getResults($scope.master.workspaceId, $scope.jobId, $scope.filters)
        .then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;

				if(tempResults.length==0){
					$scope.hasNext = false;
				}
				else{
    				Array.prototype.push.apply($scope.elems, tempResults);
                    $scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
                        ($scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null) ;
                }
				$scope.showProgress = false;
			},
			function (response) {
				$scope.showProgress = false;
				console.log(response);
			});
    }

    $scope.filters = {};
	$scope.elems = [];
	$scope.filters.lastId = $scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null;

    $scope.showProgress = false;
	$scope.hasNext = true;

	$scope.bottomOfPageReached = function(){
	    if($scope.showProgress ){
	        return; // don't double do it
        }
        if($scope.hasNext){
			fetch();
		}
	};

    fetch();
}]);

