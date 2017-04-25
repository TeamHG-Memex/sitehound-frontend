ngApp.controller('labelController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {


    /* catalog */
    $scope.catalog = {};
    $scope.catalog.udcs = [];

    /* Filters */
    $scope.filters = {};
	$scope.filters.sources = [];
	$scope.filters.relevances = [];
	$scope.filters.categories = [];
	$scope.filters.udcs = [];


	/** Fetch pages */
	$scope.seedUrls = [];
    $scope.source = "searchengine";
	$scope.filters.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;

    $scope.getSeedUrls = function(){
        $scope.seedUrls = [];
        $scope.filters.lastId = null;
        for (var i = 0; i < $scope.watchHandlers.length; ++i) {
            $scope.watchHandlers[i].apply();
        }
        $scope.getMoreSeedUrls();
    }


    function refreshUdcOnSuccess(response){
        $scope.catalog.udcs = response.data;
    }

    trainingService.refreshUdc($scope.master.workspaceId, $scope.source, refreshUdcOnSuccess);


    $scope.watchHandlers=[];
	$scope.getMoreSeedUrls = function(){
		seedUrlFactory.get($scope.master.workspaceId, $scope.filters)
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
               var watchHandler = $scope.$watch('seedUrls[' + i + ']', function (newValue, oldValue) {

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
               debugger;
               $scope.watchHandlers.push(watchHandler);
            }

			$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
		},
		function (response) {
		});
	}


    $scope.updateSeedUrl = function(seedUrl){
        trainingService.updateSeedUrl($scope.master.workspaceId, seedUrl, $scope.source, refreshUdcOnSuccess);
    }



}]);
