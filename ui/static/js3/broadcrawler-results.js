ngApp.controller('broadcrawlerResultsController', ['$scope', '$filter', '$modal', '$routeParams', 'domFactory', 'broadcrawlerFactory', 'broadcrawlerResultsFactory', 'bookmarkFactory', 'deepcrawlerFactory',
function ($scope, $filter, $modal, $routeParams, domFactory, broadcrawlerFactory, broadcrawlerResultsFactory, bookmarkFactory, deepcrawlerFactory){

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	domFactory.highlightNavbar("#navbar-broad-crawl");


	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}


	$scope.searchText = '';
	$scope.categories = [];
	$scope.selectedCategories = {};

	$scope.languages = [];
	$scope.selectedLanguages = {};

	$scope.labelCategories = $scope.categories.length > 0 ? 'Categories: ' : '' ;
	$scope.labelLanguages = $scope.languages.length > 0 ? 'Languages: ' : '' ;
	$scope.filterDisclaimer = $scope.categories.length + $scope.languages.length > 0 ? 'Show only (leave blank for all). Then click Search' : '';

	$scope.bookmarkSwitchStatus = false;

	$scope.getCrawlStatus = function(jobId) {
		broadcrawlerFactory.getCrawlStatus($scope.workspaceId, jobId)
		.success(function(data){
			$scope.status = 'Data loaded';
			$scope.categories = data.categories;
			$scope.languages = data.languages;
			$scope.nResultsFound = data.nResults;
			$scope.labelCategories = $scope.categories.length > 0 ? 'Categories Found: ' : '' ;
			$scope.labelLanguages = $scope.languages.length > 0 ? 'Languages Found: ' : '' ;
			$scope.labelnResultsFound = $scope.nResultsFound > 0 ? 'Results Found: ' : '' ;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}


	$scope.bookmarkFilter = function(result){
		if ($scope.bookmarkSwitchStatus){
			return result.pinned;
		}
		else{
			return true;
		}
	}

	$scope.notRemovedFilter = function(result){
		return !(result.deleted === true);
	}

	$scope.results = [];
	$scope.lastId = $scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null;
	$scope.maxId = null;
	$scope.crawlStatusBusy = false;
	$scope.jobId = $routeParams.jobId ? $routeParams.jobId : null;
	$scope.pageNumber = -1;

	$scope.search = function(){
		$scope.results = [];
		$scope.crawlStatusBusy = false;
		$scope.pageNumber = -1;
		$scope.fetch();
	}


	$scope.fetch = function(){
		if($scope.crawlStatusBusy){
			console.log('busy');
			return;
		}

		$scope.crawlStatusBusy = true;
		var searchText = '';
		if($scope.searchText == ''){
			searchText = '.*';
		}
		else{
			searchText = $scope.searchText;
		}
		var selectedLanguages = [];
		angular.forEach($scope.selectedLanguages, function(isSelected, key) {
			if(isSelected){
				selectedLanguages.push(key);
			}
		});
		var selectedCategories = [];
		angular.forEach($scope.selectedCategories, function(isSelected, key) {
			if(isSelected){
				selectedCategories.push(key);
			}
		});

		$scope.pageNumber++;

		broadcrawlerResultsFactory.search($scope.workspaceId, searchText, selectedLanguages, selectedCategories, $scope.bookmarkSwitchStatus, $scope.lastId, $scope.maxId, $scope.jobId, $scope.pageNumber)
		.success(function(data){
			$scope.status = 'Data loaded';
//			var tempResults = $.parseJSON(data);
//			var tempResults = data.results;
			var tempResults = $.parseJSON(data.results);

			Array.prototype.push.apply($scope.results, tempResults);

//			angular.forEach($scope.results, function(item){
//				console.log(item._id + " " + item.score + " " + item.url );
//			})
//
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1].id :
				($scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null) ;
			$scope.maxId = data.maxId ? data.maxId : null;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
			$scope.crawlStatusBusy = false;
		});
	}


	$scope.remove = function(model){
		broadcrawlerResultsFactory.remove($scope.workspaceId, model.id)
		.success(function(data){
			$scope.status = 'document deleted';
			model.deleted = true;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		})
	};

	$scope.deepCrawl = function(result){
		console.log('deepcrawling: ' + result.url);
		deepcrawlerFactory.send(result.url)
		.success(function(data){
			$scope.status = 'Data loaded';
			console.log("post to arachnado sent succesfully.");
			window.open('http://' + data.ARACHNADO_HOST_NAME +':' + data.ARACHNADO_HOST_PORT,'arachnado').focus()
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	$scope.bookmark = function(result, isPinned){
		bookmarkUpdate(result, true);
	}

	$scope.unbookmark = function(result, isPinned){
		bookmarkUpdate(result, false)
		.success(function(data){
			$scope.status = 'Data loaded';
			result.deleted = true;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	var bookmarkUpdate = function(result, isPinned){
		console.log('bookmarking: ' + result.url + ' as ' + isPinned);
		bookmarkFactory.bookmark($scope.workspaceId, result.id, isPinned)
		.success(function(data){
			$scope.status = 'Data loaded';
			result.pinned = isPinned;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	$scope.getCrawlStatus();

}]);

