ngApp.controller('dashboardController', ['$scope', '$filter', 'headerFactory',
function ($scope, $filter, headerFactory, $mdDialog) {

    $scope.workspaceId = $scope.master.workspaceId;
    $scope.master.init();

    $scope.trainingStats = {};
    $scope.trainingStats.resultStruct = {};

    $scope.broadcrawlStats={};
    $scope.broadcrawlStats.resultStruct={};



//	workspaceSelectedService.getSelectedWorkspaceAsync().then(
//	function(response){
//		$scope.workspaceName = response.data.name;
//	},
//	function(response){
//		console.log(response)
//		$scope.workspaceName = null;
//	});


}]);
