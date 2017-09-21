var trainerFactory = ngApp.factory('trainerFactory',['$http', '$httpParamSerializer', function($http, $httpParamSerializer){

    var urlBase = '/api/workspace/{0}/dd-trainer';
    var dataFactory = {};

    dataFactory.getProgress = function (workspaceId) {
        var url =  String.format(urlBase, workspaceId)+"/progress";
        return $http.get(url);
	};

    /*
    dataFactory.cancelJob = function (workspaceId, jobId) {
        var url = String.format(urlBase, workspaceId);
        return $http.delete(url + "/" + jobId);
    };
    */
    return dataFactory;
}]);