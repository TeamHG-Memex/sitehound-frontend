var eventFactory = ngApp.factory('eventFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/event/{1}';
	var dataFactory = {};

//    action: "start" or "stop"
    dataFactory.postDdModeler = function(workspaceId, action){
	    var event = "dd-modeler";
	    dataFactory.postEvent(workspaceId, event, action);
    };

	dataFactory.postDdTrainer = function (workspaceId, action) {
	    var event = "dd-trainer";
	    dataFactory.postEvent(workspaceId, event, action);
	};

	dataFactory.postDdCrawler = function (workspaceId, action) {
	    var event = "dd-crawler";
	    dataFactory.postEvent(workspaceId, event, action);
	};

	dataFactory.postDdCrawler = function (workspaceId, action) {
	    var event = "dd-crawler";
	    dataFactory.postEvent(workspaceId, event, action);
	};


	dataFactory.postEvent = function (workspaceId, event, action) {
		var url =  String.format(urlBase, workspaceId, event);
	    var po = {};
	    po.action = action;
        po.event = event;
		return $http.post(url, po);
	};

	return dataFactory;
}]);

