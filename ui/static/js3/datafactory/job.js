
var jobFactory = ngApp.factory('jobFactory',['$http', function($http){

    var urlBase = '/api/workspace/{0}/job';
    var dataFactory = {}

    dataFactory.getJobs = function (workspaceId) {
        var url =  String.format(urlBase, workspaceId);
        return $http.get(url);
    };

    dataFactory.cancelJob = function (workspaceId, jobId) {
        var url = String.format(urlBase, workspaceId);
        return $http.delete(url + "/" + jobId);
    };

    return dataFactory;
}]);


