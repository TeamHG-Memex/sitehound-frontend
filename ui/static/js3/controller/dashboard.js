ngApp.controller('dashboardController', ['$scope', '$filter', 'headerFactory',
function ($scope, $filter, headerFactory, $mdDialog) {



    $scope.master.init();

//	workspaceSelectedService.getSelectedWorkspaceAsync().then(
//	function(response){
//		$scope.workspaceName = response.data.name;
//	},
//	function(response){
//		console.log(response)
//		$scope.workspaceName = null;
//	});


}]);
