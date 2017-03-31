
var workspaceFactory = ngApp.factory('workspaceFactory',['$http', function($http){

	var urlBase = '/api/workspace';
	var dataFactory = {}

	dataFactory.getWorkspaces = function () {
		return $http.get(urlBase);
	};

	dataFactory.getWorkspace = function (id) {
		return $http.get(urlBase + '/' + id);
	};

	dataFactory.add = function (workspace) {
		return $http.post(urlBase, workspace);
	};

	dataFactory.deleteWorkspace = function (id) {
		return $http.delete(urlBase + '/' + id);
	};

	return dataFactory;
}]);




var workspaceSelectedService =  ngApp.factory('workspaceSelectedService', [ '$cookies', function($cookies){

    var dataFactory = {}
    var selectedWorkspace = null;

    dataFactory.setSelectedWorkspace = function(workspace){
        selectedWorkspace = workspace;
        $cookies.put("workspaceId", workspace._id);
    }

    dataFactory.getSelectedWorkspace = function(){
        return selectedWorkspace;
    }

    dataFactory.getSelectedWorkspaceId = function(){
        var workspaceId;
        if(selectedWorkspace==null){
            workspaceId = $cookies.get("workspaceId");
        }
        else{
            workspaceId = selectedWorkspace._id
        }
        return workspaceId;
    }

    return dataFactory;
}]);