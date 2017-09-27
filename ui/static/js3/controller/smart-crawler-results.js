ngApp.controller('smartCrawlerResultsController', ['$scope', '$routeParams', 'smartCrawlerFactory', 'jobFactory',
    function ($scope, $routeParams, smartCrawlerFactory, jobFactory) {

    $scope.master.init();

    $scope.jobId = $routeParams.jobId;

    function getCurrentJob(){
        jobFactory.getById($scope.master.workspaceId, $scope.jobId)
        .then(
            function(response){
                console.log(response.data);
                $scope.crawlJob = response.data;
            },
		    function(){}
        );
    }

    getCurrentJob();

}]);

