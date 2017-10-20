ngApp.controller('deepcrawlerDomainController', ['$scope', '$filter', '$rootScope', '$timeout', '$interval', '$mdConstant', '$routeParams', 'deepcrawlerFactory',
function ($scope, $filter, $rootScope, $timeout, $interval, $mdConstant, $routeParams, deepcrawlerFactory) {

    $scope.master.init();

	$scope.jobId = $routeParams.jobId;
	$scope.domainName = $routeParams.domain;

    // $scope.showByurlProgressTab = false;

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

	$scope.refresh = function () {
		$scope.hasNext = true;
		$scope.bottomOfPageReached();
    };

    $scope.filters = {};
	$scope.elems = [];
	$scope.filters.lastId = $scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null;

	function fetch(){
		$scope.showProgress = true;
		deepcrawlerFactory.getDeepcrawlDomainsByDomainName($scope.master.workspaceId, $scope.jobId, $scope.domainName, $scope.filters)
		.then(
			function (response) {
				console.log("finish fetching getDeepcrawlDomainsByDomainName");
				var tempResults = response.data;

				Array.prototype.push.apply($scope.elems, tempResults);

				$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					($scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null) ;

				if(tempResults.length==0){
					$scope.hasNext = false;
				}
				$scope.showProgress = false;
			},
			function (response) {
				$scope.showProgress = false;
				console.log(response);
			});
	}

	// fetch();

    var isRunning = false;
    function backgroundService(){
        if(!isRunning && $scope.master.workspaceId){
            isRunning = true;
            // if($scope.elems.length<1) {
            fetch();
            // }
            $interval.cancel($rootScope.backgroundDeepCrawlDomainsServicePromise);
            $rootScope.backgroundDeepCrawlDomainsServicePromise = $interval(backgroundService, 5000);
            isRunning=false;
        }
    }

    backgroundService();

    $scope.$on('$locationChangeStart', function(event) {
        console.log("$locationChangeStart");
        $interval.cancel($rootScope.backgroundDeepCrawlDomainsServicePromise);
        console.log("canceled backgroundDeepCrawlDomainsServicePromise");
    });


}]);
