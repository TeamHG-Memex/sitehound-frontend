/**
 * Created by tomas on 26/08/17.
 */

var deepcrawlerFactory = ngApp.factory('deepcrawlerFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/deepcrawl';
	var dataFactory = {};

	dataFactory.publish2DeepCrawl = function(workspaceId, nResults, data){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
        po.selection = data;
		return $http.post(url, po);
	};

	/*
	dataFactory.getCrawlStatus = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url + '/status');
	};
    */

	return dataFactory;

}]);