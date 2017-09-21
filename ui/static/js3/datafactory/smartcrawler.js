
var smartCrawlerFactory = ngApp.factory('smartCrawlerFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/smart-crawl';
	var dataFactory = {};

	dataFactory.startSmartCrawl = function(workspaceId, nResults, broadness){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.broadness = broadness;
		return $http.post(url, po);
	};

	dataFactory.getCrawlStatus = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url + '/status');
	};

	return dataFactory;

}]);