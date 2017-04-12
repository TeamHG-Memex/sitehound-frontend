
var workspaceFactory = ngApp.factory('workspaceFactory',['$http', function($http){

	var urlBase = '/api/workspace';
	var dataFactory = {}

	dataFactory.getWorkspaces = function () {
		return $http.get(urlBase);
	};

	dataFactory.getWorkspace = function (id) {
		return $http.get(urlBase + '/' + id);
	};

	dataFactory.add = function (workspace) {
		return $http.post(urlBase, workspace);
	};

	dataFactory.deleteWorkspace = function (id) {
		return $http.delete(urlBase + '/' + id);
	};

	return dataFactory;
}]);




