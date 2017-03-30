

ngApp.config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet("call", 'static/img/icons/sets/communication-icons.svg', 24)
      .iconSet("social", '/static/img/icons/sets/social-icons.svg', 24);
  })


ngApp.controller('seedController', ['$scope', '$filter', 'workspaceSelectedService', 'seedFactory',
function ($scope, $filter, workspaceSelectedService, seedFactory, $mdDialog) {

//	$scope.workspaceId = $routeParams.workspaceId;

//	domFactory.setWorkspaceName($scope.workspaceId);

//	domFactory.highlightNavbar(".navbar-seed");
//	$scope.next = function(){
//		domFactory.navigateToImportUrl();
//	}
//
//	$scope.navigateToDashboard = function(){
//		domFactory.navigateToDashboard();
//	}

    var originatorEv;
    $scope.openMenu = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };

    $scope.notificationsEnabled = true;
    $scope.toggleNotifications = function() {
      $scope.notificationsEnabled = !$scope.notificationsEnabled;
    };

       $scope.redial = function() {
      $mdDialog.show(
        $mdDialog.alert()
          .targetEvent(originatorEv)
          .clickOutsideToClose(true)
          .parent('body')
          .title('Suddenly, a redial')
          .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
          .ok('That was easy')
      );

      originatorEv = null;
    };


/**
	"words" : {
		"674760126" : {
			"score" : 5,
			"word" : "qqqqqqqqqqqqq"
		}
	}
**/

    function getSeeds(){
        $scope.getSeeds();
    }

    $scope.relevantKeywords=[];
    $scope.irrelevantKeywords=[];

	$scope.getSeeds = function(){
        $scope.workspaceId = workspaceSelectedService.getSelectedWorkspaceId();
    	var workspaceId = $scope.workspaceId;
		seedFactory.get(workspaceId)
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

