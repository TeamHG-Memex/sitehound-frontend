var modelerFactory = ngApp.factory('modelerFactory',['$http', '$httpParamSerializer', function($http, $httpParamSerializer){

    var urlBase = '/api/workspace/{0}/dd-modeler';
    var dataFactory = {};

    dataFactory.getProgress = function (workspaceId) {
        var url =  String.format(urlBase, workspaceId)+"/progress";
        return $http.get(url);
	};

    //TODO add stop trainer!!!!

    return dataFactory;
}]);