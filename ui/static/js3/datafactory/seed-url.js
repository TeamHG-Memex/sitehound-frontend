
var seedUrlFactory = ngApp.factory('seedUrlFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/seed-url';
	var dataFactory = {};

//	dataFactory.get = function (workspaceId) {
//		var url =  String.format(urlBase, workspaceId);
//		return $http.get(url);
//	};
	dataFactory.get = function (workspaceId, source, relevance, lastId) {
		var url =  String.format(urlBase, workspaceId);
		po = {};
		po.relevance = relevance;
		po.lastId = lastId;
		return $http.post(url + '/' + source, po);
	};


	dataFactory.update = function(workspaceId, id, relevance){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.relevance = relevance
		console.log("id: " + id + " , relevance: " + relevance);
		return $http.put(url + "/url/" + id, po);
	};

	dataFactory.generate = function(workspaceId, nResults, crawlProvider, crawlSources) {
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.crawlProvider = crawlProvider;
		po.crawlSources = crawlSources;
		return $http.post(url + '/generation', po);
	};

	dataFactory.delete = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + "/url/" + id);
	};

//	return dataFactory;
//}]);
//
//
//var seedUrlSourceFactory = ngApp.factory('seedUrlSourceFactory',['$http', function($http){

//	var seedUrlGenerationUrlBase = '/api/seed-url/generation';
//	var seedUrlBase = '/api/seed-url' ;
//	var dataFactory = {};


	dataFactory.resetResults = function(workspaceId, source){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + '/generation/' + source);
	}



	dataFactory.getAggregated = function (workspaceId) {
		var url =  String.format(urlBase+'/aggregated', workspaceId);
		return $http.get(url);
	};
	return dataFactory;
}]);
