ngApp.controller('broadcrawlerController', ['$scope', '$filter', '$location', '$routeParams', '$modal', 'domFactory', 'broadcrawlerFactory', 'eventFactory',
function ($scope, $filter, $location, $routeParams, $modal, domFactory, broadcrawlerFactory, eventFactory){

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	domFactory.highlightNavbar(".navbar-broad-crawl");
	$scope.next = function(){
		domFactory.navigateToJobs();
	};
	$scope.navigateToBroadcrawlResults = function(){
		domFactory.navigateToBroadcrawlResults();
	};
	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	};

    $scope.status = "";
	$scope.loading = false;
	$scope.submittedOk = false;
	$scope.submittedError = false;

	$scope.hideSubmittedOk = function(){
		$scope.submittedOk = false;
	};
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	};

	$scope.categories = [];
	$scope.languages = [];

	$scope.crawlProvider = 'HH_JOOGLE';
	$scope.nResults = "10000000";
	$scope.crawlSource_DD = true;

	// var ticks_label = ["deepest", "deep", "broad","broadest"];
	var ticks_label = ["deep", "N10", "N100", "N1000", "N10000", "broad"];
	var ticks_label = ["deep", "N10", "N100", "N1000", "N10000", "broad"];
	var ticks_scores = ["DEEP", "N10", "N100", "N1000", "N10000", "BROAD"];
	// var ticks_scores = [0, 25, 75, 100];

	// $scope.slider = null;
	// var init = function () {
	// 	if(!$scope.slider){
	// 		$scope.slider = new Slider("#broadcrawlSlider", {
	// 			  ticks: [1, 2, 3, 4],
	// 			  ticks_labels: ticks_label,
	// 			  min: 1,
	// 			  max: 4,
	// 			  step:1,
	// 			  value:3
	// 		});
	// 	}
	// };
	// // adding the timeout so that the page is fully loaded before instatiating the Slider
	// setTimeout(function() {
	// 	init();
	// },50);

    $scope.stopBroadCrawl = function(){
        eventFactory.postDdCrawler($scope.workspaceId, "stop");
    };

	$scope.publish2BroadCrawl = function(){
		var nResults = parseInt($scope.nResults, 10);
		var crawlSources = [];
		crawlSources.push('DD');
		$scope.crawlStatusTimeout = null;
		$scope.slider = window.broadnessSlider;
		var broadness = ticks_scores[$scope.slider.getValue()-1];

		broadcrawlerFactory.publish2BroadCrawl($scope.workspaceId, nResults, $scope.crawlProvider, crawlSources, broadness)
		.success(function(data){
			$scope.getCrawlStatus(data.jobId);
			$scope.status='';
			$scope.submittedOk = true;
			$scope.submittedError = false;
		})
		.error(function(error){
			$scope.status = 'Unable to post the Job. ' + (error.message || error || '');
			$scope.submittedOk = false;
			$scope.submittedError = true;
		})
		.finally(function(){
			$scope.loading = false;
		});
	};

	$scope.getCrawlStatus = function(jobId) {
		clearInterval($scope.crawlStatusTimeout);
		broadcrawlerFactory.getCrawlStatus($scope.workspaceId, jobId)
		.success(function(data){
			$scope.status = 'Data loaded';
			$scope.categories = data.categories;
			$scope.languages = data.languages;
			$scope.nResultsFound = data.nResults;
			$scope.labelCategories = $scope.categories.length > 0 ? 'Categories Found: ' : '' ;
			$scope.labelLanguages = $scope.languages.length > 0 ? 'Languages Found: ' : '' ;
			$scope.labelnResultsFound = $scope.nResultsFound > 0 ? 'Results Found: ' : '' ;

			$scope.crawlStatusTimeout = setTimeout(function() { $scope.getCrawlStatus(data.jobId);}, 5000);

		})
		.error(function(error){
			$scope.crawlStatusTimeout = setTimeout(function() { $scope.getCrawlStatus(data.jobId);}, 5000);
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}


	/**** modal ****/
	$scope.animationsEnabled = true;
	$scope.toggleAnimation = function () {
		$scope.animationsEnabled = !$scope.animationsEnabled;
	};

	$scope.loadModal = function(){

		var nResults = $scope.nResults;
		if(!nResults){
			alert('Please enter the number of URLs to Crawl');
			return false;
		}

		var crawlSources = [];
		crawlSources.push('DD');

		$scope.slider = window.broadnessSlider;

		var args = {};
		args.nResults = $scope.nResults;
		args.crawlProvider = $scope.crawlProvider;
		args.crawlSources = crawlSources;
		args.broadness = ticks_label[$scope.slider.getValue()-1];
		$scope.openModal('default', args);
	};


	$scope.openModal = function (size, args) {

		console.log(args);
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: size,
			resolve: {
				items: function () {
					return args;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
			var jobId = $scope.publish2BroadCrawl();
			console.log('Modal accepted at: ' + new Date());
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};

}]);


var broadcrawlerFactory = ngApp.factory('broadcrawlerFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/broad-crawl';
	var dataFactory = {};

	dataFactory.publish2BroadCrawl = function(workspaceId, nResults, crawlProvider, crawlSources, broadness){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.crawlProvider = crawlProvider;
		po.crawlSources = crawlSources;
		po.broadness = broadness;
		return $http.post(url, po);
	};

	dataFactory.sendCrawlHint = function (workspaceId, url){
		var po = {};
		po.url = url;
		return $http.post(String.format(urlBase, workspaceId) + "-hints", po);
	};

	dataFactory.getCrawlStatus = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url + '/status');
	};

	return dataFactory;

}]);