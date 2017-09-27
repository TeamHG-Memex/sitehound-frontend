var smartCrawlerFactory = ngApp.factory('smartCrawlerFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/smart-crawler';
	var dataFactory = {};

	dataFactory.start = function(workspaceId, nResults, broadness){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.broadness = broadness;
		return $http.post(url, po);
	};

	dataFactory.getProgress = function(workspaceId, jobId){
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url + '/'+ jobId +'/progress');
	};

	return dataFactory;

}]);