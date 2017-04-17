ngApp.controller('trainingByUrlController', ['$scope', '$filter', 'workspaceSelectedService', 'seedUrlFactory', 'importUrlFactory',
function ($scope, $filter, workspaceSelectedService, seedUrlFactory, importUrlFactory, $mdDialog) {

	// BEGIN WORKSPACE AREA
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
	// END WORKSPACE AREA

    $scope.relevantKeywords=[];
    $scope.irrelevantKeywords=[];

    var originatorEv;
    $scope.openMenu = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };

    $scope.postConstructTimes = 0;
    $scope.postConstruct = function(){

        console.log("postConstruct - executed");
        $scope.postConstructTimes = $scope.postConstructTimes + 1;
    }


///

//    from seed-url-source.js
	//pagination
	$scope.seedUrls = [];
	$scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;
	$scope.crawlStatusBusy = false;
    $scope.source="searchengine";

	function getRelevanceSearchObject(){
		var relevanceSearchObject = {};
		relevanceSearchObject.neutral = $scope.relevancyFilter_Neutral;
		relevanceSearchObject.relevant = $scope.relevancyFilter_Relevant;
		relevanceSearchObject.irrelevant = $scope.relevancyFilter_Irrelevant;
		return relevanceSearchObject;
	}


//TODO get seeds with source manual
//	function getSeedUrls(){
//        //FIXME until can start this function after the workspae is set
//        $scope.workspaceId = "5836ef08166f1c63b47693ff"; //workspaceSelectedService.getSelectedWorkspace()
//		$scope.loading = true;
//		$scope.errorMessage = "";
//		$scope.crawlStatusBusy=true;
//
//		var onSuccess = function (response) {
//			console.log("finish fetching seed Urls");
////			$scope.seedUrls = $.parseJSON(data);
//			var tempResults = response.data;
//			angular.forEach(tempResults, function(v){
//			    v.udcList=[];
//			});
//			Array.prototype.push.apply($scope.seedUrls, tempResults);
//			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
//				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
////			loadWordScore();
//			$scope.crawlStatusBusy=false;
//			$scope.loading = false;
//		};
//		var onError = function (response) {
//		    var error = response.data;
//			$scope.errorMessage = error.message;
//			$scope.crawlStatusBusy=false;
//			$scope.loading = false;
//		};
////		.finally(function(){
////		});
//		seedUrlFactory.get($scope.workspaceId, $scope.source, getRelevanceSearchObject(), $scope.lastId).then(onSuccess, onError);
//	}
//
//	getSeedUrls();

	$scope.upload = {};

	$scope.import = function() {
		if ($scope.upload.urlsToAdd == undefined || $scope.upload.urlsToAdd.length == 0){
			alert('Please enter some urls');
			return;
		}
//		var tOut = $scope.startLoading();
		importUrlFactory.save($scope.workspaceId, $scope.upload.urlsToAdd, $scope.upload.relevance).then(
			function(){},
			function(){}
		)
//		.success(function (data) {
//			$scope.submittedOk = true;
//			$scope.submittedError = false;
//			$scope.urlsToAdd = "";
//		})
//		.error(function (error) {
//			$scope.status = 'Unable to update data: ' + error.message;
//			$scope.submittedOk = false;
//			$scope.submittedError = true;
//		})
//		.finally(function(){
//			$scope.endLoading(tOut);
//		})

	}

}]);
