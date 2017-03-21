ngApp.controller('userDefinedCategoriesController', ['$scope', '$filter', '$routeParams', 'domFactory', 'userDefinedCategoriesFactory', 'labelUserDefinedCategoriesFactory'
, function ($scope, $filter, $routeParams, domFactory, userDefinedCategoriesFactory, labelUserDefinedCategoriesFactory) {

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}


	function getAll(){
		userDefinedCategoriesFactory.get($scope.workspaceId)
		.success(function (data) {
			var userDefinedCategories = data;
			//$scope.userDefinedCategories = userDefinedCategories || [];
			$scope.getAggregatedLabelUserDefinedCategories(userDefinedCategories);
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		});
	}

	$scope.add = function(userDefinedCategoryInput) {

		if(userDefinedCategoryInput == null || userDefinedCategoryInput.trim() == ""){
			return;
		}

		var userDefinedCategoryArr = userDefinedCategoryInput.split(",");
		for(i=0; i<userDefinedCategoryArr.length; i++){
			var userDefinedCategory = userDefinedCategoryArr[i].trim();
			if(userDefinedCategory.length <3){
				alert("skipping short word: " + userDefinedCategory);
			}
			else{
				userDefinedCategoriesFactory.save($scope.workspaceId, userDefinedCategory)
				.success(function (data) {
					console.log("saved:" + userDefinedCategory);
					getAll();
			});
		}
		$scope.userDefinedCategory="";

	}

		$scope.includedWord = '';
	}

	$scope.remove = function(userDefinedCategory){
		userDefinedCategoriesFactory.delete($scope.workspaceId, userDefinedCategory)
		.success(function (data) {
			getAll();
		});
	}


    $scope.navigateToLabelUserDefinedCategories = function(){
        domFactory.navigateToLabelUserDefinedCategories ();
    }

	$scope.getAggregatedLabelUserDefinedCategories = function(categories){

		labelUserDefinedCategoriesFactory.getAggregated($scope.workspaceId)
			.success(function (data) {
                $scope.userDefinedCategoriesCounted = userDefinedCategoriesFactory.mergeUserDefinedCategoriesCounted(categories, data);
			})
			.error(function (error) {
				$scope.status = 'Unable to load data: ' + error.message;
			});
	}

	getAll();

}]);



var userDefinedCategoriesFactory = ngApp.factory('userDefinedCategoriesFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/user-defined-categories';
	var dataFactory = {};

	dataFactory.get = function (workspaceId) {
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url);
	};

	dataFactory.save = function (workspaceId, userDefinedCategory) {
		var url =  String.format(urlBase, workspaceId);
        return $http.post(url + '/' + userDefinedCategory );
	};

	dataFactory.delete = function (workspaceId, userDefinedCategory) {
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + '/' + userDefinedCategory );
	};


     dataFactory.mergeUserDefinedCategoriesCounted = function(categories, counts){
        var userDefinedCategoriesCounted = [];
        angular.forEach(categories, function(category){
            var count =0;
            angular.forEach(counts, function(v, k){
                if(v.userDefinedCategories == category){
                    count = v.tags;
                    return;
                }
            });
            userDefinedCategoriesCounted.push({"count": count, "category": category});
        });
        return userDefinedCategoriesCounted;
    }

	return dataFactory;
}]);

