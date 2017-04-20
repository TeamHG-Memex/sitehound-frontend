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

	$scope.getSeedUrls = function(){
		seedUrlFactory.get($scope.master.workspaceId, $scope.source, getRelevanceSearchObject(), $scope.lastId)
		.then(function (response) {
			console.log("finish fetching seed Urls");
			var tempResults = response.data;

			angular.forEach(tempResults, function(tempResult){

                //FIXME
                //remove the desc for testing

                tempResult.desc = "yara-yara-yara";

			    if(tempResult.udc == null || tempResult.udc== undefined){
			        tempResult.udc = [];
			    }

			    // temporary fix for backward compatibility hack to keep the labeled data. Old model was boolean, now is a constant
                if(tempResult.relevance == null || tempResult.relevance == undefined){

                    if(tempResult.relevant === true){
                        tempResult.relevance = "RELEVANT";
                    }
                    else if(tempResult.relevant === false){
                        tempResult.relevance = "IRRELEVANT";
                    }
                    else if(tempResult.relevant === null){
                        tempResult.relevance = "NEUTRAL";
                    }
                    else{
                        tempResult.relevance = "NEUTRAL";
                    }
                }
			})

            var currentLength = $scope.seedUrls.length;

			Array.prototype.push.apply($scope.seedUrls, tempResults);

            for (var i = currentLength; i < $scope.seedUrls.length; i++) {
               $scope.$watch('seedUrls[' + i + ']', function (newValue, oldValue) {
//                    debugger;
//                  console.log(newValue + ":::" + oldValue);

                    if(
                        newValue.relevance != oldValue.relevance ||
                        newValue.categories != oldValue.categories ||
                        newValue.udc != oldValue.udc
                    ){
                        $scope.updateSeedUrl(newValue);
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
        seedUrlFactory.update($scope.master.workspaceId, seedUrl._id, seedUrl.relevance, seedUrl.categories, seedUrl.udc)
        .then(function(){}, function(){})
    }




/* filters */

	$scope.relevancyFilter = {};
	$scope.relevancyFilter.neutral = true;
	$scope.relevancyFilter.relevant = true;
	$scope.relevancyFilter.irrelevant = true;
	$scope.relevancyFilter.failed = true;
	function getRelevanceSearchObject(){
		var relevanceSearchObject = {};
		relevanceSearchObject.neutral = $scope.relevancyFilter.neutral;
		relevanceSearchObject.relevant = $scope.relevancyFilter.relevant;
		relevanceSearchObject.irrelevant = $scope.relevancyFilter.irrelevant;
		relevanceSearchObject.failed = $scope.relevancyFilter.failed;
		return relevanceSearchObject;
	}

	$scope.pageTypeFilter = {};
	$scope.pageTypeFilter.forum = true;
	$scope.pageTypeFilter.blog = true;
	$scope.pageTypeFilter.news = true;
	$scope.pageTypeFilter.classified = true;
	$scope.pageTypeFilter.ads = true;

/* end filters */
//    $scope.relevance

//    $scope.radioRelevanceCatalog = [
//      { label: 'Neutral', value: 'NEUTRAL' },
//      { label: 'Relevant', value: 'RELEVANT' },
////      { label: 'irrelevant', value: 'irrelevant', isDisabled: true },
//      { label: 'Irrelevant', value: 'IRRELEVANT'},
//      { label: 'Failed', value: 'FAILED' }
//    ];


/////    RELEVANCE /////

    $scope.radioRelevanceCatalog = [
      { label: 'Relevant', value: 'RELEVANT' },
      { label: 'Neutral', value: 'NEUTRAL' },
      { label: 'Irrelevant', value: 'IRRELEVANT'},
    ];

//    $scope.radioRelevanceCatalog2 = [
//      { label: 'Failed', value: 'FAILED' }
//    ];


    //PAGE TYPE
    $scope.checkboxPageTypeCatalog1 = [
        'FORUM', 'NEWS',
//        'BLOG', 'SHOPPING'
    ]
    $scope.checkboxPageTypeCatalog2 = [
//        'FORUM', 'NEWS',
        'BLOG', 'SHOPPING'
    ]


     $scope.toggleSelection = function toggleSelection(site, categories) {
        var idx = categories.indexOf(site);

        // is currently selected
        if (idx > -1) {
          categories.splice(idx, 1);
        }

        // is newly selected
        else {
          categories.push(site);
        }
      };

    // USER DEFINED CATEGORIES //

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


}]);
