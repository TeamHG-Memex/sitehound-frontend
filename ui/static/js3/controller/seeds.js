ngApp.controller('seedsController', ['$scope', '$filter', '$mdConstant','seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService', 'importUrlFactory',
function ($scope, $filter, $mdConstant, seedFactory, fetchService, seedUrlFactory, trainingService, importUrlFactory) {

    // $scope.master.init();

    /** BEGIN KEYWORD SEEDS **/

	$scope.relevantKeywordsObj=[];
	$scope.irrelevantKeywordsObj=[];
	$scope.splitKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
	$scope.maxChips = 15;

	$scope.keywordHash = function(word, hash, score) {
	  return {
		word: word,
		hash: hash,
		score: score
	  };
	};

	$scope.getSeeds = function(workspaceId){
		if(!workspaceId){
			return;
		}
		seedFactory.get(workspaceId).then(
		function (response) {
			$scope.relevantKeywordsObj=[];
			$scope.irrelevantKeywordsObj=[];

			var words = response.data || [];
			angular.forEach(words, function(v,k){
				if(v.score>3){
					$scope.relevantKeywordsObj.push(new $scope.keywordHash(v.word, k, v.score));
				}
				else{
					$scope.irrelevantKeywordsObj.push(new $scope.keywordHash(v.word, k, v.score));
				}
			});

			$scope.relevantKeywordsObj.sort(function(a, b){
				return a.word == b.word ? 0 : +(a.word> b.word) || -1;
			});

			$scope.irrelevantKeywordsObj.sort(function(a, b){
				return a.word == b.word ? 0 : +(a.word> b.word) || -1;
			});
			$scope.master.keywordsCount = $scope.relevantKeywordsObj.length;
		},
		function(){}
		)
	};


	$scope.add = function(chip){
		var onSuccess = function (response) {
			$scope.getSeeds($scope.master.workspaceId);
		};

		var onError = function (response) {};

		seedFactory.save($scope.master.workspaceId, chip.word, chip.score).then(onSuccess, onError);
	};

	$scope.remove = function(chip){
		seedFactory.delete($scope.master.workspaceId, chip.hash).then(function(){
//		$scope.getSeeds()
		},
		function(){})
	};

    $scope.getSeeds($scope.master.workspaceId);

	/** END KEYWORD SEEDS  **/






	/** Begins Fetch Keywords**/

	$scope.showKeywordsProgress = false;

	function generateSeedUrls (ev, source, nResults){


        if($scope.master.keywordsCount==0){
            var custom = {};
            custom.title = 'Included Keywords not provided';
            custom.textContent = 'Please enter some Included Keywords for querying the Source/s.';
            $scope.master.showAlert(ev, custom);
            return;
		}
		$scope.showKeywordsProgress = true;

        var sources = [source];

		fetchService.generate($scope.master.workspaceId, nResults, $scope.master.crawlProvider, sources)
		.then(
			function (response) {
				$scope.jobId = response.data.jobId;
				$scope.showKeywordsProgress = false;
			},
			function(response) {
				$scope.showKeywordsProgress = false;
				console.log(response);
			}
		);
	}

	$scope.fetchOpen = function(ev){
		var source='SE';
		var nResults=50;
		generateSeedUrls(ev, source, nResults);
	};


	$scope.fetchDark = function(ev){
		var source='TOR';
		var nResults=100;
		generateSeedUrls(ev, source, nResults);
	};

	/** Ends Fetch Dark **/

    // BEGIN UPLOAD

	$scope.browse = function(){
    	alert("todo!");
	};

	$scope.upload = {};

	$scope.showAddUrlsProgress = false;

	$scope.import = function(ev) {
		if ($scope.upload.urlsToAdd == undefined || $scope.upload.urlsToAdd.length == 0){
			// alert('Please enter some urls');
            var custom = {};
            custom.title = 'URLs were not provided';
            custom.textContent = 'Please enter some URLs (or Onions) to fetch the data from.';
            $scope.master.showAlert(ev, custom);
            return;
		}

		$scope.showAddUrlsProgress = true;

		importUrlFactory.save($scope.master.workspaceId, $scope.upload.urlsToAdd, $scope.upload.relevance).then(
			function(response){
        		$scope.showAddUrlsProgress = false;
			    $scope.upload.urlsToAdd="";
				console.log(response.data);
			},
			function(response){
        		$scope.showAddUrlsProgress = false;
				console.log(response);
			}
		)
    };

    $scope.showByurlProgressTab = false;



    $scope.results=[
        {"id":"_adfaf1", "host": "host1", "title": "title afaf 1"},
        {"id":"_adfaf2", "host": "host2", "title": "title afaf 2"},
        {"id":"_adfaf3", "host": "host3", "title": "title afaf 3"},
        {"id":"_adfaf4", "host": "host4", "title": "title afaf 4"},
        {"id":"_adfaf5", "host": "host5", "title": "title afaf 5"},
        {"id":"_adfaf6", "host": "host6", "title": "title afaf 6"},
        {"id":"_adfaf7", "host": "host7", "title": "title afaf 7"},
        {"id":"_adfaf8", "host": "host8", "title": "title afaf 8"},
        {"id":"_adfaf9", "host": "host9", "title": "title afaf 9"},
    ];

    $scope.results2=[
        {"id":"_adfaf21", "host": "host1", "title": "title afaf 1"},
        {"id":"_adfaf22", "host": "host2", "title": "title afaf 2"},
        {"id":"_adfaf23", "host": "host3", "title": "title afaf 3"},
        {"id":"_adfaf24", "host": "host4", "title": "title afaf 4"},
        {"id":"_adfaf25", "host": "host5", "title": "title afaf 5"},
        {"id":"_adfaf26", "host": "host6", "title": "title afaf 6"},
        {"id":"_adfaf27", "host": "host7", "title": "title afaf 7"},
        {"id":"_adfaf28", "host": "host8", "title": "title afaf 8"},
        {"id":"_adfaf29", "host": "host9", "title": "title afaf 9"},
    ];



    /**  Ends upload */


	$scope.bottomOfPageReached = function(){
		// Array.prototype.push.apply($scope.results, $scope.results2);
		// console.log("afafaf");
		fetch();
	};


		// Filters
    $scope.filters = {};
	$scope.filters.sources = [];
	$scope.filters.relevances = [];
	$scope.filters.categories = [];
	$scope.filters.udcs = [];

	$scope.seedUrls = [];
	$scope.filters.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;

	function fetch(){
        // if (!searchResultsButtonStarted){
        //     return;
        // }

        seedUrlFactory.get($scope.master.workspaceId, $scope.filters)
		.then(function (response) {
			console.log("finish fetching seed Urls");
			var tempResults = response.data;
			// angular.forEach(tempResults, function(tempResult){
			//     if(tempResult.udc == null || tempResult.udc== undefined){
			//         tempResult.udc = [];
			//     }
			// })

            // var currentLength = $scope.seedUrls.length;

			Array.prototype.push.apply($scope.seedUrls, tempResults);

            // for (var i = currentLength; i < $scope.seedUrls.length; i++) {
            //    var watchHandler = $scope.$watch('seedUrls[' + i + ']', function (newValue, oldValue) {
            //
            //         if(!newValue || !oldValue){
            //             console.log("empty objects change");
            //             return;
            //         }
            //
            //         if(
            //             newValue.relevant != oldValue.relevant ||
            //             newValue.categories != oldValue.categories ||
            //             newValue.udc != oldValue.udc
            //         ){
            //             $scope.updateSeedUrl(newValue);
            //             if(newValue.udc != oldValue.udc){
            //                 trainingService.udcsDirty = true;
            //             }
            //         }
            //         else{
            //             console.log("unsupported change");
            //         }
            //
            //    }, true);
            //    $scope.watchHandlers.push(watchHandler);
            // }

			$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
		},
		function (response) {
		});
	};

	fetch();
}]);
