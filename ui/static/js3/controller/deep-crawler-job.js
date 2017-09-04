/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('deepcrawlerController', ['$scope', '$filter', '$routeParams', 'deepcrawlerFactory', 'loginFactory', '$mdDialog',
function ($scope, $filter, $routeParams, deepcrawlerFactory, loginFactory, $mdDialog) {

    $scope.jobId = $routeParams.jobId;

    $scope.elems=[];
    // $scope.lastId=null;

    /** Begins results */

    $scope.crawlJob = {};
    $scope.showProgress=false;

    $scope.filters = {};

    $scope.fetch = function(){
        fetch();
    };

    function fetch(){
        var filters = {};

        $scope.showProgress=true;

        deepcrawlerFactory.getDomainsByJobId($scope.master.workspaceId, $scope.jobId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				$scope.crawlJob = response.data;

				$scope.crawlJob["pagesFetched"]=0;
				$scope.crawlJob["status"]=$scope.crawlJob["status"];
				$scope.crawlJob["rpm"]=0;

				if(response.data["progress"]){
				    $scope.crawlJob["pagesFetched"]=response.data["progress"]["pagesFetched"];
                    $scope.crawlJob["status"]=response.data["progress"]["status"];
                    $scope.crawlJob["rpm"]=response.data["progress"]["rpm"];

				    if(response.data["progress"]["domains"]){
				        var tempResults = response.data["progress"]["domains"];
				        $scope.elems = tempResults;
                    }
                }
                $scope.showProgress=false;
			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }

//    $scope.showAdvanced = function(elem, ev) {
    $scope.showEnterCredentialsForm = function(elem, ev) {

    	elem.workspaceId = $scope.master.workspaceId;

        $mdDialog.show({
            controller: 'myDialogController',
            locals:{item: elem},
            templateUrl: 'static/partials-md/templates/enter-credentials-form.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
        .then(function(answer) {
            console.log('You said the information was "' + answer + '".');
            if(answer){
                sendCredentials(elem);
            }
        }, function() {
            console.log('You cancelled the dialog.');
        });
    };

    function sendCredentials(elem){
        loginFactory.sendCredentials(elem.workspaceId, elem.credentials);
    }

    fetch();
}]);
