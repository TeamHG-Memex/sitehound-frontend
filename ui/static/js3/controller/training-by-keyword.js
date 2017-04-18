ngApp.controller('trainingByKeywordController', ['$scope', '$filter', '$mdConstant', 'seedFactory', 'fetchService','seedUrlFactory',
function ($scope, $filter, $mdConstant, seedFactory, fetchService, seedUrlFactory, $mdDialog) {

//	$scope.workspaceId = workspaceSelectedService.getSelectedWorkspaceId();
//	console.log($scope.master.workspaceId)
//	console.log($scope.master.workspaceName)
//	debugger
//// check that any workspace was selected
//	workspaceSelectedService.getSelectedWorkspaceAsync().then(
//	function(response){
//		$scope.workspaceName = response.data.name;
//	},
//	function(response){
//		console.log(response)
//		$scope.workspaceName = null;
//	});
//

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

	$scope.getSeeds = function(workspaceId){
		if(!workspaceId){
			return;
		}
		seedFactory.get(workspaceId).then(
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
			$scope.getSeeds($scope.master.workspaceId);
		};

		var onError = function (response) {};

		seedFactory.save($scope.master.workspaceId, chip.word, chip.score).then(onSuccess, onError);
	}

	$scope.remove = function(chip){
		seedFactory.delete($scope.master.workspaceId, chip.hash).then(function(){
//		$scope.getSeeds()
		},
		function(){})
	}

	$scope.getSeeds($scope.master.workspaceId);

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

		fetchService.generate($scope.master.workspaceId, nResults, crawlProvider, crawlSources)
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


}]);
