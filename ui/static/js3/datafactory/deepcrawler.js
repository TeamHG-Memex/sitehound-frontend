/**
 * Created by tomas on 26/08/17.
 */

var deepcrawlerFactory = ngApp.factory('deepcrawlerFactory',['$http', '$httpParamSerializer',
	function($http, $httpParamSerializer){

	var urlBase = '/api/workspace/{0}/deepcrawl';
	var dataFactory = {};

	dataFactory.publish2DeepCrawl = function(workspaceId, nResults, data){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
        po.selection = data;
		return $http.post(url, po);
	};

	dataFactory.getDomainsByJobId = function (workspaceId, jobId, query) {
		var urlBase = '/api/workspace/{0}/deepcrawl-domains/{1}';
		var url =  String.format(urlBase, workspaceId, jobId);
		var qs = $httpParamSerializer(query);
        return $http.get(url + (qs ? '?' + qs : ""));
    };

	dataFactory.getDeepcrawlDomainById = function (workspaceId, jobId, deepcrawlDomainId, query) {
		var urlBase = '/api/workspace/{0}/deepcrawl-domains/{1}/id/{2}';
		var url =  String.format(urlBase, workspaceId, jobId, deepcrawlDomainId);
		var qs = $httpParamSerializer(query);
        return $http.get(url + (qs ? '?' + qs : ""));
    };

	dataFactory.getDeepcrawlDomainsByDomainName = function (workspaceId, jobId, domainName, query) {
		var urlBase = '/api/workspace/{0}/deepcrawl-domains/{1}/domain-name/{2}';
		var url =  String.format(urlBase, workspaceId, jobId, domainName);
		var qs = $httpParamSerializer(query);
        return $http.get(url + (qs ? '?' + qs : ""));
    };



	return dataFactory;

}]);