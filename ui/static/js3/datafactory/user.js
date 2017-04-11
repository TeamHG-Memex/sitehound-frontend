
var userFactory = ngApp.factory('userFactory',['$http', function($http){

	var urlBase = '/api/user';
	var dataFactory = {}

	dataFactory.getAll = function () {
		return $http.get(urlBase);
	};

	dataFactory.get = function (id) {
		return $http.get(urlBase + '/' + id);
	};

	dataFactory.editAccountState = function(user){
		var po = {};
		po.isActive = user.active;
		return $http.put(urlBase + '/' + user._id +'/account-status',  po);
	}



	dataFactory.update = function (user) {
		id = user._id;
		var po = {};
		po.active = user.active;
		po.roles = user.roles;

		return $http.put(urlBase + '/' + id, po);
	};

	dataFactory.delete = function (id) {
		return $http.delete(urlBase + '/' + id);
	};

	dataFactory.add = function (username, password) {
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
