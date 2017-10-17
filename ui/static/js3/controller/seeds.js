ngApp.controller('seedsController', ['$scope', '$filter', '$rootScope', '$timeout', '$interval', '$mdConstant','seedFactory', 'fetchService', 'seedUrlFactory', 'importUrlFactory', 'domFactory',
function ($scope, $filter, $rootScope, $timeout, $interval, $mdConstant, seedFactory, fetchService, seedUrlFactory, importUrlFactory, domFactory) {

    console.log("loading seeds");

    $scope.master.init();

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

	$scope.getSeeds = function(){
        var workspaceId = $scope.master.workspaceId;

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

    $scope.getSeeds();

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
		var nResults=50;
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

    $scope.addUrlsFromFile = function(data){
        importedUrls = [];
		var lines = data.split("\n");
		for(var i=0; i<lines.length;i++){
			var line = lines[i].trim();
			if(validateUrl(line)){
                importedUrls.push(line);
			}
			else{
				console.log("couldn't validate:" +  line);
			}
		}
        $scope.upload.urlsToAdd = importedUrls.join("\n");
	};

    /**  Ends upload */


    /** Begins results */

	$scope.bottomOfPageReached = function(){
        console.log("bottomOfPageReached");
		fetch();
	};

    $scope.filters = {};
	$scope.filters.sources = [];
	$scope.filters.relevances = [];
	$scope.filters.categories = [];
	$scope.filters.udcs = [];

	$scope.seedUrls = [];
	$scope.filters.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;

    function fetch(){
        seedUrlFactory.getSeedResults($scope.master.workspaceId, $scope.filters)
		.then(
			function (response) {
				var tempResults = response.data;
				Array.prototype.push.apply($scope.seedUrls, tempResults);

				$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
				// console.log("finish fetching seed Urls");

            },
			function (response) {
				console.log(response);
			});
	}

    var isRunning = false;
    function backgroundService(){
        if(!isRunning && $scope.master.workspaceId){
            isRunning = true;
            if($scope.seedUrls.length<7) {
                fetch();
            }
            $interval.cancel($rootScope.backgroundSeedsResultsServicePromise);
            $rootScope.backgroundSeedsResultsServicePromise = $interval(backgroundService, 5000);
            isRunning=false;
        }
    }
    backgroundService();

	/** end results */


	$scope.newDeepCrawl = function(){
		domFactory.navigateToUrl("#/new-deep-crawl");

	};
	$scope.newSmartCrawl = function(){
		domFactory.navigateToUrl("/new-smart-crawl");
	};

}]);



/* FILE OPEN */
ngApp.directive('chooseFile', function() {
    return {
        link: function (scope, elem, attrs) {
            var button = elem.find('button');
            var input = angular.element(elem[0].querySelector('input#fileInput'));
            button.bind('click', function() {
                input[0].click();
            });
            input.bind('change', function(e) {
                scope.$apply(function() {
                	console.log("change triggered");
                    var files = e.target.files;
                    if (files[0]) {
                        var f = files[0];
                        scope.fileName = f.name;
                        r = new FileReader();

                        r.onloadend = function(e) {
                            var data = e.target.result;
							scope.addUrlsFromFile(data);
                        };

                        r.readAsBinaryString(f);

						// resets the field allowing to upload several times on the same file
						e.target.value=null;

                    } else {
                        scope.fileName = null;
                    }
                });
            });
        }
    };
});

