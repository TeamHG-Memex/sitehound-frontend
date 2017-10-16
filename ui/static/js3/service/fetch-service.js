var fetchService = ngApp.factory('fetchService',['$http', function($http){

	var urlBase = '/api/workspace/{0}/seed-url'; //TODO improve this url /fetch/job
	var service = {};

	service.generate = function(workspaceId, nResults, crawlProvider, crawlSources) {
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.crawlProvider = crawlProvider;
		po.crawlSources = crawlSources;
		return $http.post(url + '/generation', po);
	};

	service.getAggregated = function (workspaceId) {
		var url =  String.format(urlBase+'/aggregated', workspaceId);
		return $http.get(url);
	};


	service.resetResults = function(workspaceId, source){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + '/generation/' + source);
	};

	return service;
}]);


