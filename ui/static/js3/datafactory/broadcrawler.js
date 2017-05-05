
var broadcrawlerFactory = ngApp.factory('broadcrawlerFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/broad-crawl';
	var dataFactory = {};

	dataFactory.publish2BroadCrawl = function(workspaceId, nResults, crawlProvider, crawlSources){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.crawlProvider = crawlProvider;
		po.crawlSources = crawlSources;
		return $http.post(url, po);
	};

	dataFactory.getCrawlStatus = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url + '/status');
	}

	return dataFactory;

}]);