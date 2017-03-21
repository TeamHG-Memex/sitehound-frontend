ngApp.controller('seedController', ['$scope', '$filter', '$routeParams', 'domFactory', 'seedFactory',
function ($scope, $filter, $routeParams, domFactory, seedFactory) {

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	domFactory.highlightNavbar(".navbar-seed");
	$scope.next = function(){
		domFactory.navigateToImportUrl();
	}

	$scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}




/**
	"words" : {
		"674760126" : {
			"score" : 5,
			"word" : "qqqqqqqqqqqqq"
		}
	}
**/

	function getSeeds(){
		seedFactory.get($scope.workspaceId)
		.success(function (data) {
			var words = data;
			$scope.words = words || [];
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		});
	}

	$scope.addIncludedWord = function(word) {
		scoreWord(word, 5);
		$scope.includedWord = '';
	}

	$scope.addExcludedWord = function(word) {
		scoreWord(word, 1);
		$scope.excludedWord = '';
	}

	$scope.removeWord = function(hash){
		seedFactory.delete($scope.workspaceId, hash)
		.success(function (data) {
			getSeeds();
		});
	}

	var scoreWord = function (wordList, score) {
		if(wordList == '' || wordList == null || wordList.trim()== ""){
			getSeeds();
			return;
		}
		wordList = wordList.trim();

		var word = wordList.split(',')[0];
        var splitPosition = wordList.indexOf(",");
        var newWordList="";
        if(splitPosition > -1){
            var newWordList = wordList.substring(splitPosition+1);
        }
		if(word.length <3){
		    if(word.trim().length>0){
			    alert("skipping short word: " + word);
		    }
			scoreWord(newWordList, score);
		}
		else{
			seedFactory.save($scope.workspaceId, word, score)
			.success(function (data) {
				scoreWord(newWordList, score);
			});
		}
	}

	getSeeds();
}]);



var seedFactory = ngApp.factory('seedFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/seed';
	var dataFactory = {};

	dataFactory.get = function (workspaceId) {
		var url =  String.format(urlBase, workspaceId);
		return $http.get(url);
	};

	dataFactory.save = function (workspaceId, word, score) {
		var url =  String.format(urlBase, workspaceId);
		var word = word.replace(',', '');
		var po = {};
		po.word = word;
		po.score = score;
		return $http.post(url, po);
	};

	dataFactory.delete = function (workspaceId, hash) {
		var url =  String.format(urlBase, workspaceId);
		return $http.delete(url + '/' + hash );
	};

	return dataFactory;
}]);

