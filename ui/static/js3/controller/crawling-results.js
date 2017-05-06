ngApp.controller('crawlingResultsController', ['$scope', '$filter', 'headerFactory',
function ($scope, $filter, headerFactory, $mdDialog) {

    $scope.workspaceId = $scope.master.workspaceId;


//	workspaceSelectedService.getSelectedWorkspaceAsync().then(
//	function(response){
//		$scope.workspaceName = response.data.name;
//	},
//	function(response){
//		console.log(response)
//		$scope.workspaceName = null;
//	});


}]);
