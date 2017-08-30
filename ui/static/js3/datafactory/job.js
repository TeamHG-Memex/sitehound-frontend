
var jobFactory = ngApp.factory('jobFactory',['$http', '$httpParamSerializer', function($http, $httpParamSerializer){

    var urlBase = '/api/workspace/{0}/job';
    var dataFactory = {}

    // dataFactory.getJobs = function (workspaceId) {
    //     var url =  String.format(urlBase, workspaceId);
    //     return $http.get(url);
    // };

    dataFactory.get = function (workspaceId, query) {
        var url =  String.format(urlBase, workspaceId);
        var qs = $httpParamSerializer(query);
        return $http.get(url + (qs ? '?' + qs : ""));
	};

    dataFactory.cancelJob = function (workspaceId, jobId) {
        var url = String.format(urlBase, workspaceId);
        return $http.delete(url + "/" + jobId);
    };

    return dataFactory;
}]);


