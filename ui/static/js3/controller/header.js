ngApp.controller('headerController', ['$scope', '$filter', '$location',
function ($scope, $filter, $location) {

	$scope.currentNavItem = "dashboard";

//    $scope.$watch('headerFactory.menuItem', function() {
//        alert('hey, myVar has changed!');
//    });
//
//    $scope.$watch('$rootScope.menuItem', function() {
//        alert('hey, $rootScope has changed!');
//    });

	$scope.$on('$locationChangeSuccess', function(event, newUrl, oldUrl){
//		console.log("newUrl: " + newUrl);
//		console.log("oldUrl: " + oldUrl);
//		console.log("$scope.currentNavItem: " + $scope.currentNavItem);
		$scope.currentNavItem = $scope.getTabName();
//		debugger;
//		$scope.currentNavItem = "welcome";
	});

	$scope.getTabName = function() {
//	    var res = $location.path().replace(/(^#\/|\/$)/g, '');
		var path = $location.path();
		var res = path.replace(/\//g, '');
//		console.log("path:" + path + " ,res: " + res);
//		console.log("path:" + path + " ,res: " + res + " , hash: " + $location.hash());
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

