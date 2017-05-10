ngApp.controller('masterController', ['$scope', '$cookies', '$mdConstant', 'workspaceFactory',
function ($scope, $cookies, $mdConstant, workspaceFactory) {

	$scope.master = {};
	$scope.master.workspaceId = $cookies.get("workspaceId");
    $scope.master.workspace = {};

	$scope.master.setWorkspace = function(workspaceId){
		$scope.master.workspaceId = workspaceId;
		$cookies.put("workspaceId", workspaceId);
		$scope.master.reloadWorkspace(workspaceId);
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
      { label: 'relevant', value: true },
      { label: 'neutral', value: null },
      { label: 'irrelevant', value: false}
    ];

    $scope.master.catalog.categories1= ['FORUM', 'NEWS'];
    $scope.master.catalog.categories2 = ['BLOG', 'SHOPPING'];
    $scope.master.catalog.categories = $scope.master.catalog.categories1.concat($scope.master.catalog.categories2);
    $scope.master.catalog.udcs = [];

    $scope.master.catalog.sources=[
      { label: 'Google + Bing', value: 'searchengine' },
      { label: 'Manual', value: 'imported' },
      { label: 'Twitter API', value: 'twitter' },
      { label: 'Deep Web', value: 'tor' },
      { label: 'Deep Deep', value: 'deepdeep' }
    ];

    $scope.master.catalog.broadcrawlSources=[
      { label: 'Google + Bing', value: 'searchengine' },
      // { label: 'Manual', value: 'imported' },
      // { label: 'Twitter API', value: 'twitter' },
      { label: 'Deep Web', value: 'tor' },
      { label: 'Deep Deep', value: 'deepdeep' }
    ];

    $scope.master.catalog.keywordSources=[
      { label: 'Google + Bing', value: 'SE' },
      { label: 'Twitter API', value: 'TWITTER' },
      { label: 'Deep Web', value: 'TOR' }
    ];

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

}]);
