ngApp.controller('dashboardController', ['$scope', '$rootScope', '$filter', '$interval', '$routeParams', '$timeout', 'domFactory', 'workspaceFactory', 'seedUrlFactory', 'eventFactory', 'progressFactory', 'focusFactory', 'userDefinedCategoriesFactory', 'labelUserDefinedCategoriesFactory'
, function ($scope, $rootScope, $filter, $interval, $routeParams, $timeout, domFactory, workspaceFactory, seedUrlFactory, eventFactory, progressFactory, focusFactory, userDefinedCategoriesFactory, labelUserDefinedCategoriesFactory){

	$scope.workspaceId = $routeParams.workspaceId;
    $scope.workspace = {};

    $scope.navigateToSeed = function(){
		domFactory.navigateToSeed();
	}

	$scope.navigateToImportUrl = function(){
		domFactory.navigateToImportUrl();
	}

	$scope.navigateToBroadcrawlResultsSummary = function(){
        domFactory.navigateToBroadcrawlResultsSummary();
	}

	$scope.navigateToBroadcrawlResults = function(){
        domFactory.navigateToBroadcrawlResults();
	}


	$scope.navigateToJobs = function(){
        domFactory.navigateToJobs();
	}

	$scope.navigateToBroadcrawlNew = function(){
        domFactory.navigateToBroadcrawlNew();
	}


    $scope.viewDetailsByCrawlTypeSource = function(crawlEntityType){
        domFactory.navigateTo(crawlEntityType);
    }

    $scope.navigateToUserDefinedCategories = function(){
		domFactory.navigateToUserDefinedCategories();
	}


    $scope.navigateToLabelUserDefinedCategories = function(){
        domFactory.navigateToLabelUserDefinedCategories ();
    }

	$scope.getWorkspace = function() {
        var tOut = $scope.startLoading();
		workspaceFactory.getWorkspace($scope.workspaceId)
			.success(function (data) {
    			$scope.workspace = data;
				$scope.endLoading(tOut);
				$scope.getAggregatedLabelUserDefinedCategories();
			})
			.error(function (error) {
				$scope.endLoading(tOut);
				$scope.status = 'Unable to load data: ' + error.message;
			});
	}

    $scope.relevantWords = function(){
        var words = [];
        angular.forEach($scope.workspace.words, function(value,key){
            if(value.score>3){
                words.push(value.word);
            }
        });
        return words;
    }

    $scope.irrelevantWords = function(){
        var words = [];
        angular.forEach($scope.workspace.words, function(value,key){
            if(value.score<3){
                words.push(value.word);
            }
        });
        return words;
    }

    $scope.userDefinedCategoriesCounted = [];


	$scope.startLoading = function(){
		return $timeout(function(){$scope.loading = true;}, 1000);
	}

	$scope.endLoading = function(timeoutHandle){
		$timeout.cancel(timeoutHandle);
		$scope.loading = false;
	}


	$scope.getAggregated = function() {
        var tOut = $scope.startLoading();
		seedUrlFactory.getAggregated($scope.workspaceId)

			.success(function (data) {
    			$scope.seedUrlAggregated = data;
    			buildAggregatedBy($scope.seedUrlAggregated);
				$scope.endLoading(tOut);
			})
			.error(function (error) {
				$scope.endLoading(tOut);
				$scope.status = 'Unable to load data: ' + error.message;
			});
            isRunning = false;
	}

	$scope.getAggregatedLabelUserDefinedCategories = function() {
	    if($scope.workspace.userDefinedCategories){
            labelUserDefinedCategoriesFactory.getAggregated($scope.workspaceId)
            .success(function (data) {
                $scope.userDefinedCategoriesCounted = userDefinedCategoriesFactory.mergeUserDefinedCategoriesCounted($scope.workspace.userDefinedCategories, data);
            })
            .error(function (error) {
                $scope.status = 'Unable to load data: ' + error.message;
            });
	    }
	}

    $scope.resultStruct = {
        "SE":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "DD":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "MANUAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "TOR":{"relevant":0, "irrelevant":0, "neutral":0, "total":0}
    };


    function buildAggregatedBy(seedUrlAggregated){
        var resultStruct = {
        "SE":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "DD":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "MANUAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "TOR":{"relevant":0, "irrelevant":0, "neutral":0, "total":0}
        };
        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined || value._id.relevant === null ? "neutral" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["neutral"] ;
        })
        $scope.resultStruct = resultStruct ;

    }

	$scope.getWorkspace();
	$scope.getAggregated();


	$scope.submittedOk = false;
	$scope.submittedError = false;

	$scope.hideSubmittedOk = function(){
		$scope.submittedOk = false;
	}
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	}


	$scope.generateSeedUrls = function(crawlSourceType){
		$scope.errorMessage = "";
		$scope.loading = true;

		var nResults = 100;
		var crawlProvider = "HH_JOOGLE";
		var crawlSources = [];
        crawlSources.push(crawlSourceType);


		seedUrlFactory.generate($scope.workspaceId, nResults, crawlProvider, crawlSources)
		.success(function (data) {
			$scope.submittedOk = true;
			$scope.submittedError = false;
            focus('feedback');
		})
		.error(function (error) {
			$scope.errorMessage = error.message;
			$scope.submittedOk = false;
			$scope.submittedError = true;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}


	$scope.resetResults = function(crawlSourceType){
		var confirmed = confirm('Are you sure you want to remove all the existing results?');
		if (!confirmed){
			return;
		}

		$scope.loading = true;
		seedUrlFactory.resetResults($scope.workspaceId, crawlSourceType)
		.success(function (data) {
			$scope.seedUrls = [];
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}



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

    $scope.getAllProgress = function(workspaceId){
        progressFactory.getAllProgress(workspaceId)
		.success(function (data) {
		    //model
//		    debugger;
//            $scope.modelerProgress = data.model;
//            $scope.modelerProgress.advice = $scope.adviceParser($scope.modelerProgress.advice, $scope.modelerProgress.tooltips);
            //trainer
            $scope.trainerProgress = data.trainer;

            //broadcrawl
            $scope.broadcrawlerProgress = data.crawler;

        })
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
        })
		.finally(function(){
			$scope.loading = false;
		});
    }



    $scope.modelerProgress = [];
    $scope.getModelerProgress = function(workspaceId){
        progressFactory.getModelerProgress(workspaceId)
		.success(function (data) {
            $scope.modelerProgress = data;
            $scope.modelerProgress.advice = $scope.adviceParser($scope.modelerProgress.advice, $scope.modelerProgress.tooltips);
        })
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
        })
		.finally(function(){
			$scope.loading = false;
		});
    }
