ngApp.controller('dashboardController', ['$scope', '$rootScope', '$filter', '$interval', '$routeParams', '$timeout', 'domFactory', 'workspaceFactory', 'seedUrlFactory', 'eventFactory', 'progressFactory', 'focusFactory', 'userDefinedCategoriesFactory', 'labelUserDefinedCategoriesFactory', 'jobFactory', 'loginInputFactory'
, function ($scope, $rootScope, $filter, $interval, $routeParams, $timeout, domFactory, workspaceFactory, seedUrlFactory, eventFactory, progressFactory, focusFactory, userDefinedCategoriesFactory, labelUserDefinedCategoriesFactory, jobFactory, loginInputFactory){

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
    };

    $scope.goToActionPage = function(){
        domFactory.navigateToUserLoginInput();
    };

    $scope.goToLoginInputSummaryPage = function(){
        domFactory.navigateToUserLoginInputSummary();
    };



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
	};
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	};


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
	};


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
	};



    $scope.startDdModeler = function(){
        eventFactory.postDdModeler($scope.workspaceId, "start");
        $scope.buildingDdModeler=true;
        $scope.modeler = {};
        $timeout(getModelerProgress, 2000)
    };


    // $scope.getAllProgress = function(workspaceId){
    //     progressFactory.getAllProgress(workspaceId)
		// .success(function (data) {
		//     //model
    //
    //         // insert request here!
    //
    //         //trainer
    //         // $scope.trainer.progress = data.trainer.progress;
    //         // $scope.trainer.percentageDone = data.trainer.percentage_done;
    //
    //         //broadcrawl
    //         $scope.broadcrawlerProgress = data.crawler;
    //
    //     })
		// .error(function (error) {
		// 	$scope.status = 'Unable to load data: ' + error.message;
    //     })
		// .finally(function(){
		// 	$scope.loading = false;
		// });
    // };

    $scope.modeler= {};
    $scope.modeler.model = false;
    $scope.modeler.quality = {};
    $scope.buildingDdModeler=false;

    $scope.modeler.init=true;

    function getModelerProgress(){
        if($scope.buildingDdModeler || $scope.modeler.init){

            progressFactory.getModelerProgress($scope.workspaceId)
            .success(function (data) {
                $scope.modeler = data;
                $scope.modeler.quality.advice = $scope.adviceParser($scope.modeler.quality.advice, $scope.modeler.quality.tooltips);
                if($scope.modeler.model){
                    $scope.buildingDdModeler=false;
                }
            })
            .error(function (error) {
                $scope.status = 'Unable to load data: ' + error.message;
            })
            .finally(function(){
                $scope.loading = false;
                $rootScope.backgroundServicePromise_getModelerProgress = $timeout(getModelerProgress, 2000);
            });
        }
    };

    $scope.getModelerPercentageValue = function(){
        var res =0;
        if($scope.modeler && $scope.modeler.percentageDone){
            res = $scope.modeler.percentageDone;
        }
        return res;
    };

    getModelerProgress(); // to set the initial states



    //trainer
    $scope.trainer={};
    $scope.trainer.progress = "";
    $scope.trainer.percentageDone=0;
    $scope.buildingDdTrainer=false;

    $scope.startDdTrainer = function(){
        var crawlSources = "DD";
        var crawlType = "DD-TRAINER";
        var nResults = 1000;
        $scope.trainer={};
        jobFactory.createJob($scope.workspaceId, crawlSources, crawlType, nResults)
            .success(function (data){
                $rootScope.ddTrainerJobId = data.jobId;
                eventFactory.postDdTrainer($scope.workspaceId, "start", $rootScope.ddTrainerJobId);
                $timeout(getTrainerProgress, 2000)
            })
            .error(function (error) {
                console.log(error);
                alert("the job could not be started");
            });
    };

    $scope.stopDdTrainer = function(){
        eventFactory.postDdTrainer($scope.workspaceId, "stop", $rootScope.ddTrainerJobId);
        $rootScope.ddTrainerJobId = null;
    };

    function getTrainerProgress(){
        progressFactory.getTrainerProgress($scope.workspaceId)
		.success(function (data) {
            // $scope.trainer.progress = data;
            $scope.trainer.progress = data.progress;
            $scope.trainer.percentageDone = data.percentageDone;
            $scope.trainer.model = data.model;
            if(data.jobs!=null && data.jobs.length==1){
                $scope.trainer.job = data.jobs[0];
                $rootScope.ddTrainerJobId =$scope.trainer.job["_id"];
            }
            else{
                 $scope.trainer.job={};
            }
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
        })
		.finally(function(){
			if($scope.trainer && $scope.trainer.job && $scope.trainer.job.status=="STOPPED"){ //$scope.trainer.job.status=="FINISHED" ||
                console.log("no reason to keep polling trainer status");
                return;
            }
            $rootScope.backgroundServicePromise_getTrainerProgress = $timeout(getTrainerProgress, 2000);
		});
    };



    $scope.getTrainerPercentageValue = function(){
        var res =0;
        if($scope.trainer && $scope.trainer.percentageDone){
            res = $scope.trainer.percentageDone;
        }
        return res;
    };
    getTrainerProgress();



