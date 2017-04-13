ngApp.controller('headerController', ['$scope', '$filter', '$location',
function ($scope, $filter, $location) {

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
		var path = $location.path();
		var res = path.replace(/\//g, '');
//		console.log("path:" + path + " ,res: " + res);
		return res;
	}
//
//	$scope.navToWorkspace = function(){
////		headerController.setCurrentNavItem("workspace");
////		headerFactory.setMenuItem("workspace");
//		debugger;
//		$scope.currentNavItem = "workspace";
//	}
//
//	$scope.currentNavItem = $rootScope.menuItem;

}]);

