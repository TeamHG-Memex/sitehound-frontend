ngApp.controller('seedUrlSourceController', ['$scope', '$rootScope', '$filter', '$modal', '$routeParams', '$interval', '$timeout', 'domFactory', 'seedFactory', 'seedUrlFactory', 'deepcrawlerFactory', 'eventFactory', 'progressFactory',
function ($scope, $rootScope, $filter, $modal, $routeParams, $interval, $timeout, domFactory, seedFactory, seedUrlFactory, deepcrawlerFactory, eventFactory, progressFactory){



    $scope.workspaceId = $routeParams.workspaceId;
	$scope.source = $routeParams.source;
	domFactory.setWorkspaceName($scope.workspaceId);
    //
    // $scope.startDdModeler = function(){
    //     eventFactory.postDdModeler($scope.workspaceId, "start");
    // };
    //
    // $scope.startDdTrainer = function(){
    //     eventFactory.postDdTrainer($scope.workspaceId, "start");
    // };
    //
    // $scope.stopDdTrainer = function(){
    //     eventFactory.postDdTrainer($scope.workspaceId, "stop");
    // };
    //
    // $scope.postDdCrawler = function(){
    //     eventFactory.postDdCrawler($scope.workspaceId, "stop");
    // };


	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	};
    //
    //
    //
    // $scope.modelerProgress = [];
    // $scope.getModelerProgress = function(workspaceId){
     //    progressFactory.getModelerProgress(workspaceId)
	// 	.success(function (data) {
     //        $scope.modelerProgress = data;
     //    })
	// 	.error(function (error) {
	// 		$scope.status = 'Unable to load data: ' + error.message;
     //    })
	// 	.finally(function(){
	// 		$scope.loading = false;
	// 	});
    // }
    //
    // $scope.getModelerProgress($scope.workspaceId);
    // $interval.cancel($rootScope.modelerPromise);
    // $rootScope.modelerPromise = $interval($scope.getModelerProgress, 5000, 0, true, $scope.workspaceId);
    //
    //
    // $scope.trainerProgress = "";
    // $scope.getTrainerProgress = function(workspaceId){
     //    progressFactory.getTrainerProgress(workspaceId)
	// 	.success(function (data) {
     //        $scope.trainerProgress = data;
     //    })
	// 	.error(function (error) {
	// 		$scope.status = 'Unable to load data: ' + error.message;
     //    })
	// 	.finally(function(){
	// 		$scope.loading = false;
	// 	});
    // };
    //
    // $scope.getTrainerProgress($scope.workspaceId);
    // $interval.cancel($rootScope.trainerPromise);
    // $rootScope.trainerPromise = $interval($scope.getTrainerProgress, 5000, 0, true, $scope.workspaceId);
    //
    //
    // $scope.trainTheModelInRealTime = function(){
     //    console.log('navigating');
     //    domFactory.navigateToDDtraining();
    // };
    //
    //
	// $scope.checkFetchRunning = false;
    //
	// domFactory.highlightNavbar(".navbar-seed-url");
    //
	// $scope.next = function(){
	// 	domFactory.navigateToBroadcrawlNew();
	// }

	//pagination
	$scope.seedUrls = [];
	$scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;
	$scope.crawlStatusBusy = false;

	$scope.submittedOk = false;
	$scope.submittedError = false;

	$scope.hideSubmittedOk = function(){
		$scope.submittedOk = false;
	}
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	}

	$scope.errorMessageDefault = 'Please check your connection and contact and administrator.'

	function getSeeds(){
		seedFactory.get($scope.workspaceId)
		.success(function (data) {
			var words = data;
			$scope.words = words || [];
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		})
		.finally(function(){
//			$scope.loading = false;
		});
	}

	function getSeedUrls(){
		$scope.loading = true;
		$scope.errorMessage = "";
		$scope.crawlStatusBusy=true;
		seedUrlFactory.get($scope.workspaceId, $scope.source, getRelevanceSearchObject(), $scope.lastId)
		.success(function (data) {
			console.log("finish fetching seed Urls");
//			$scope.seedUrls = $.parseJSON(data);
			var tempResults = data;
			Array.prototype.push.apply($scope.seedUrls, tempResults);
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
			loadWordScore();
			$scope.crawlStatusBusy=false;
			$scope.loading = false;
		})
		.error(function (error) {
			$scope.errorMessage = error.message;
			$scope.crawlStatusBusy=false;
			$scope.loading = false;
		})
//		.finally(function(){
//		});
	}

	function loadWordScore(){
		console.log("loading word score");
		var i=0;
		angular.forEach($scope.seedUrls, function(seedUrl) {
			var wordWithScores = [];
			angular.forEach(seedUrl.words, function(word) {
				var score = $scope.evaluateWord(word)
				var hash = $scope.makeHash(word);
				var wordWithScore = {'name':word, 'score': score, 'hash': hash};
				wordWithScores.push(wordWithScore);
			});
			$scope.seedUrls[i].wordWithScores = wordWithScores;
			i++;
		});
	}


	$scope.makeHash = function (text){
//		return text.substring(0,2);
		return text;
	}

	$scope.evaluateWord = function(word){
		var score = 0;
		angular.forEach($scope.words, function(reviewedWord) {
			if(word==reviewedWord.word){
				score = reviewedWord.score;
			}
		});
		return score;
	}

	$scope.wordsQuantityToShow = 10;

	$scope.generateSeedUrls = function(){
		$scope.errorMessage = "";
		$scope.loading = true;

		var nResults = 30;
		var crawlProvider = "HH_JOOGLE";
		var crawlSources = [];
		if($scope.source == 'searchengine'){
			crawlSources.push('SE');
		}
		else if($scope.source == 'twitter'){
			crawlSources.push('TWITTER');
		}
		else if($scope.source == 'tor'){
			crawlSources.push('TOR');
		}
		else if($scope.source == 'deepdeep'){
			crawlSources.push('DD');
		}
		seedUrlFactory.generate($scope.workspaceId, nResults, crawlProvider, crawlSources)
		.success(function (data) {
			$scope.submittedOk = true;
			$scope.submittedError = false;
			checkFetch();
		})
		.error(function (error) {
			$scope.errorMessage = error.message;
			$scope.submittedOk = false;
			$scope.submittedError = true;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	$scope.getSeedUrls = function(){
		getSeedUrls();
	}

	$scope.isSearchEngine = function(seedUrl) {
		return seedUrl.crawlEntityType === 'BING' || seedUrl.crawlEntityType === 'GOOGLE' ;
	};

	$scope.relevancyFilter = 'ALL';
	$scope.relevancyFilter_Neutral=true;
	$scope.relevancyFilter_Relevant=true;
	$scope.relevancyFilter_Irrelevant=true;

	$scope.relevancy = function(seedUrl) {
		return (
			(seedUrl.relevant == null && $scope.relevancyFilter_Neutral) ||
			(seedUrl.relevant == true && $scope.relevancyFilter_Relevant) ||
			(seedUrl.relevant == false && $scope.relevancyFilter_Irrelevant)
		);
	}


	$scope.resetResults = function(){
		var confirmed = confirm('Are you sure you want to remove all the existing results?');
		if (!confirmed){
			return;
		}

		$scope.loading = true;
		seedUrlFactory.resetResults($scope.workspaceId, $scope.source)
		.success(function (data) {
			$scope.seedUrls = [];
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		})
		.finally(function(){
			$scope.loading = false;
//			checkFetch();
		});
	}

	$scope.reloadResults = function(){
		getSeedUrls();
	}

	$scope.fetch = function(){
		if($scope.crawlStatusBusy){
			console.log('busy');
			return;
		}
		console.log('fetch triggered');
		getSeedUrls()
	}

	function getRelevanceSearchObject(){
		var relevanceSearchObject = {};
		relevanceSearchObject.neutral = $scope.relevancyFilter_Neutral;
		relevanceSearchObject.relevant = $scope.relevancyFilter_Relevant;
		relevanceSearchObject.irrelevant = $scope.relevancyFilter_Irrelevant;
		return relevanceSearchObject;
	}


	$scope.deletedFilter = function(seedUrl){
		return !seedUrl.deleted; //|| seedUrl.deleted == true;
	}

	$scope.onWordScoreUpdated = function(word){
//		$scope.loading = true;
		seedFactory.save($scope.workspaceId, word.name, word.score)
		.success(function (data) {
			seedFactory.get($scope.workspaceId)
				.success(function (data) {
					var words = data;
					$scope.words = words || [];
					loadWordScore();
				})
				.error(function (error) {
					$scope.status = 'Unable to load data: ' + error.message;
				})
				.finally(function(){
//					$scope.loading = false;
				});
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		})
		.finally(function(){
//			$scope.loading = false;
		});
	}

	$scope.onSeedUrlUpdated = function(id, relevance){
	console.log(relevance);
		seedUrlFactory.update($scope.workspaceId, id, relevance)
		.success(function (data) {
			console.log('updated');
			$scope.seedUrls
			angular.forEach($scope.seedUrls, function(seedUrl) {
				if(seedUrl._id == id){
					seedUrl.relevant = relevance;
					return;
				}
			});
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	$scope.deepCrawl = function(result){
		console.log('deepcrawling: ' + result.url);
		deepcrawlerFactory.send(result.url)
		.success(function(data){
			$scope.status = 'Data loaded';
			console.log("post to arachnado sent succesfully.");
			window.open('http://' + data.ARACHNADO_HOST_NAME +':' + data.ARACHNADO_HOST_PORT,'arachnado').focus()
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	$scope.onSeedUrlDelete = function(id){
		seedUrlFactory.delete($scope.workspaceId, id)
		.success(function(data){
			console.log('deleted');
			$scope.seedUrls
			angular.forEach($scope.seedUrls, function(seedUrl) {
				if(seedUrl._id == id){
					seedUrl.deleted = true;
					return;
				}
			});
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error.message;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}


  $scope.max = 5;
  $scope.min = 0;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
	$scope.overStar = value;
	$scope.percent = 100 * (value / $scope.max);
  };

	$scope.ratingStates = [
		{stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
		{stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
		{stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
		{stateOn: 'glyphicon-heart'},
		{stateOff: 'glyphicon-off'}
	];


	var isRunning = false;

	function checkFetch(){
		if(!isRunning){
			isRunning = true;
//			$interval(checkFetchDo, 5000);
            $scope.checkFetchDo();
            $interval.cancel($rootScope.checkFetchDoPromise);
//            $rootScope.checkFetchDoPromise = $interval($scope.checkFetchDo, 3000, 0, true, $scope.workspaceId);
            $rootScope.checkFetchDoPromise = $interval($scope.checkFetchDo, 3000);
		}
	}

	function checkFetchDo(){
		if($scope.seedUrls.length == 0){
			$scope.fetch();
		}
	}

//
//$scope.$on('$locationChangeStart', function(event) {
//	console.log("$locationChangeStart");
//});

	getSeeds();

//	getSeedUrls();

	checkFetchDo();

}]);

var seedUrlFactory = ngApp.factory('seedUrlFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/seed-url';
	var dataFactory = {};

//	dataFactory.get = function (workspaceId) {
//		var url =  String.format(urlBase, workspaceId);
//		return $http.get(url);
//	};
	dataFactory.get = function (workspaceId, source, relevance, lastId) {
		var url =  String.format(urlBase, workspaceId);
		po = {};
		po.relevance = relevance;
		po.lastId = lastId;
		return $http.post(url + '/' + source, po);
	};


	dataFactory.update = function(workspaceId, id, relevance){
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.relevance = relevance
		console.log("id: " + id + " , relevance: " + relevance);
		return $http.put(url + "/url/" + id, po);
	};

	dataFactory.generate = function(workspaceId, nResults, crawlProvider, crawlSources) {
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.nResults = nResults;
		po.crawlProvider = crawlProvider;
		po.crawlSources = crawlSources;
		return $http.post(url + '/generation', po);
	};

	dataFactory.delete = function(workspaceId, id){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + "/url/" + id);
	};

//	return dataFactory;
//}]);
//
//
//var seedUrlSourceFactory = ngApp.factory('seedUrlSourceFactory',['$http', function($http){

//	var seedUrlGenerationUrlBase = '/api/seed-url/generation';
//	var seedUrlBase = '/api/seed-url' ;
//	var dataFactory = {};


	dataFactory.resetResults = function(workspaceId, source){
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + '/generation/' + source);
	}



	dataFactory.getAggregated = function (workspaceId) {
		var url =  String.format(urlBase+'/aggregated', workspaceId);
		return $http.get(url);
	};
	return dataFactory;
}]);
