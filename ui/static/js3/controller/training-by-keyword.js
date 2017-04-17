ngApp.controller('trainingByKeywordController', ['$scope', '$filter', '$mdConstant',
'workspaceSelectedService', 'seedFactory', 'fetchService','seedUrlFactory',
function ($scope, $filter, $mdConstant, workspaceSelectedService, seedFactory, fetchService, seedUrlFactory, $mdDialog) {

	$scope.workspaceId = workspaceSelectedService.getSelectedWorkspaceId();

// check that any workspace was selected
	workspaceSelectedService.getSelectedWorkspaceAsync().then(
	function(response){
		$scope.workspaceName = response.data.name;
		$scope.getSeeds();
	},
	function(response){
		console.log(response)
		$scope.workspaceName = null;
	});


	/// BEGIN KEYWORD SEEDS

	$scope.relevantKeywordsObj=[];
	$scope.irrelevantKeywordsObj=[];
	$scope.splitKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
	$scope.maxChips = 15;

	$scope.keywordHash = function(word, hash, score) {
	  return {
		word: word,
		hash: hash,
		score: score
	  };
	};

	$scope.getSeeds = function(){
		seedFactory.get($scope.workspaceId).then(
		function (response) {
			$scope.relevantKeywordsObj=[];
			$scope.irrelevantKeywordsObj=[];

			var words = response.data || [];
			angular.forEach(words, function(v,k){
				if(v.score>3){
					$scope.relevantKeywordsObj.push(new $scope.keywordHash(v.word, k, v.score));
				}
				else{
					$scope.irrelevantKeywordsObj.push(new $scope.keywordHash(v.word, k, v.score));
				}
			});

			$scope.relevantKeywordsObj.sort(function(a, b){
				return a.word == b.word ? 0 : +(a.word> b.word) || -1;
			});

			$scope.irrelevantKeywordsObj.sort(function(a, b){
				return a.word == b.word ? 0 : +(a.word> b.word) || -1;
			});
		},
		function(){}
		)
	}


	$scope.add = function(chip){
		var onSuccess = function (response) {
			$scope.getSeeds();
		};

		var onError = function (response) {};

		seedFactory.save($scope.workspaceId, chip.word, chip.score).then(onSuccess, onError);
	}

	$scope.remove = function(chip){
		seedFactory.delete($scope.workspaceId, chip.hash).then(function(){
//		$scope.getSeeds()
		},
		function(){})
	}

	/** END KEYWORD SEEDS  **/




	/** BEGIN GENERATE SE FETCH**/

	$scope.sources = {};
	$scope.sources.searchengine= {};
	$scope.sources.twitter = {};

	$scope.sources.searchengine.checked = true;
	$scope.sources.twitter.checked = true;

	$scope.generateSeedUrls = function(){
		$scope.errorMessage = "";
		$scope.loading = true;

		var nResults = 30;
		var crawlProvider = "HH_JOOGLE";

		var crawlSources = [];

		if($scope.sources.searchengine.checked){
			crawlSources.push('SE');
		}
		if($scope.sources.twitter.checked){
			crawlSources.push('TWITTER');
		}
//		else if($scope.source == 'tor'){
//			crawlSources.push('TOR');
//		}
//		else if($scope.source == 'deepdeep'){
//			crawlSources.push('DD');
//		}

		fetchService.generate($scope.workspaceId, nResults, crawlProvider, crawlSources)
		.then(function (response) {
			$scope.submittedOk = true;
			$scope.submittedError = false;
//			checkFetch();
			$scope.loading = false;
		},
		function (response) {
			$scope.errorMessage = response.error.message;
			$scope.submittedOk = false;
			$scope.submittedError = true;
			$scope.loading = false;
		});
	}


	/** FETCH PAges */
	$scope.seedUrls = [];
	$scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;
	$scope.crawlStatusBusy = false;
    $scope.source="searchengine";


	$scope.relevancyFilter = {};
	$scope.relevancyFilter.neutral = true;
	$scope.relevancyFilter.relevant = true;
	$scope.relevancyFilter.irrelevant = true;
	$scope.relevancyFilter.failed = true;
	function getRelevanceSearchObject(){
		var relevanceSearchObject = {};
		relevanceSearchObject.neutral = $scope.relevancyFilter.neutral;
		relevanceSearchObject.relevant = $scope.relevancyFilter.relevant;
		relevanceSearchObject.irrelevant = $scope.relevancyFilter.irrelevant;
		relevanceSearchObject.failed = $scope.relevancyFilter.failed;
		return relevanceSearchObject;
	}

	$scope.pageTypeFilter = {};
	$scope.pageTypeFilter.forum = true;
	$scope.pageTypeFilter.blog = true;
	$scope.pageTypeFilter.news = true;
	$scope.pageTypeFilter.classified = true;
	$scope.pageTypeFilter.ads = true;


	$scope.getSeedUrls = function(){
		debugger;
		seedUrlFactory.get($scope.workspaceId, $scope.source, getRelevanceSearchObject(), $scope.lastId)
		.then(function (response) {
			console.log("finish fetching seed Urls");
			var tempResults = response.data;
			Array.prototype.push.apply($scope.seedUrls, tempResults);
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
		},
		function (response) {
		});
	}

	$scope.fetchFiltered = function(){
		$scope.getSeedUrls();
	}





}]);
