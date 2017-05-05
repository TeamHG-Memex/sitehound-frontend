ngApp.controller('broadcrawlerController', ['$scope', '$filter', '$location', '$routeParams', '$modal', 'domFactory', 'broadcrawlerFactory', 'eventFactory',
function ($scope, $filter, $location, $routeParams, $modal, domFactory, broadcrawlerFactory, eventFactory){

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	domFactory.highlightNavbar(".navbar-broad-crawl");
	$scope.next = function(){
		domFactory.navigateToJobs();
	}
	$scope.navigateToBroadcrawlResults = function(){
		domFactory.navigateToBroadcrawlResults();
	}


	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}


    $scope.status = "";
	$scope.loading = false;
	$scope.submittedOk = false;
	$scope.submittedError = false;

	$scope.hideSubmittedOk = function(){
		$scope.submittedOk = false;
	}
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	}

	$scope.categories = [];
	$scope.languages = [];

	$scope.crawlProvider = 'HH_JOOGLE';
	$scope.nResults = "100";
	$scope.crawlSource_SE = false;
	$scope.crawlSource_TOR = false;
	$scope.crawlSource_DD = true;

    $scope.stopBroadCrawl = function(){
        eventFactory.postDdCrawler($scope.workspaceId, "stop");
    };

	$scope.publish2BroadCrawl = function(){
		var nResults = parseInt($scope.nResults, 10);
		var crawlSources = [];

		if($scope.crawlSource_SE){
			crawlSources.push('SE');
		}
		if($scope.crawlSource_TOR){
			crawlSources.push('TOR');
		}
		if($scope.crawlSource_DD){
			crawlSources.push('DD');
		}

		var domainTypes = [];
		
		$scope.crawlStatusTimeout = null;

		broadcrawlerFactory.publish2BroadCrawl($scope.workspaceId, nResults, $scope.crawlProvider, crawlSources)
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
	}

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
		if($scope.crawlSource_SE){
			crawlSources.push('SE');
		}
		if($scope.crawlSource_TOR){
			crawlSources.push('TOR');
		}
		if($scope.crawlSource_DD){
			crawlSources.push('DD');
		}

		if(crawlSources.length==0){
			alert('Please select at least one Source');
			return false;
		}

		var args = {};
		args.nResults = $scope.nResults;
		args.crawlProvider = $scope.crawlProvider;
		args.crawlSource_SE = $scope.crawlSource_SE;
		args.crawlSource_TOR = $scope.crawlSource_TOR;
		args.crawlSource_DD = $scope.crawlSource_DD;
		args.crawlSources = crawlSources;
		$scope.openModal('default', args);
	}


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

