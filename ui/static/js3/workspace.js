ngApp.controller('workspaceController', ['$scope', '$filter', '$timeout','workspaceFactory', 'domFactory', 'workspaceStateFactory',
	function ($scope, $filter, $timeout, workspaceFactory, domFactory, workspaceStateFactory) {


	$scope.workspaceId = workspaceStateFactory.get();
	domFactory.setWorkspaceName($scope.workspaceId);

	domFactory.highlightNavbar(".navbar-workspace");

	$scope.next = function(){
		domFactory.navigateToSeed();
	}

	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}


	$scope.status = "";
	$scope.loading = false;

	//TODO move this 2 to domFactory
	$scope.startLoading = function(){
		return $timeout(function(){$scope.loading = true;}, 1000);
	}

	$scope.endLoading = function(timeoutHandle){
		$timeout.cancel(timeoutHandle);
		$scope.loading = false;
	}

	function getWorkspaces(callback) {
		var tOut = $scope.startLoading();
		workspaceFactory.getWorkspaces()
			.success(function (data) {
				$scope.endLoading(tOut);
//				$scope.workspaces = $.parseJSON(data);
				$scope.workspaces = data;
				workspaceStateFactory.setSelectedWorkspace($scope.workspaceId, $scope.workspaces);
//				if(callback){
//					callback.apply();
//				}
			})
			.error(function (error) {
				$scope.endLoading(tOut);
				$scope.status = 'Unable to load customer data: ' + error.message;
			});
	}


	$scope.addWorkspace = function(){
		if($scope.workspace && $scope.workspace.name != ""){
//			$scope.loading=true;
			workspaceFactory.insertWorkspace($scope.workspace.name)
			.success(function (data) {
				$scope.workspace.name = "";
				getWorkspaces();
			})
			.error(function (error) {
				alert(error.message);
				$scope.status = 'Unable to create workspace: ' + error.message;
				getWorkspaces();
			})
			.finally(function(){
//				$scope.loading = false;
			});
		}
		else{
			alert('The name of the workspace is required');
		}
	}

	$scope.deleteWorkspace = function (id, name){
		if (!confirm('Are you sure you want to delete the workspace '+ name +' ?')) {
			return;
		}
//		$scope.loading = true;
		var selectWorkspaceId = $scope.workspaceId;
		workspaceFactory.deleteWorkspace(id)
		.success(function (data) {
			if(id==selectWorkspaceId){
				$scope.workspaceId = null;
				workspaceStateFactory.clear();
			}
			getWorkspaces();
		})
		.error(function (error) {
			$scope.status = 'Unable to delete workspace: ' + error.message;
		})
		.finally(function(){
//			$scope.loading = false;
		});
	}

	$scope.selectWorkspace = function (id){
		$scope.workspaceId = id;
		workspaceStateFactory.set(id, $scope.workspaces);
	}

	$scope.getLength = function(obj) {
		if(obj == undefined)
			return 0;
		return Object.keys(obj).length;
	}

	getWorkspaces();



}])
.directive('workspace-row', function () {
	return {
	restrict : 'C',
		link: function(scope, element) {
			console.log(element);
			element.bind("click" , function(e){
				 element.parent().find("tr").removeClass("workspace-row-selected");
				 element.addClass("workspace-row-selected").removeClass("workspace-row-even");
			});
		}
	}
});



var workspaceFactory = ngApp.factory('workspaceFactory',['$http', function($http){

	var urlBase = '/api/workspace';
	var dataFactory = {}

	dataFactory.getWorkspaces = function () {
		return $http.get(urlBase);
	};

	dataFactory.getWorkspace = function (id) {
		return $http.get(urlBase + '/' + id);
	};

	dataFactory.insertWorkspace = function (workspace) {
		return $http.post(urlBase, workspace);
	};

	dataFactory.deleteWorkspace = function (id) {
		return $http.delete(urlBase + '/' + id);
	};

	return dataFactory;
}]);


var workspaceStateFactory = ngApp.factory('workspaceStateFactory',['$routeParams', '$ngSilentLocation', '$cookies', function($routeParams, $ngSilentLocation, $cookies){

	var dataFactory = {}

	dataFactory.set = function(workspaceId, workspaces){
		dataFactory.setSelectedWorkspace(workspaceId, workspaces);
		$ngSilentLocation.silent('workspace/' + workspaceId);
		$routeParams.workspaceId = workspaceId;
		$cookies.put("workspaceId", workspaceId);
	}


	dataFactory.setSelectedWorkspace = function(id, workspaces){
		angular.forEach(workspaces, function(elem, index){
			if(elem._id == id){
				elem.selected = true;
				$("#workspace-name").text(elem.name);
			}
			else{
				elem.selected = false;
			}
		});
	}

	dataFactory.get = function(){
		var workspaceId = $routeParams.workspaceId;
		if(workspaceId){
			$cookies.put("workspaceId", workspaceId);
		}
		else{
			workspaceId = $cookies.get("workspaceId");
			if(workspaceId){
				dataFactory.set(workspaceId);
			}
			else{
				workspaceId = null;
			}
		}
		return workspaceId;
	}

	dataFactory.clear = function(){
		$ngSilentLocation.silent('/');
		$("#workspace-name").text('');
		$routeParams.workspaceId = null;
		$cookies.remove("workspaceId");
	}

	return dataFactory;

}]);
