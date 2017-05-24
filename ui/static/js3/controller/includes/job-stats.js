ngApp.controller('jobStatsController', ['$scope', '$filter', '$routeParams', '$location', '$interval', 'jobFactory', 'domFactory',
    function ($scope, $filter, $routeParams, $location, $interval, jobFactory, domFactory) {

        // $scope.workspaceId = $routeParams.workspaceId;
        // domFactory.setWorkspaceName($scope.workspaceId);
        //
        // $scope.jobId = $routeParams.jobId;
        //
        // $scope.next = function(){
        //     domFactory.navigateToBroadcrawlResults();
        // };
        // $scope.navigateToDashboard = function(){
        //     domFactory.navigateToDashboard();
        // };

        $scope.jobId;

        $scope.workspaceId = $scope.master.workspaceId;
        $scope.master.init();

        $scope.cancelJob = function(jobId){
            jobFactory.cancelJob($scope.workspaceId, jobId).then(
                function () {
                    console.log(jobId + "was canceled");
                    $scope.getJobs();
                },
                function (error) {
                    $scope.status = 'Unable to cancel job: ' + error.message;
                });
        };

        function setSelectedJob(jobId){
            angular.forEach($scope.jobs, function(elem, index){
                if(elem._id == jobId){
                    elem.selected = true;
                }
                else{
                    elem.selected = false;
                }
            });
        };

        $scope.getJobs = function() {
            jobFactory.getJobs($scope.workspaceId).then(
                function (response) {
                    // $scope.jobs = $.parseJSON(response.data);
                    $scope.jobs = response.data;
                    setSelectedJob($scope.jobId);
                },
                function (error) {
                    $scope.status = 'Unable to load jobs: ' + error.message;
                });
        };

        $scope.getJobs();

    }]);
