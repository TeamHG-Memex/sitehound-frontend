
var headerFactory = ngApp.factory('headerFactory', ['$rootScope', function($rootScope){

	var dataFactory = {}

	dataFactory.menuItem = "welcome";


	dataFactory.setMenuItem= function(menuItem) {
	debugger;
		dataFactory.menuItem = menuItem;
		$rootScope.menuItem = menuItem;
	};

//	dataFactory.getMenuItem = function () {
//		return menuItem;
//	};

	return dataFactory;
}]);



