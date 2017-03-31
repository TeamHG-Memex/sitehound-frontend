
var importUrlFactory = ngApp.factory('importUrlFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/import-url';
	var dataFactory = {};

	dataFactory.save= function (workspaceId, urlsToAdd) {
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.urls = urlsToAdd;//.split('|');
		return $http.post(url, po);
	};

	return dataFactory;
}]);

