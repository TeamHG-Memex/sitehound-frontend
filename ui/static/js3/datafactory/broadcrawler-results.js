var broadcrawlerResultsFactory = ngApp.factory('broadcrawlerResultsFactory',['$http', function($http){

//	var broadcrawlerResultsBase = '/api/broad-crawl-results';
	var urlBase = '/api/workspace/{0}/broad-crawl-results';
	var dataFactory = {};

	// dataFactory.search = function(workspaceId, searchText, languages, categories, isPinned, lastId, maxId, jobId, pageNumber){
	// dataFactory.search = function(workspaceId, searchText, languages, categories, isPinned, lastId, maxId){
    // dataFactory.search = function(workspaceId, searchText, languages, categories, isPinned, lastId, maxId, pageNumber){
    dataFactory.search = function(workspaceId, searchText, filters, isPinned, lastId, maxId, pageNumber){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.searchText = searchText;
		po.languages = filters.languages;
		po.categories = filters.categories;
		po.isPinned = isPinned;
		po.lastId = lastId;
		po.maxId = maxId;
//		po.jobId = jobId;
		po.pageNumber = pageNumber;
		return $http.post(url, po);
	};

	dataFactory.remove = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + "/" + id);
	};

	return dataFactory;
}]);


var broadcrawlerResultsSummaryFactory = ngApp.factory('broadcrawlerResultsSummaryFactory',['$http', '$httpParamSerializer',
	function($http, $httpParamSerializer){

    var urlBase = "/api/workspace/{0}/broad-crawl-results-summary";
    var dataFactory = {};

    dataFactory.get = function(workspaceId, query){

        var url =  String.format(urlBase, workspaceId);
        var qs = $httpParamSerializer(query);
        return $http.get(url + (qs ? '?' + qs : ""));


//         var po = {};
//         po.searchText = searchText;
//         po.languages = filters.languages;
//         po.categories = filters.categories;
//         po.isPinned = isPinned;
//         po.lastId = lastId;
//         po.maxId = maxId;
// //		po.jobId = jobId;
//         po.pageNumber = pageNumber;
//         return $http.post(url, po);
    };

    // dataFactory.remove = function(workspaceId, id){
    //     var url =  String.format(urlBase, workspaceId);
    //     return $http.delete(url + "/" + id);
    // };

    return dataFactory;
}]);



var bookmarkFactory = ngApp.factory('bookmarkFactory', ['$http', function($http){
//	var broadcrawlerBookmarkBase = '/api/broad-crawl-results/bookmark';
	var urlBase = '/api/workspace/{0}/broad-crawl-results/bookmark';
	var dataFactory = {};

	dataFactory.bookmark = function(workspaceId, id, isPinned){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.isPinned = isPinned;
		return $http.put(url + "/" + id, po);
	}

	return dataFactory;
}]);
