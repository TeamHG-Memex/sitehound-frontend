var seedFactory = ngApp.factory('seedFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/seed';
	var dataFactory = {};

	dataFactory.get = function (workspaceId) {
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url);
	};

	dataFactory.save = function (workspaceId, word, score) {
		var url =  String.format(urlBase, workspaceId);
		var word = word.replace(',', '');
		var po = {};
		po.word = word;
		po.score = score;
		return $http.post(url, po);
	};

	dataFactory.delete = function (workspaceId, hash) {
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + '/' + hash );
	};

	return dataFactory;
}]);
