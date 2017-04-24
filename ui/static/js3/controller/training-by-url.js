ngApp.controller('trainingByUrlController', ['$scope', '$filter', 'seedUrlFactory', 'importUrlFactory', 'fetchService', 'trainingService',
function ($scope, $filter, seedUrlFactory, importUrlFactory, fetchService, trainingService, $mdDialog) {


	$scope.upload = {};

	$scope.import = function() {
		if ($scope.upload.urlsToAdd == undefined || $scope.upload.urlsToAdd.length == 0){
			alert('Please enter some urls');
			return;
		}
//		var tOut = $scope.startLoading();
		importUrlFactory.save($scope.master.workspaceId, $scope.upload.urlsToAdd, $scope.upload.relevance).then(
			function(){
			    $scope.upload.urlsToAdd="";
			},
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




/* catalog */
    $scope.catalog = {};
    $scope.catalog.udcs = [];

/* Filters */
    $scope.filters = {};
	$scope.filters.relevances = [];
	$scope.filters.categories = [];
	$scope.filters.udcs = [];



	/** Fetch pages */
	$scope.seedUrls = [];
    $scope.source = "imported";
	$scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;

    $scope.getSeedUrls = function(){
        $scope.seedUrls = [];
        $scope.lastId = null;
        $scope.getMoreSeedUrls();
    }


    function refreshUdcOnSuccess(response){
        $scope.catalog.udcs = response.data;
    }

    trainingService.refreshUdc($scope.master.workspaceId, $scope.source, refreshUdcOnSuccess);


	$scope.getMoreSeedUrls = function(){
		seedUrlFactory.get($scope.master.workspaceId, $scope.source, $scope.filters, $scope.lastId)
		.then(function (response) {
			console.log("finish fetching seed Urls");
			var tempResults = response.data;
			angular.forEach(tempResults, function(tempResult){
			    if(tempResult.udc == null || tempResult.udc== undefined){
			        tempResult.udc = [];
			    }
			})

            var currentLength = $scope.seedUrls.length;

			Array.prototype.push.apply($scope.seedUrls, tempResults);

            for (var i = currentLength; i < $scope.seedUrls.length; i++) {
               $scope.$watch('seedUrls[' + i + ']', function (newValue, oldValue) {

                    if(!newValue || !oldValue){
                        console.log("empty objects change");
                        return;
                    }

                    if(
                        newValue.relevant != oldValue.relevant ||
                        newValue.categories != oldValue.categories ||
                        newValue.udc != oldValue.udc
                    ){
                        $scope.updateSeedUrl(newValue);
                        if(newValue.udc != oldValue.udc){
                            trainingService.udcsDirty = true;
                        }
                    }
                    else{
                        console.log("unsupported change");
                    }

               }, true);
            }

			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
		},
		function (response) {
		});
	}


    $scope.updateSeedUrl = function(seedUrl){
        trainingService.updateSeedUrl($scope.master.workspaceId, seedUrl, $scope.source, refreshUdcOnSuccess);
    }



}]);
