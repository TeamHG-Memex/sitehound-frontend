ngApp.controller('mlCrawlingController', ['$scope', '$rootScope', '$filter', '$interval', '$timeout', 'seedUrlFactory','eventFactory', 'progressFactory', 'broadcrawlerFactory'
, function ($scope, $rootScope, $filter, $interval, $timeout, seedUrlFactory, eventFactory, progressFactory, broadcrawlerFactory){

    $scope.master.init();
    $scope.workspaceId = $scope.master.workspaceId;




    $scope.getAggregated = function() {
//        var tOut = $scope.startLoading();
        seedUrlFactory.getAggregated($scope.workspaceId).then(
            function (response) {
                $scope.seedUrlAggregated = response.data;
                buildAggregatedBy($scope.seedUrlAggregated);
//				$scope.endLoading(tOut);
                isRunning = false;
            },
            function (response) {
//				$scope.endLoading(tOut);
//				$scope.status = 'Unable to load data: ' + error.message;
                isRunning = false;
            });

    };


// SIMPLE CRAWLER ///

    $scope.showSimpleCrawlerProgressTab = false;

	$scope.categories = [];
	$scope.languages = [];


	$scope.nResults = 100;
//	$scope.crawlSource_SE = false;
//	$scope.crawlSource_TOR = false;
//	$scope.crawlSource_DD = true;

    $scope.stopBroadCrawl = function(){
        eventFactory.postDdCrawler($scope.workspaceId, "stop");
    };

	$scope.publish2BroadCrawl = function(source){
//		var nResults = parseInt($scope.nResults, 10);
		var crawlSources = [];

//		if($scope.crawlSource_SE){
//			crawlSources.push('SE');
//		}
//		if($scope.crawlSource_TOR){
//			crawlSources.push('TOR');
//		}
//		if($scope.crawlSource_DD){
//			crawlSources.push('DD');
//		}
		if(source == 'SE'){
			crawlSources.push('SE');
		}
//		if(source == 'TOR'){
//			crawlSources.push('TOR');
//		}
        if(source == 'DD'){
			crawlSources.push('DD');
		}

//		var domainTypes = [];

//		$scope.crawlStatusTimeout = null;

		broadcrawlerFactory.publish2BroadCrawl($scope.workspaceId, $scope.nResults, $scope.master.crawlProvider, crawlSources).then(
		function(response){
            $scope.simplecrawlerJobId = response.data.jobId;
            $scope.showSimpleCrawlerProgressTab = false;
			// $scope.getCrawlStatus(response.data.jobId);
//			$scope.status='';
//			$scope.submittedOk = true;
//			$scope.submittedError = false;
		},
		function(response){
			$scope.status = 'Unable to post the Job. ' + (response);
//			$scope.submittedOk = false;
//			$scope.submittedError = true;
		});
	};

	$scope.getCrawlStatus = function(jobId) {
		clearInterval($scope.crawlStatusTimeout);
		broadcrawlerFactory.getCrawlStatus($scope.workspaceId, jobId).then(
		function(response){
			$scope.status = 'Data loaded';
			$scope.categories = response.data.categories;
			$scope.languages = response.data.languages;
			$scope.nResultsFound = response.data.nResults;
			$scope.labelCategories = $scope.categories.length > 0 ? 'Categories Found: ' : '' ;
			$scope.labelLanguages = $scope.languages.length > 0 ? 'Languages Found: ' : '' ;
			$scope.labelnResultsFound = $scope.nResultsFound > 0 ? 'Results Found: ' : '' ;

			$scope.crawlStatusTimeout = setTimeout(function() { $scope.getCrawlStatus(data.jobId);}, 5000);
			$scope.loading = false;

		},
		function(error){
			$scope.crawlStatusTimeout = setTimeout(function() { $scope.getCrawlStatus(data.jobId);}, 5000);
			$scope.status = 'Unable to load data: ' + error;
			$scope.loading = false;
		});
	};


	/**** modal ****/
	$scope.animationsEnabled = true;
	$scope.toggleAnimation = function () {
		$scope.animationsEnabled = !$scope.animationsEnabled;
	};

	$scope.loadModal = function(){

		var nResults = $scope.nResults;
		if(!nResults){
			alert('Please enter the number of URLs to Crawl');
			return false;
		}

		var crawlSources = [];
		if($scope.crawlSource_SE){
			crawlSources.push('SE');
		}
		if($scope.crawlSource_TOR){
			crawlSources.push('TOR');
		}
		if($scope.crawlSource_DD){
			crawlSources.push('DD');
		}

		if(crawlSources.length==0){
			alert('Please select at least one Source');
			return false;
		}

		var args = {};
		args.nResults = $scope.nResults;
		args.crawlProvider = $scope.master.crawlProvider;
		args.crawlSource_SE = $scope.crawlSource_SE;
		args.crawlSource_TOR = $scope.crawlSource_TOR;
		args.crawlSource_DD = $scope.crawlSource_DD;
		args.crawlSources = crawlSources;
		$scope.openModal('default', args);
	}


	$scope.openModal = function (size, args) {

		console.log(args);
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'myModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: size,
			resolve: {
				items: function () {
					return args;
				}
			}
		});

		modalInstance.result.then(function (selectedItem) {
			$scope.selected = selectedItem;
			var jobId = $scope.publish2BroadCrawl();
			console.log('Modal accepted at: ' + new Date());
		}, function () {
			console.log('Modal dismissed at: ' + new Date());
		});
	};





/// ML CRAWLER ///

//	$scope.getAggregatedLabelUserDefinedCategories = function() {
//	    if($scope.master.workspace.userDefinedCategories){
//            labelUserDefinedCategoriesFactory.getAggregated($scope.master.workspaceId).then(
//            function (data) {
//                $scope.userDefinedCategoriesCounted = userDefinedCategoriesFactory.mergeUserDefinedCategoriesCounted($scope.workspace.userDefinedCategories, data);
//            },
//            function (error) {
//                $scope.status = 'Unable to load data: ' + error.message;
//            });
//	    }
//	}

    // $scope.trainSources = ["SE", "MANUAL", "DD", "TOR", "TOTAL"];
    $scope.trainSources = ["SE", "MANUAL", "DD", "TOTAL"];
    $scope.trainOutputs = ["relevant", "neutral", "irrelevant", "total"];

    //immutable!
    var resultStructOriginal = {
        "SE":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "DD":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "MANUAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        // "TOR":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "TOTAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0}
    };

    $scope.resultStruct = resultStructOriginal;


    function buildAggregatedBy(seedUrlAggregated){
        var resultStruct = resultStructOriginal;

        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined || value._id.relevant === null ? "neutral" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["neutral"] ;
        });
        angular.forEach(resultStruct, function(value, index){
            if(index!="TOTAL"){
                resultStruct["TOTAL"]["relevant"] = resultStruct["TOTAL"]["relevant"] + value["relevant"];
                resultStruct["TOTAL"]["neutral"] = resultStruct["TOTAL"]["neutral"] + value["neutral"];
                resultStruct["TOTAL"]["irrelevant"] = resultStruct["TOTAL"]["irrelevant"] + value["irrelevant"];
                resultStruct["TOTAL"]["total"] = resultStruct["TOTAL"]["total"] + value["total"];
            }
        });


        $scope.resultStruct = resultStruct ;
    }


    $scope.getAggregated();




    $scope.startDdModeler = function(){
        eventFactory.postDdModeler($scope.workspaceId, "start");
    };

    $scope.startDdTrainer = function(){
        eventFactory.postDdTrainer($scope.workspaceId, "start");
    };

    $scope.stopDdTrainer = function(){
        eventFactory.postDdTrainer($scope.workspaceId, "stop");
    };

    $scope.postDdCrawler = function(){
        eventFactory.postDdCrawler($scope.workspaceId, "stop");
    };




    $scope.modelerProgress = [];
    $scope.trainerProgress = "";
    $scope.broadcrawlerProgress = "";

    var isRunning = false;


    $scope.stopBroadCrawl = function(){
        eventFactory.postDdCrawler($scope.workspaceId, "stop");
    };

    $scope.showMoreStatus = false;
    $scope.toggleShowMore = function(){
        $scope.showMoreStatus = !$scope.showMoreStatus;
    };

    $scope.getMoreStatusIsNotEmpty = function(){
        return $scope.modelerProgress &&
                $scope.modelerProgress.description &&
                $scope.modelerProgress.description.length>0;
    };

    $scope.showFeatureWeightsStatus = false;
    $scope.toggleFeatureWeights = function(){
        $scope.showFeatureWeightsStatus = !$scope.showFeatureWeightsStatus;
    };

    $scope.getFeatureWeightsStatusIsNotEmtpy = function(){
        return  $scope.modelerProgress &&
                $scope.modelerProgress.weights &&
                $scope.modelerProgress.weights.pos &&
                $scope.modelerProgress.weights.neg &&
                ($scope.modelerProgress.weights.pos.length + $scope.modelerProgress.weights.neg.length)>0;
    };




    function adviceParser(advices, tooltips){
        var adviceArray=[];

        var tooltipsKeys=[];
        angular.forEach(tooltips, function(value,key){
            tooltipsKeys.push(key);
        });

        angular.forEach(advices, function(value,key){
            var advice = {"kind": value.kind};
            advice.messages = tooltipParser(value.text, tooltipsKeys, tooltips);
            adviceArray.push(advice);
        });
        return adviceArray;
    }



    function tooltipParser(text, tooltipsKeys, tooltips){

        var arr = [];

        if(text=="" || !text){
            return arr;
        }

        var positionArr = findPositionArray(text, tooltipsKeys);

        positionArr.sort(function(a, b){
            return a.pos - b.pos;
        });

        var right_text = text;
        var lastIndex = 0;

        angular.forEach(positionArr, function(value, key){
            var left_text = text.substr(lastIndex, value.pos);// + value.key.length - lastIndex);
            var center_text = text.substr(value.pos, value.key.length);
            var tooltipText = tooltips[value.key];
            arr.push({"text":left_text, "tooltip": null });
            arr.push({"text":center_text, "tooltip": tooltipText });
            lastIndex=value.pos + value.key.length;
        });

        if(lastIndex < text.length-1){
            right_text = text.substr(lastIndex);
            arr.push({"text":right_text, "tooltip": null});
        }

        return arr;
    }

    function findPositionArray(text, tooltips){
        var positionArr = [];
        for (i = 0; i < tooltips.length; i++) {
            var key = tooltips[i];
            // var textTemp = text;
            var lastPosition = -1;
            while ((lastPosition = text.indexOf(key, lastPosition + 1)) > -1){
                console.log(lastPosition);
                positionArr.push({"pos": lastPosition, "key": key});
            }
        }
        return positionArr;
    }



    $scope.getModelerProgress = function(workspaceId){
        progressFactory.getModelerProgress(workspaceId).then(
            function (response) {
                $scope.modelerProgress = response.data;
                $scope.modelerProgress.advice = adviceParser($scope.modelerProgress.advice, $scope.modelerProgress.tooltips);
                $scope.loading = false;
            },
            function (error) {
                $scope.status = 'Unable to load data: ' + error.message;
                $scope.loading = false;
            });
    };


    $scope.getAllProgress = function(workspaceId){
        progressFactory.getAllProgress(workspaceId).then(
            function (response) {
                //model
//            $scope.modelerProgress = data.model;
//            $scope.modelerProgress.advice = $scope.adviceParser($scope.modelerProgress.advice, $scope.modelerProgress.tooltips);
                //trainer
                $scope.trainerProgress = response.data.trainer;

                //broadcrawl
                $scope.broadcrawlerProgress = response.data.broadcrawler;
                $scope.loading = false;
            },
            function (response) {
                $scope.status = 'Unable to load data: ' + response;
                $scope.loading = false;
            });
    };

//     function backgroundService(){
//         if(!isRunning){
//             isRunning = true;
//             $scope.getAggregated();
//             $scope.master.reloadWorkspace($scope.master.workspaceId);
//
//             $scope.getModelerProgress($scope.workspaceId);
// //            $scope.getTrainerProgress($scope.workspaceId);
//             $scope.getAllProgress($scope.workspaceId);
//
//             $interval.cancel($rootScope.backgroundServicePromise);
//             $rootScope.backgroundServicePromise = $interval(backgroundService, 15000*10);
//         }
//     }
//
//     backgroundService();


    }]);
