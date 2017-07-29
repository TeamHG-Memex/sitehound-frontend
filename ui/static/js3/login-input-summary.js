ngApp.controller('loginInputSummaryController', ['$scope', '$filter', '$modal', '$routeParams', 'domFactory', 'broadcrawlerFactory', 'broadcrawlerResultsFactory', '$http',
 'lgLocalDataProviderFactory',
 'lgServerDataProviderFactory',
 'bookmarkFactory', '$q', 'loginInputFactory'
,function ($scope, $filter, $modal, $routeParams, domFactory, broadcrawlerFactory, broadcrawlerResultsFactory, $http,
			lgLocalDataProviderFactory,
			lgServerDataProviderFactory,
			bookmarkFactory, $q, loginInputFactory){

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	};

	var urlBase = "/api/workspace/{0}/login-input/summary";
	var resourceUrl = String.format(urlBase, $scope.workspaceId);

//	var defaultViewSettings = {
//		orderBy: 'score',
//		limitTo: 50,
//		filter: null
//	};


    $scope.loading = false;
	$scope.dataProvider = lgServerDataProviderFactory.createDefault(resourceUrl);

	$scope.$watch("filterExpression", function () {
		$scope.dataProvider.filter($scope.filterExpression);
	});

	$scope.bookmarkValues = [
        {teamId: 0, teamName: 'No'},
        {teamId: 1, teamName: 'Yes'},
    ];

	$scope.update = function(modelAfter, rowScope){
		rowScope.viewModel.url = modelAfter.url;
		rowScope.viewModel.keyValues = modelAfter.keyValues;
		// loginInputFactory.update($scope.workspaceId, modelAfter._id, modelAfter.url, modelAfter.keyValues)
		debugger;
		loginInputFactory.save($scope.workspaceId, modelAfter.jobId, modelAfter.url, modelAfter._id, modelAfter.keyValues)
		.success(function(data){
			var rowController = rowScope.controller;
				rowController.acceptViewModel();
				rowController.switchView("read");
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	};


	function detailsController($scope, $sce) {
//			$scope.getMapUrl = function () {
//				return $sce.trustAsResourceUrl("https://www.google.com/maps/embed/v1/view?key=AIzaSyAQfMqap7X0mJ7MVcPsheEJyyp0WDRFNHA&center=" + $scope.row.data.loc[1] + ',' + $scope.row.data.loc[0] + "&zoom=14");
//			}
	}

	$scope.remove = function(row){
		var model = row.data;
		var confirmed = confirm('Are you sure you want to remove ' + model.url +'?');
		if (!confirmed){
			return;
		}
		loginInputFactory.remove($scope.workspaceId, model._id)
		.success(function(data){
			$scope.status = 'document deleted';
			model.deleted = true;
			var rowController = row.controller;
			row.viewModel.deleted = 1;
			rowController.acceptViewModel();
			$scope.dataProvider.refresh();
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		})
	};


	$scope.results = [];
	$scope.searchText = '';
	$scope.categories = [];
	$scope.selectedCategories = {};
	$scope.bookmarkSwitchStatus = null;
	$scope.languages = [];
	$scope.selectedLanguages = {};
	$scope.pageNumber = -1;
	$scope.lastId = $scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null;
	$scope.maxId = null;
	$scope.fetchingData = false;

	$scope.getBatchWrapper = function (deferred){

        $scope.loading = true;
		var getBatch = function(){
			var searchText = "";
			$scope.pageNumber++;

			// broadcrawlerResultsFactory.search($scope.workspaceId, $scope.searchText, $scope.selectedLanguages, $scope.selectedCategories, $scope.bookmarkSwitchStatus, $scope.lastId, $scope.maxId, $scope.jobId, $scope.pageNumber)
			loginInputFactory.search($scope.workspaceId, $scope.searchText, $scope.lastId, $scope.maxId, $scope.jobId, $scope.pageNumber)
			.success(function(data){
				debugger;
				var tempResults = $.parseJSON(data.results);
				Array.prototype.push.apply($scope.results, tempResults);
				$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1].id :
					($scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null) ;
				$scope.maxId = data.maxId ? data.maxId : null;
				if(tempResults.length > 0 ){
					getBatch();
				}
				else{
					$scope.fetchingData = false;
					$scope.loading = false;
					deferred.resolve($scope.results)
				}
			})
			.error(function(error){
				$scope.status = 'Unable to load data: ' + error;
				deferred.reject(error);
			})
			.finally(function(){
				$scope.crawlStatusBusy = false;
			});
		}

		getBatch();

		return deferred.promise;

	}


}]);
