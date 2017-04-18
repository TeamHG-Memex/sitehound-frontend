ngApp.controller('filterTrainResultsController', ['$scope',
function ($scope) {

	/** FETCH PAges */
	$scope.seedUrls = [];
	$scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;
	$scope.crawlStatusBusy = false;
    $scope.source="searchengine";


	$scope.relevancyFilter = {};
	$scope.relevancyFilter.neutral = true;
	$scope.relevancyFilter.relevant = true;
	$scope.relevancyFilter.irrelevant = true;
	$scope.relevancyFilter.failed = true;
	function getRelevanceSearchObject(){
		var relevanceSearchObject = {};
		relevanceSearchObject.neutral = $scope.relevancyFilter.neutral;
		relevanceSearchObject.relevant = $scope.relevancyFilter.relevant;
		relevanceSearchObject.irrelevant = $scope.relevancyFilter.irrelevant;
		relevanceSearchObject.failed = $scope.relevancyFilter.failed;
		return relevanceSearchObject;
	}

	$scope.pageTypeFilter = {};
	$scope.pageTypeFilter.forum = true;
	$scope.pageTypeFilter.blog = true;
	$scope.pageTypeFilter.news = true;
	$scope.pageTypeFilter.classified = true;
	$scope.pageTypeFilter.ads = true;


	$scope.getSeedUrls = function(){
		debugger;
		seedUrlFactory.get($scope.master.workspaceId, $scope.source, getRelevanceSearchObject(), $scope.lastId)
		.then(function (response) {
			console.log("finish fetching seed Urls");
			var tempResults = response.data;
			Array.prototype.push.apply($scope.seedUrls, tempResults);
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
		},
		function (response) {
		});
	}

	$scope.fetchFiltered = function(){
		$scope.getSeedUrls();
	}


}]);