//
//    $scope.getModelerProgress($scope.workspaceId);
//    $interval.cancel($rootScope.modelerPromise);
//    $rootScope.modelerPromise = $interval($scope.getModelerProgress, 5000, 0, true, $scope.workspaceId);


/*
    $scope.trainerProgress = "";
    $scope.getTrainerProgress = function(workspaceId){
        progressFactory.getTrainerProgress(workspaceId)
		.success(function (data) {
            $scope.trainerProgress = data;
        })
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
        })
		.finally(function(){
			$scope.loading = false;
		});
    }

//    $scope.getTrainerProgress($scope.workspaceId);
//    $interval.cancel($rootScope.trainerPromise);
//    $rootScope.trainerPromise = $interval($scope.getTrainerProgress, 5000, 0, true, $scope.workspaceId);

*/



	var isRunning = false;
	function backgroundService(){
		if(!isRunning){
			isRunning = true;
            $scope.getAggregated();
            $scope.getWorkspace();

            $scope.getModelerProgress($scope.workspaceId);
//            $scope.getTrainerProgress($scope.workspaceId);
            $scope.getAllProgress($scope.workspaceId);

            $interval.cancel($rootScope.backgroundServicePromise);
            $rootScope.backgroundServicePromise = $interval(backgroundService, 15000);
		}
	}

    backgroundService();

    $scope.stopBroadCrawl = function(){
        eventFactory.postDdCrawler($scope.workspaceId, "stop");
    };


    //container toggle
    $scope.toggleKeywords = function(state){
        $rootScope.keywords_div_content = state;
    };
    $scope.toggleSeedUrl = function(state){
        $rootScope.seed_url_div_content = state;
    };
    $scope.toggleSearchUrl = function(state){
        $rootScope.search_url_div_content = state;
    };
    $scope.toggleDeepWeb = function(state){
        $rootScope.deep_web_div_content = state;
    };
    $scope.toggleCustomTraining = function(state){
        $rootScope.custom_training_div_content = state;
    };
    $scope.toggleDeepLearning = function(state){
        $rootScope.deep_learning_div_content = state;
    };


    $scope.showMoreStatus = false;
    $scope.toggleShowMore = function(){
        $scope.showMoreStatus = !$scope.showMoreStatus;
    };

    $scope.getMoreStatusIsNotEmpty = function(){
        return $scope.modelerProgress &&
                $scope.modelerProgress.description &&
                $scope.modelerProgress.description.length>0;
    }


    $scope.showFeatureWeightsStatus = false;
    $scope.toggleFeatureWeights = function(){
        $scope.showFeatureWeightsStatus = !$scope.showFeatureWeightsStatus;
    }

    $scope.getFeatureWeightsStatusIsNotEmtpy = function(){
        return  $scope.modelerProgress &&
                $scope.modelerProgress.weights &&
                $scope.modelerProgress.weights.pos &&
                $scope.modelerProgress.weights.neg &&
                ($scope.modelerProgress.weights.pos.length + $scope.modelerProgress.weights.neg.length)>0;
    }




    $scope.adviceParser = function(advices, tooltips){

        var adviceArray=[];

        var tooltipsKeys=[];
        angular.forEach(tooltips, function(value,key){
            tooltipsKeys.push(key);
        });


        angular.forEach(advices, function(value,key){
            var advice = {"kind": value.kind};
            advice.messages = $scope.tooltipParser(value.text, tooltipsKeys, tooltips);
            adviceArray.push(advice);
        });
        return adviceArray;
    }



    $scope.tooltipParser = function(text, tooltipsKeys, tooltips){

        var arr = [];

        if(text=="" || !text){
            return arr;
        }

        var positionArr = findPositionArray(text, tooltipsKeys);

        positionArr.sort(function(a, b){
            return a.pos - b.pos;
        })

        var right_text = text;
        var lastIndex = 0;
        angular.forEach(positionArr, function(value, key){
                var left_text = text.substr(lastIndex, value.pos + value.key.length - lastIndex);
                right_text = text.substr(value.pos + value.key.length);
                var tooltipText = tooltips[value.key];

                arr.push({"text":left_text, "tooltip": tooltipText });
                lastIndex=value.pos + value.key.length;
        });
        arr.push({"text":right_text, "tooltip": null});

        return arr;
    }

    function findPositionArray(text, tooltips){
        var positionArr = [];
        for (i = 0; i < tooltips.length; i++) {
            var key = tooltips[i];
            var textTemp = text;
            while (textTemp.indexOf(key)>-1) {
                var right_text = textTemp.substr(text.indexOf(key) + key.length);
                positionArr.push({"pos": textTemp.indexOf(key), "key": key});
                textTemp = right_text;
            }
        }
        return positionArr;
    }

}]);
