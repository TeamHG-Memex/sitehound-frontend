
var seedUrlFactory = ngApp.factory('seedUrlFactory',['$http', '$httpParamSerializer', function($http, $httpParamSerializer){

	var urlBase = '/api/workspace/{0}/seed-url';
	var dataFactory = {};

	dataFactory.get = function (workspaceId, filters) {
		var url =  String.format(urlBase, workspaceId);
		var qs = $httpParamSerializer(filters);
		return $http.get(url + (qs ? '?' + qs : ""));
	};

	dataFactory.getAllLabeled = function (workspaceId, filters) {
		var url =  String.format(urlBase, workspaceId) + "/all-labeled";
		var qs = $httpParamSerializer(filters);
		return $http.get(url + (qs ? '?' + qs : ""));
	};

	dataFactory.getToDeepCrawl = function (workspaceId, filters) {
		var url =  String.format(urlBase, workspaceId) + "/to-deep-crawl";
		var qs = $httpParamSerializer(filters);
		return $http.get(url + (qs ? '?' + qs : ""));
	};

	dataFactory.getSeedResults = function (workspaceId, filters) {
		var url =  String.format(urlBase, workspaceId) + "/keywords-results";
		var qs = $httpParamSerializer(filters);
        return $http.get(url + (qs ? '?' + qs : ""));
	};

	dataFactory.update = function(workspaceId, id, relevance, categories, udc){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.relevance = relevance;
		po.categories = categories;
		po.udc = udc;
//		console.log("id: " + id + " , relevance: " + relevance);
		return $http.put(url + "/url/" + id, po);
	};

	dataFactory.label = function(workspaceId, id, relevance){
		var urlBase = '/api/workspace/{0}/label';
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.relevance = relevance;
		// po.categories = categories;
		// po.udc = udc;
//		console.log("id: " + id + " , relevance: " + relevance);
		return $http.put(url + "/url/" + id, po);
	};

	dataFactory.delete = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + "/url/" + id);
	};

// Moved to fetch-service
	dataFactory.getAggregated = function (workspaceId) {
		var url =  String.format(urlBase+'/aggregated', workspaceId);
		return $http.get(url);
	};

	dataFactory.getAggregatedToDeepCrawl = function (workspaceId) {
		var url =  String.format(urlBase+'/aggregated/to-deep-crawl', workspaceId);
		return $http.get(url);
	};


	return dataFactory;
}]);
