ngApp.controller('seedUrlController', ['$scope', '$filter', '$modal', 'domFactory', 'seedFactory', 'seedUrlFactory', 'deepcrawlerFactory', function ($scope, $filter, $modal, domFactory, seedFactory, seedUrlFactory, deepcrawlerFactory){

//	$scope.workspaceId = $routeParams.workspaceId;
//	domFactory.setWorkspaceName($scope.workspaceId);

//	domFactory.highlightNavbar("#navbar-seed-url");

//	$scope.status = {};
//	$scope.status.open=true;

	function getSeeds(){
		seedFactory.get()
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
//		$scope.open('sm');
		$scope.loading = true;
		seedUrlFactory.get()
		.success(function (data) {
			$scope.seedUrls = data;
			loadWordScore();
//			$scope.closeModal();
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
//			$scope.ok();
		})
		.finally(function(){
			$scope.loading = false;
		});
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
		// TODO show modal indicating the req was processed correctly
		$scope.loading = true;
		seedUrlFactory.generate()
		.success(function (data) {
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
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

	$scope.relevancy = function(seedUrl) {
		if($scope.relevancyFilter == 'ALL')
			return true;
		else if($scope.relevancyFilter == 'NOT_EVALUATED')
			return seedUrl.relevant == null;
		else if($scope.relevancyFilter == 'RELEVANT')
			return seedUrl.relevant == true;
		else if($scope.relevancyFilter == 'IRRELEVANT')
			return seedUrl.relevant == false;
		else
			console.log('UNEXPECTED FILTER STATE!!!');
	};

	$scope.deletedFilter = function(seedUrl){
		return !seedUrl.deleted; //|| seedUrl.deleted == true;
	}

	$scope.onWordScoreUpdated = function(word){
//		$scope.loading = true;
		seedFactory.save(word.name, word.score)
		.success(function (data) {
			seedFactory.get()
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
		seedUrlFactory.update(id, relevance)
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
	/*
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


	$scope.onSeedHostDelete =function(host){
		seedHostFactory.delete(host)
		.success(function (data) {
			console.log('deleted');
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
	*/

	$scope.onSeedUrlDelete = function(id){
		seedUrlFactory.delete(id)
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


	getSeeds();

	getSeedUrls();

}]);


