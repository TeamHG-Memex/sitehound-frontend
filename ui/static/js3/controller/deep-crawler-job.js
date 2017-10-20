ngApp.controller('deepcrawlerController', ['$scope', '$filter', '$rootScope', '$timeout', '$interval', '$routeParams', 'deepcrawlerFactory', 'loginFactory', '$mdDialog',
function ($scope, $filter, $rootScope, $timeout, $interval, $routeParams, deepcrawlerFactory, loginFactory, $mdDialog) {

    console.log("loading deepcrawler");

    $scope.master.init();

    $scope.jobId = $routeParams.jobId;

    $scope.elems=[];
    // $scope.lastId=null;

    /** Begins results */

    $scope.crawlJob = {};
    $scope.showProgress=false;

    $scope.filters = {};

    function fetch(){
        var filters = {};

        console.log("fetching deepcrawler-job");

        $scope.showProgress=true;

        deepcrawlerFactory.getDomainsByJobId($scope.master.workspaceId, $scope.jobId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls (deep-crawler-job)");
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

    $scope.stop = function(){
        deepcrawlerFactory.stop()
        .then(
            function(response){
                console.log(response.data);
                alert(response.data["message"]);
            },
            function(response){
                console.log(response.data);
            }
        );
    };

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

    var isRunning = false;
    function backgroundService(){
        if(!isRunning && $scope.master.workspaceId){
            isRunning = true;
            // if($scope.elems.length<1) {
                fetch();
            // }
            $interval.cancel($rootScope.backgroundDeepCrawlJobServicePromise);
            $rootScope.backgroundDeepCrawlJobServicePromise = $interval(backgroundService, 5000);
            isRunning=false;
        }
    }

    backgroundService();

    $scope.$on('$locationChangeStart', function(event) {
        console.log("$locationChangeStart");
        $interval.cancel($rootScope.backgroundDeepCrawlJobServicePromise);
        console.log("canceled backgroundDeepCrawlJobServicePromise");
    });

}]);
