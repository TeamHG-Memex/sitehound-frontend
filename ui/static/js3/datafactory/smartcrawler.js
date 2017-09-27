var smartCrawlerFactory = ngApp.factory('smartCrawlerFactory',['$http', '$httpParamSerializer',
	function($http, $httpParamSerializer){

	var urlBase = '/api/workspace/{0}/smart-crawler';
	var dataFactory = {};

	dataFactory.start = function(workspaceId, nResults, broadness){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.broadness = broadness;
		return $http.post(url, po);
	};

	dataFactory.getResults = function(workspaceId, jobId, query){
		var url =  String.format(urlBase, workspaceId);
		var qs = $httpParamSerializer(query);
        return $http.get(url + '/'+ jobId +'/results' + (qs ? '?' + qs : ""));
	};

	return dataFactory;

}]);