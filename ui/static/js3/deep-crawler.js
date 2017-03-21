var deepcrawlerFactory = ngApp.factory('deepcrawlerFactory',['$http', function($http){

	var urlBase = '/api/deep-crawl';
	var dataFactory = {};

	dataFactory.getConfig = function () {
		var url =  urlBase + "/config";
		return $http.get(url);
	};


	dataFactory.send = function (url){
		var po = {};
		po.domain = url;
		return $http.post(urlBase, po);
	}

	return dataFactory;
}]);

/*
var deepCrawlerFactory = ngApp.factory('deepCrawlerFactory',['$http', function($http){

	var urlBase = '/api/deep-crawl';
	var dataFactory = {};


	return dataFactory;
}]);
*/