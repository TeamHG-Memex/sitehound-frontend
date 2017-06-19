var eventFactory = ngApp.factory('eventFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/event/{1}';
	var dataFactory = {};

//    action: "start" or "stop"
    dataFactory.postDdModeler = function(workspaceId, action){
	    var event = "dd-modeler";
	    dataFactory.postEvent(workspaceId, event, action);
    };

	dataFactory.postDdTrainer = function (workspaceId, action, jobId) {
	    var event = "dd-trainer";
	    var arguments = {};
	    arguments["jobId"]= jobId;
	    dataFactory.postEvent(workspaceId, event, action, arguments);
	};

	dataFactory.postDdCrawler = function (workspaceId, action) {
	    var event = "dd-crawler";
	    dataFactory.postEvent(workspaceId, event, action);
	};

	dataFactory.postDdCrawler = function (workspaceId, action) {
	    var event = "dd-crawler";
	    dataFactory.postEvent(workspaceId, event, action);
	};


	dataFactory.postEvent = function (workspaceId, event, action, arguments) {
		var url =  String.format(urlBase, workspaceId, event, arguments);
	    var po = {};
	    po.action = action;
        po.event = event;
        po.arguments = arguments;
		return $http.post(url, po);
	};

	return dataFactory;
}]);

