
ngApp.controller('crawlingResultsController', ['$scope', '$filter', 'headerFactory', 'broadcrawlerResultsFactory',
function ($scope, $filter, headerFactory, broadcrawlerResultsFactory, $mdDialog) {


    ///////

    // $scope.name = 'Superhero';
    //
    // $scope.items = [];
    // for(var i=0;i< 500;i++){
    //     $scope.items.push('item: ' + i);
    // }
    //
    // $scope.showMore = function() {
    //     console.log('show more triggered');
    // };


	///////


	$scope.master.init();
    $scope.workspaceId = $scope.master.workspaceId;

//    $scope.showFilters = ['sources', 'relevances', 'categories', , 'udcs']
    $scope.showFilters = ['sources', 'categories']

//	workspaceSelectedService.getSelectedWorkspaceAsync().then(
//	function(response){
//		$scope.workspaceName = response.data.name;
//	},
//	function(response){
//		console.log(response)
//		$scope.workspaceName = null;
//	});



	$scope.searchText = '';
	$scope.categories = [];
	$scope.selectedCategories = {};

	$scope.languages = [];
	$scope.selectedLanguages = {};

	$scope.labelCategories = $scope.categories.length > 0 ? 'Categories: ' : '' ;
	$scope.labelLanguages = $scope.languages.length > 0 ? 'Languages: ' : '' ;
	$scope.filterDisclaimer = $scope.categories.length + $scope.languages.length > 0 ? 'Show only (leave blank for all). Then click Search' : '';

	$scope.bookmarkSwitchStatus = false;
/*
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
*/

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
//	$scope.jobId = $routeParams.jobId ? $routeParams.jobId : null;
// 	$scope.pageNumber = -1;

	var searchResultsButtonStarted = false;
	$scope.search = function(){
		$scope.results = [];
		$scope.crawlStatusBusy = false;
		$scope.pageNumber = 0;
        searchResultsButtonStarted = true;

		$scope.fetch();

	}




	$scope.fetch = function(){
		if (!searchResultsButtonStarted){
			return;
		}

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


		debugger;
//		broadcrawlerResultsFactory.search($scope.workspaceId, searchText, selectedLanguages, selectedCategories, $scope.bookmarkSwitchStatus, $scope.lastId, $scope.maxId, $scope.jobId, $scope.pageNumber)
		broadcrawlerResultsFactory.search($scope.workspaceId, searchText, selectedLanguages, selectedCategories, $scope.bookmarkSwitchStatus, $scope.lastId, $scope.maxId, $scope.pageNumber)
		.then(function(response){
			$scope.status = 'Data loaded';
			var tempResults = response.data.results;

			Array.prototype.push.apply($scope.results, tempResults);

//			angular.forEach($scope.results, function(item){
//				console.log(item._id + " " + item.score + " " + item.url );
//			})
//
			$scope.pageNumber = $scope.pageNumber + 1;
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1].id :
				($scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null) ;
			$scope.maxId = response.data.maxId ? response.data.maxId : null;
			$scope.loading = false;
			$scope.crawlStatusBusy = false;
            },
            function(error){
                $scope.status = 'Unable to load data: ' + error;
                $scope.loading = false;
                $scope.crawlStatusBusy = false;
    		}
        );
	}

    $scope.master.bottomOfPageReachedAddListener($scope.fetch);

	$scope.remove = function(model){
		broadcrawlerResultsFactory.remove($scope.workspaceId, model.id)
		.then(function(response){
			$scope.status = 'document deleted';
			model.deleted = true;
			$scope.loading = false;
            },
            function(error){
                $scope.status = 'Unable to load data: ' + error;
                $scope.loading = false;
            }
        )
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

//	$scope.getCrawlStatus();

}]);
