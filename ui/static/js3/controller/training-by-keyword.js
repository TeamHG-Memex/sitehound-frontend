ngApp.controller('trainingByKeywordController', ['$scope', '$filter', 'workspaceSelectedService', 'seedUrlFactory',
function ($scope, $filter, workspaceSelectedService, seedUrlFactory, $mdDialog) {


    $scope.relevantKeywords=[];
    $scope.irrelevantKeywords=[];

    var originatorEv;
    $scope.openMenu = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };


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


	function getSeedUrls(){
        //FIXME until can start this function after the workspae is set
        $scope.workspaceId = "5836ef08166f1c63b47693ff"; //workspaceSelectedService.getSelectedWorkspace()
		$scope.loading = true;
		$scope.errorMessage = "";
		$scope.crawlStatusBusy=true;

		var onSuccess = function (response) {
			console.log("finish fetching seed Urls");
//			$scope.seedUrls = $.parseJSON(data);
			var tempResults = response.data;
			angular.forEach(tempResults, function(v){
			    v.udcList=[];
			});
			Array.prototype.push.apply($scope.seedUrls, tempResults);
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
//			loadWordScore();
			$scope.crawlStatusBusy=false;
			$scope.loading = false;
		};
		var onError = function (response) {
		    var error = response.data;
			$scope.errorMessage = error.message;
			$scope.crawlStatusBusy=false;
			$scope.loading = false;
		};
//		.finally(function(){
//		});
		seedUrlFactory.get($scope.workspaceId, $scope.source, getRelevanceSearchObject(), $scope.lastId).then(onSuccess, onError);
	}

	getSeedUrls();
}]);
