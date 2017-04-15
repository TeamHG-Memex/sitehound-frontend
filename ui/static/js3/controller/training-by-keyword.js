ngApp.controller('trainingByKeywordController', ['$scope', '$filter', 'workspaceSelectedService', 'seedFactory', '$mdConstant',
function ($scope, $filter, workspaceSelectedService, seedFactory, $mdConstant, $mdDialog) {

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

	/// END KEYWORD SEEDS


}]);
