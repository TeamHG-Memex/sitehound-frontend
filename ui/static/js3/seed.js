ngApp.config(function($mdIconProvider) {
    $mdIconProvider
      .iconSet("call", 'static/img/icons/sets/communication-icons.svg', 24)
      .iconSet("social", '/static/img/icons/sets/social-icons.svg', 24);
  })


ngApp.controller('seedController', ['$scope', '$filter', 'workspaceSelectedService', 'seedFactory',
//ngApp.controller('seedController', ['$scope', '$filter', 'workspaceSelectedService', 'seedFactory',
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

//    $scope.notificationsEnabled = true;
//    $scope.toggleNotifications = function() {
//      $scope.notificationsEnabled = !$scope.notificationsEnabled;
//    };
//
//       $scope.redial = function() {
//      $mdDialog.show(
//        $mdDialog.alert()
//          .targetEvent(originatorEv)
//          .clickOutsideToClose(true)
//          .parent('body')
//          .title('Suddenly, a redial')
//          .textContent('You just called a friend; who told you the most amazing story. Have a cookie!')
//          .ok('That was easy')
//      );
//
//      originatorEv = null;
//    };


/**
	"words" : {
		"674760126" : {
			"score" : 5,
			"word" : "qqqqqqqqqqqqq"
		}
	}
**/

/* User defined categories logic*/
//
//
//    $scope.readonly = false;
//    $scope.selectedItem = null;
//    $scope.searchText = null;
////    self.querySearch = querySearch;
//    $scope.selectedVegetables = [];
//    $scope.numberChips = [];
//    $scope.numberChips2 = [];
//    $scope.numberBuffer = '';
//    $scope.autocompleteDemoRequireMatch = false;
////    self.transformChip = transformChip;
//
//    /*
//     * Return the proper object when the append is called.
//     */
//    $scope.transformChip = function(chip) {
//      // If it is an object, it's already a known chip
//      if (angular.isObject(chip)) {
//        return chip;
//      }
//
//      // Otherwise, create a new one
//      return { name: chip, type: 'new' }
//    }
//
//    /**
//     * Search for vegetables.
//     */
//    $scope.querySearch = function(query) {
//      var results = query ? $scope.vegetables.filter($scope.createFilterFor(query)) : [];
//      return results;
//    }
//
//    /**
//     * Create filter function for a query string
//     */
//    $scope.createFilterFor = function(query) {
//      var lowercaseQuery = angular.lowercase(query);
//
//      return function filterFn(vegetable) {
//        return (vegetable._lowername.indexOf(lowercaseQuery) === 0) ||
//            (vegetable._lowertype.indexOf(lowercaseQuery) === 0);
//      };
//
//    }
//
//
//    $scope.loadVegetables = function() {
//      var veggies = [
//        {
//          'name': 'Broccoli',
//          'type': 'Brassica'
//        },
//        {
//          'name': 'Cabbage',
//          'type': 'Brassica'
//        },
//        {
//          'name': 'Carrot',
//          'type': 'Umbelliferous'
//        },
//        {
//          'name': 'Lettuce',
//          'type': 'Composite'
//        },
//        {
//          'name': 'Spinach',
//          'type': 'Goosefoot'
//        }
//      ];
//
//      var vegs = veggies.map(function (veg) {
//        veg._lowername = veg.name.toLowerCase();
//        veg._lowertype = veg.type.toLowerCase();
//        return veg;
//      });
//      return vegs;
//    }
//
//    var vegs = $scope.loadVegetables()
//    $scope.vegetables = vegs;
//
//
////     Lists of fruit names and Vegetable objects
//    $scope.readonly = false;
//
//    $scope.selectedChip=null;
//
//    self.newVeg = function(chip) {
//      return {
//        name: chip,
//        type: 'unknown'
//      };
//    };






    function getSeeds(){
        $scope.getSeeds();
    }

    $scope.relevantKeywords=[];
    $scope.relevantKeywords2=[];
    $scope.irrelevantKeywords=[];
    $scope.udcList=["bla"];



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

    //FIXME
//	getSeeds();
}]);




