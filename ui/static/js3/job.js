ngApp.controller('jobController', ['$scope', '$filter', '$routeParams', '$location', '$interval', 'jobFactory', 'domFactory',
	function ($scope, $filter, $routeParams, $location, $interval, jobFactory, domFactory) {

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	$scope.jobId = $routeParams.jobId;

	$scope.next = function(){
		domFactory.navigateToBroadcrawlResults();
	};

	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	};

	$scope.cancelJob = function(jobId){
		jobFactory.cancelJob($scope.workspaceId, jobId)
			.success(function () {
				console.log(jobId + "was canceled");
				$scope.getJobs();
			})
			.error(function (error) {
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
	};

	$scope.getJobs();

}]);


var jobFactory = ngApp.factory('jobFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/job';
	var dataFactory = {};

	dataFactory.getJobs = function (workspaceId) {
	var url =  String.format(urlBase, workspaceId);
		return $http.get(url);
	};

	dataFactory.cancelJob = function (workspaceId, jobId) {
	var url = String.format(urlBase, workspaceId);
		return $http.delete(url + "/" + jobId);
	};

    /**
	 * sources []: SE, DD,
	 * provider: always HH_JOOGLE
	 * crawlType KEYWORDS, BROADCRAWL, DD-TRAINER
	 * nResults: defaults to 30
     */
	dataFactory.createJob = function(workspaceId, sources, crawlType, nResults){
	var url = String.format(urlBase, workspaceId);
		var po = {};
		po.provider = 'HH_JOOGLE';
		po.sources = sources;
		po.crawlType = crawlType;
		po.nResults = nResults;
		return $http.post(url, po);
	};

	return dataFactory;
}]);


