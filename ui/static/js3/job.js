ngApp.controller('jobController', ['$scope', '$filter', '$routeParams', '$location', '$interval', 'jobFactory', 'domFactory',
	function ($scope, $filter, $routeParams, $location, $interval, jobFactory, domFactory) {

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	$scope.jobId = $routeParams.jobId;

	$scope.next = function(){
		domFactory.navigateToBroadcrawlResults();
	}
	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}


	$scope.cancelJob = function(jobId){
		jobFactory.cancelJob($scope.workspaceId, jobId)
			.success(function () {
				console.log(jobId + "was canceled");
				$scope.getJobs();
			})
			.error(function (error) {
				$scope.status = 'Unable to cancel job: ' + error.message;
			});
	}

	function setSelectedJob(jobId){
		angular.forEach($scope.jobs, function(elem, index){
			if(elem._id == jobId){
				elem.selected = true;
			}
			else{
				elem.selected = false;
			}
		});
	}

	$scope.getJobs = function() {
		jobFactory.getJobs($scope.workspaceId)
			.success(function (data) {
				$scope.jobs = $.parseJSON(data);
				setSelectedJob($scope.jobId);
			})
			.error(function (error) {
				$scope.status = 'Unable to load jobs: ' + error.message;
			});
	}

	$scope.getJobs();

}]);
//.directive('workspace-row', function () {
//	return {
//	restrict : 'C',
//		link: function(scope, element) {
//			console.log(element);
//			element.bind("click" , function(e){
//				 element.parent().find("tr").removeClass("job-row-selected");
//				 element.addClass("job-row-selected").removeClass("job-row-even");
//			});
//		}
//	}
//});
//


