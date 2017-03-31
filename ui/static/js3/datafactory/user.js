
var userFactory = ngApp.factory('userFactory',['$http', function($http){

	var urlBase = '/api/user';
	var dataFactory = {}

	dataFactory.getAll = function () {
		return $http.get(urlBase);
	};

	dataFactory.get = function (id) {
		return $http.get(urlBase + '/' + id);
	};

	dataFactory.update = function (id, isActive, roles) {
		var po = {};
		if(isActive != null){
			po.isActive = isActive;
		}
		if(roles != null){
			po.roles = roles;
		}

		return $http.put(urlBase + '/' + id, po);
	};

	dataFactory.delete = function (id) {
		return $http.delete(urlBase + '/' + id);
	};

	dataFactory.save = function (username, password) {
		var po = {};
		po.password = password;
		return $http.post(urlBase+ '/' + username, po);
	};

	return dataFactory;
}]);


var roleFactory = ngApp.factory('roleFactory',['$http', function($http){

	var urlBase = '/api/role';
	var dataFactory = {}

	dataFactory.getAll = function () {
		return $http.get(urlBase);
	};

	return dataFactory;
}]);
