ngApp.controller('deepcrawlerDomainController', ['$scope', '$filter', '$mdConstant', '$routeParams', 'deepcrawlerFactory', 'domFactory',
function ($scope, $filter, $mdConstant, $routeParams, deepcrawlerFactory, domFactory) {


	$scope.jobId = $routeParams.jobId;
	$scope.domainName = $routeParams.domain;


    /** Begins results */
    $scope.showByurlProgressTab = false;

	$scope.bottomOfPageReached = function(){
		fetch();
	};

    $scope.filters = {};
	// $scope.filters.sources = [];
	// $scope.filters.relevances = [];
	// $scope.filters.categories = [];
	// $scope.filters.udcs = [];

	$scope.elems = [];
	$scope.filters.lastId = $scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null;

	function fetch(){

        // seedUrlFactory.get($scope.master.workspaceId, $scope.filters)
		deepcrawlerFactory.getDeepcrawlDomainsByDomainName($scope.master.workspaceId, $scope.jobId, $scope.domainName, $scope.filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;
				Array.prototype.push.apply($scope.elems, tempResults);

				$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					($scope.elems.length > 0 ? $scope.elems[$scope.elems.length-1]._id : null) ;
			},
			function (response) {
				console.log(response);
			});
	}

	fetch();

	/** end results */

	$scope.newDeepCrawl = function(){
		domFactory.navigateToUrl("#/new-deep-crawl");

	};
	$scope.newSmartCrawl = function(){
		domFactory.navigateToUrl("/new-smart-crawl");
	};


}]);
