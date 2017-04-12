ngApp.controller('headerController', ['$rootScope', '$scope', '$filter', '$location', 'headerFactory',
function ($rootScope, $scope, $filter, $location, headerFactory) {

//	$scope.currentNavItem = "welcome";

//    $scope.$watch('headerFactory.menuItem', function() {
//        alert('hey, myVar has changed!');
//    });
//
//    $scope.$watch('$rootScope.menuItem', function() {
//        alert('hey, $rootScope has changed!');
//    });

	$scope.getTabName = function() {
//	    var res = $location.path().replace(/(^#\/|\/$)/g, '');

		var res = $location.path().replace(/\//g, '');
	    debugger;
	    return res;
	}

	$scope.navToWorkspace = function(){
//		headerController.setCurrentNavItem("workspace");
//		headerFactory.setMenuItem("workspace");
		debugger;
		$scope.currentNavItem = "workspace";
	}

	$scope.currentNavItem = $rootScope.menuItem;

}]);

