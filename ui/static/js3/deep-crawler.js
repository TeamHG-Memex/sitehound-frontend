var deepcrawlerFactory = ngApp.factory('deepcrawlerFactory',['$http', function($http){

	var urlBase = '/api/deep-crawl';
	var dataFactory = {};

	dataFactory.send = function (workspaceId, url){
		var po = {};
		po.workspaceId = workspaceId;
		po.url = url;
		return $http.post(urlBase, po);
	};

	return dataFactory;
}]);
