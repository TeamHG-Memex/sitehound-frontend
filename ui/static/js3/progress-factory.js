var progressFactory = ngApp.factory('progressFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/{1}/progress';
	var dataFactory = {};

    dataFactory.getModelerProgress = function (workspaceId){
        var phase = "dd-modeler";
		return dataFactory.getProgress(workspaceId, phase);
    }

    dataFactory.getTrainerProgress = function (workspaceId){
        var phase = "dd-trainer";
		return dataFactory.getProgress(workspaceId, phase);
    }

    dataFactory.getCrawlerProgress = function (workspaceId){
        var phase = "dd-crawler";
		return dataFactory.getProgress(workspaceId, phase);
    }

    dataFactory.getProgress = function (workspaceId, phase){
		var url =  String.format(urlBase, workspaceId, phase);
		return $http.get(url);
    }


    dataFactory.getAllProgress = function (workspaceId){
    	var urlBase = '/api/workspace/{0}/progress';
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url);
    }

	return dataFactory;

}]);


