
ngApp.controller('dashboardController', ['$scope', '$filter', 'workspaceSelectedService', 'headerFactory',
function ($scope, $filter, workspaceSelectedService, headerFactory, $mdDialog) {



	workspaceSelectedService.getSelectedWorkspaceAsync().then(
	function(response){
		$scope.workspaceName = response.data.name;
	},
	function(response){
		console.log(response)
		$scope.workspaceName = null;
	});


}]);
