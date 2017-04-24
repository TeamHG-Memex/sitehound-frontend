ngApp.controller('trainingByKeywordController', ['$scope', '$filter', '$mdConstant', 'seedFactory', 'fetchService','seedUrlFactory',
function ($scope, $filter, $mdConstant, seedFactory, fetchService, seedUrlFactory, $mdDialog) {

	/** Fetch pages */
	$scope.seedUrls = [];
	$scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;
	$scope.crawlStatusBusy = false;
    $scope.source = "searchengine";

	$scope.fetchFiltered = function(){
		$scope.getSeedUrls();
	}



/* Filters */

    $scope.filters = {};
	$scope.filters.relevances = [];
	$scope.filters.categories = [];
	$scope.filters.udcs = [];


/* Catalogs */

    $scope.catalog = {};

    $scope.catalog.relevances = [
      { label: 'relevant', value: true },
      { label: 'neutral', value: null },
      { label: 'irrelevant', value: false},
    ];

    $scope.catalog.categories1= ['FORUM', 'NEWS'];
    $scope.catalog.categories2 = ['BLOG', 'SHOPPING'];
    $scope.catalog.categories = $scope.catalog.categories1.concat($scope.catalog.categories2);


    $scope.catalog.udcs = [];

    $scope.refreshUdc = function(){
        seedUrlFactory.getUdcs($scope.master.workspaceId, $scope.source).then(
            function(response){
                $scope.catalog.udcs = response.data;
            },
            function(){
                console.log("fetch udcs failed");
            }
        );
    };


    $scope.refreshUdc();



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


	/** BEGIN GENERATE SE FETCH**/

	$scope.sources = {};
	$scope.sources.searchengine= {};
	$scope.sources.twitter = {};

	$scope.sources.searchengine.checked = true;
	$scope.sources.twitter.checked = true;

	$scope.generateSeedUrls = function(){
		$scope.errorMessage = "";
		$scope.loading = true;

		var nResults = 30;
		var crawlProvider = "HH_JOOGLE";

		var crawlSources = [];

		if($scope.sources.searchengine.checked){
			crawlSources.push('SE');
		}
		if($scope.sources.twitter.checked){
			crawlSources.push('TWITTER');
		}
//		else if($scope.source == 'tor'){
//			crawlSources.push('TOR');
//		}
//		else if($scope.source == 'deepdeep'){
//			crawlSources.push('DD');
//		}

		fetchService.generate($scope.master.workspaceId, nResults, crawlProvider, crawlSources)
		.then(function (response) {
			$scope.submittedOk = true;
			$scope.submittedError = false;
//			checkFetch();
			$scope.loading = false;
		},
		function (response) {
			$scope.errorMessage = response.error.message;
			$scope.submittedOk = false;
			$scope.submittedError = true;
			$scope.loading = false;
		});
	}


    $scope.getSeedUrls = function(){
        $scope.seedUrls = [];
        $scope.lastId = null;
        $scope.getMoreSeedUrls();
    }


    $scope.udcsDirty = false;

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
//                            $scope.refreshUdc();
                            $scope.udcsDirty = true;
                        }
                    }
                    else{
                        debugger;
                        console.log("unsupported change");
                    }

               }, true);
            }

			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
//            $scope.refreshUdc()
		},
		function (response) {
		});
	}


    $scope.updateSeedUrl = function(seedUrl){
        seedUrlFactory.update($scope.master.workspaceId, seedUrl._id, seedUrl.relevant, seedUrl.categories, seedUrl.udc)
        .then(function(){
            if($scope.udcsDirty){
                $scope.refreshUdc();
               $scope.udcsDirty = false;
            }
        }, function(){})
    }



}]);