//CRAWLER

    $scope.crawler = {};
    $scope.crawler.progress = "";
    function getCrawlerProgress(){
        progressFactory.getCrawlerProgress($scope.workspaceId)
		.success(function (data) {
		    $scope.crawler.progress = data.progress;
		    $scope.crawler.percentageDone = data.percentageDone;
		    $scope.crawler.jobs = data.jobs;
            if(data.jobs!=null && data.jobs.length==1){
                $scope.crawler.job = data.jobs[0];
                $rootScope.ddCrawlerJobId =$scope.crawler.job["_id"];
            }
            else{
                 $scope.crawler.job={};
            }
		})
		.error(function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
        })
		.finally(function(){
			if($scope.crawler && $scope.crawler.job && ( $scope.crawler.job.status=="STOPPED")){
			    // even when finished, it continues working on the bg //$scope.crawler.job.status=="FINISHED" ||
                console.log("no reason to keep polling crawler progress");
                return;
            }
			$rootScope.backgroundServicePromise_getCrawlerProgress = $timeout(getCrawlerProgress, 2000);
		});
    };

    $scope.getCrawlerPercentageValue = function(){
        var res =0;
        if($scope.crawler && $scope.crawler.percentageDone){
            res = $scope.crawler.percentageDone;
        }
        return res;
    };

    getCrawlerProgress();

// LOGIN

    $scope.loginInputStats = {};
    $scope.getLoginInputStats = function(workspaceId){
        loginInputFactory.getStats(workspaceId)
            .success(function (data) {
                $scope.loginInputStats["PENDING"]= 0;
                $scope.loginInputStats["COMPLETED"]= 0;
                angular.forEach(data, function (e, i) {
                    if(e["_id"]=="pending"){
                        $scope.loginInputStats["PENDING"]= e["count"]
                    }
                    else if(e["_id"]=="completed"){
                        $scope.loginInputStats["COMPLETED"]= e["count"]
                    }
                });
            })
            .error(function (error) {
                $scope.status = 'Unable to load data: ' + error.message;
            })
            .finally(function(){
                $scope.loading = false;
            });
    };


	var isRunning = false;
	function backgroundService(){
		if(!isRunning){
			isRunning = true;
            $scope.getAggregated();
            $scope.getWorkspace(); // TODO try to remove this!

            // $scope.getModelerProgress();
//            $scope.getTrainerProgress($scope.workspaceId);
//             $scope.getAllProgress($scope.workspaceId);
            $scope.getLoginInputStats($scope.workspaceId);
            $interval.cancel($rootScope.backgroundServicePromise);
            $rootScope.backgroundServicePromise = $interval(backgroundService, 5000);
		}
	}

    // backgroundService();

    $scope.stopBroadCrawl = function(){
		eventFactory.postDdCrawler($rootScope.ddCrawlerJobId, "stop");
        $rootScope.ddCrawlerJobId = null;
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
    $scope.toggleCredentialsCrawler = function(state){
        $rootScope.credentials_crawler_div_content = state;
    };


    $scope.showMoreStatus = false;
    $scope.toggleShowMore = function(){
        $scope.showMoreStatus = !$scope.showMoreStatus;
    };

    $scope.getMoreStatusIsNotEmpty = function(){
        return $scope.modeler.quality &&
                $scope.modeler.quality.description &&
                $scope.modeler.quality.description.length>0;
    };


    $scope.showFeatureWeightsStatus = false;
    $scope.toggleFeatureWeights = function(){
        $scope.showFeatureWeightsStatus = !$scope.showFeatureWeightsStatus;
    };

    $scope.getFeatureWeightsStatusIsNotEmtpy = function(){
        return  $scope.modeler.quality &&
                $scope.modeler.quality.weights &&
                $scope.modeler.quality.weights.pos &&
                $scope.modeler.quality.weights.neg &&
                ($scope.modeler.quality.weights.pos.length + $scope.modeler.quality.weights.neg.length)>0;
    };


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
