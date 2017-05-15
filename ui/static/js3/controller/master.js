ngApp.controller('masterController', ['$scope', '$cookies', '$mdConstant', 'workspaceFactory', '$mdDialog',
function ($scope, $cookies, $mdConstant, workspaceFactory, $mdDialog) {

	$scope.master = {};
	$scope.master.workspaceId = $cookies.get("workspaceId");
    $scope.master.workspace = {};

	$scope.master.setWorkspace = function(workspaceId){
		$scope.master.workspaceId = workspaceId;
		$cookies.put("workspaceId", workspaceId);
		$scope.master.reloadWorkspace(workspaceId);
	}

    $scope.master.getWorkspace = function(){
        return $scope.master.workspaceId;
    }

	$scope.master.onRemovedWorkspaceId = function(removedWorkspaceId){
		if(removedWorkspaceId == $scope.master.workspaceId){
			$scope.master.workspaceId = null;
			$cookies.remove("workspaceId");
			$scope.master.workspaceName = null;
		}
	}


	//use this when we allow the user to rename the workspace
	$scope.master.reloadWorkspace= function(workspaceId){
		workspaceFactory.getWorkspace(workspaceId).then(
		function(response){
			$scope.master.workspaceName = response.data.name;
			$scope.master.workspace = response.data;
		},
		function(response){
			console.log(response)
			$scope.workspaceName = null;
		});
	}


	//main
	if($scope.master.workspaceId){
		$scope.master.reloadWorkspace($scope.master.workspaceId);
	}

    //catalogs

    $scope.master.catalog={};

    $scope.master.crawlProvider = 'HH_JOOGLE';

    $scope.master.catalog.relevances = [
      { label: 'irrelevant', value: false},
      { label: 'neutral', value: null },
      { label: 'relevant', value: true }
    ];

    $scope.master.catalog.categories1= ['FORUM', 'NEWS'];
    $scope.master.catalog.categories2 = ['BLOG', 'SHOPPING'];
    $scope.master.catalog.categories = $scope.master.catalog.categories1.concat($scope.master.catalog.categories2);
    $scope.master.catalog.udcs = [];

    $scope.master.catalog.sources=[
      { label: 'Search engines', value: 'searchengine' },
      { label: 'Manual', value: 'imported' },
      { label: 'Twitter API', value: 'twitter' },
      { label: 'Deep web', value: 'tor' },
      { label: 'Deep deep', value: 'deepdeep' }
    ];

    $scope.master.catalog.broadcrawlSources=[
      { label: 'Search engines', value: 'searchengine' },
      // { label: 'Manual', value: 'imported' },
      // { label: 'Twitter API', value: 'twitter' },
      // { label: 'Deep Web', value: 'tor' },
      { label: 'Deep deep', value: 'deepdeep' }
    ];

    $scope.master.catalog.keywordSources=[
      { label: 'Search engines', value: 'SE' },
      { label: 'Twitter API', value: 'TWITTER' },
      { label: 'Deep web', value: 'TOR' }
    ];


    $scope.master.catalog.sourcesTranslator = function(sourceCode){
        if(sourceCode=="SE"){
            return "Search engines";
        }
        if(sourceCode=="MANUAL"){
            return "Imported";
        }
        if(sourceCode=="TOR"){
            return "Deep web";
        }
        if(sourceCode=="DD"){
            return "Deep deep";
        }
        else{
            // console.log("not match found for:" +  sourceCode);
            return sourceCode;
        }
    }

    $scope.toggleSelection = function toggleSelection(elem, list) {
        var idx = list.indexOf(elem);

        // is currently selected
        if (idx > -1) {
          list.splice(idx, 1);
        }

        // is newly selected
        else {
          list.push(elem);
        }
      };

    $scope.splitKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];



    // from seed-input, to validate if the fetch can be scheduled;
    $scope.master.keywordsCount = 0;


    // scrolly directive implementation for every page that registers a listener

    $scope.master.init = function(){
        $scope.master.bottomOfPageReachedCallbacks = [];
    }


    $scope.master.bottomOfPageReached = function() {

        console.log("$scope.master.bottomOfPageReachedCallbacks.length: "  + $scope.master.bottomOfPageReachedCallbacks.length);
        for(var i = 0; i<$scope.master.bottomOfPageReachedCallbacks.length; i++ ){
            console.log('bottomOfPageReached  triggered');
            $scope.master.bottomOfPageReachedCallbacks[i].apply();
            console.log('bottomOfPageReached  done');
        }
    };

    $scope.master.bottomOfPageReachedAddUniqueListener = function(callback) {
        $scope.master.bottomOfPageReachedCallbacks = [];
        $scope.master.bottomOfPageReachedCallbacks.push(callback);
    };

    $scope.master.bottomOfPageReachedAddListener = function(callback) {
        $scope.master.bottomOfPageReachedCallbacks.push(callback);
    };

    $scope.master.init();


    // modal alert
    $scope.master.showAlert = function(ev, custom) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(false)
                .title(custom.title)
                .textContent(custom.textContent)
                .ariaLabel(custom.title)
                .ok('Got it!')
                .targetEvent(ev)
        );
    };
}]);
