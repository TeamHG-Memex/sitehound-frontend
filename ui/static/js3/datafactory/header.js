//DEPRECATED
var headerFactory = ngApp.factory('headerFactory', ['$rootScope', function($rootScope){

	var dataFactory = {}

	dataFactory.menuItem = "welcome";


	dataFactory.setMenuItem= function(menuItem) {

		dataFactory.menuItem = menuItem;
		$rootScope.menuItem = menuItem;
	};

//	dataFactory.getMenuItem = function () {
//		return menuItem;
//	};

	return dataFactory;
}]);



