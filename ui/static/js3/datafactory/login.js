/**
 * Created by tomas on 4/09/17.
 */

var loginFactory = ngApp.factory('loginFactory',['$http', '$httpParamSerializer', function($http, $httpParamSerializer) {

    var urlBase = '/api/workspace/{0}/login';
    var dataFactory = {};

    dataFactory.sendCredentials = function (workspaceId, credentials) {
        var url = String.format(urlBase, workspaceId);
        var po = {};
        po["credentials"] = credentials;
        return $http.post(url + "/" + credentials["_id"], po);
    };

    return dataFactory;

}]);

