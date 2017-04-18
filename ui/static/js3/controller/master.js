ngApp.controller('masterController', ['$scope', '$cookies', 'workspaceFactory',
function ($scope, $cookies, workspaceFactory) {

	$scope.master = {};
	$scope.master.workspaceId = $cookies.get("workspaceId");


	$scope.master.setWorkspace = function(workspaceId){
		$scope.master.workspaceId = workspaceId;
		$cookies.put("workspaceId", workspaceId);
		$scope.master.reloadWorkspaceName(workspaceId);
	}

	$scope.master.onRemovedWorkspaceId = function(removedWorkspaceId){
		if(removedWorkspaceId == $scope.master.workspaceId){
			$scope.master.workspaceId = null;
			$cookies.remove("workspaceId");
			$scope.master.workspaceName = null;
		}
	}


	//use this when we allow the user to rename the workspace
	$scope.master.reloadWorkspaceName = function(workspaceId){
		workspaceFactory.getWorkspace(workspaceId).then(
		function(response){
			$scope.master.workspaceName = response.data.name;
		},
		function(response){
			console.log(response)
			$scope.workspaceName = null;
		});
	}


	//main
	if($scope.master.workspaceId){
		$scope.master.reloadWorkspaceName($scope.master.workspaceId);
	}

}]);
