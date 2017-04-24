ngApp.controller('masterController', ['$scope', '$cookies', '$mdConstant', 'workspaceFactory',
function ($scope, $cookies, $mdConstant, workspaceFactory) {

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

    //catalogs

    $scope.master.catalog={};

    $scope.master.catalog.relevances = [
      { label: 'relevant', value: true },
      { label: 'neutral', value: null },
      { label: 'irrelevant', value: false},
    ];

    $scope.master.catalog.categories1= ['FORUM', 'NEWS'];
    $scope.master.catalog.categories2 = ['BLOG', 'SHOPPING'];
    $scope.master.catalog.categories = $scope.master.catalog.categories1.concat($scope.master.catalog.categories2);
    $scope.master.catalog.udcs = [];

    $scope.master.catalog.sources=[
      { label: 'Google + Bing', value: 'searchengine' },
      { label: 'Twitter API', value: 'twitter' },
    ];

    $scope.toggleSelection = function toggleSelection(elem, list) {
        var idx = list.indexOf(elem);

        // is currently selected
        if (idx > -1) {
          list.splice(idx, 1);
        }

        // is newly selected
        else {
          list.push(elem);
        }
      };

    $scope.splitKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];

}]);
