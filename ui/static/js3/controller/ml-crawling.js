ngApp.controller('mlCrawlingController', ['$scope', '$rootScope', '$filter', '$interval', '$timeout', 'seedUrlFactory','eventFactory', 'progressFactory'
, function ($scope, $rootScope, $filter, $interval, $timeout, seedUrlFactory, eventFactory, progressFactory){

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

	}

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

    $scope.getAllProgress = function(workspaceId){
        progressFactory.getAllProgress(workspaceId).then(
		function (response) {
		    //model
//		    debugger;
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



    $scope.modelerProgress = [];
    $scope.getModelerProgress = function(workspaceId){
        progressFactory.getModelerProgress(workspaceId).then(
		function (response) {
            $scope.modelerProgress = response.data;
            $scope.modelerProgress.advice = $scope.adviceParser($scope.modelerProgress.advice, $scope.modelerProgress.tooltips);
			$scope.loading = false;
        },
		function (error) {
			$scope.status = 'Unable to load data: ' + error.message;
			$scope.loading = false;
        });
    }




	var isRunning = false;
	function backgroundService(){
		if(!isRunning){
			isRunning = true;
            $scope.getAggregated();
            $scope.master.reloadWorkspace($scope.master.workspaceId);

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


    $scope.keywords_div_content = true;
    $scope.toggleKeywords = function(state){
        $scope.keywords_div_content = state;
//        $scope.seed_url_div_content = false;
//        $scope.deep_web_div_content = false;
 //       $scope.deep_learning_div_content = false;
    }

    $scope.seed_url_div_content = false;
    $scope.toggleSeedUrl = function(state){
//        $scope.keywords_div_content = false;
        $scope.seed_url_div_content = state;
//        $scope.deep_web_div_content = false;
//        $scope.deep_learning_div_content = false;
    }

    $scope.search_url_div_content = false;
    $scope.toggleSearchUrl = function(state){
//        $scope.keywords_div_content = false;
        $scope.search_url_div_content = state;
//        $scope.deep_web_div_content = false;
//        $scope.deep_learning_div_content = false;
    }

    $scope.deep_web_div_content = false;
    $scope.toggleDeepWeb = function(state){
//        $scope.keywords_div_content = false;
//        $scope.seed_url_div_content = false;
        $scope.deep_web_div_content = state;
//        $scope.deep_learning_div_content = false;
    }

    $scope.custom_training_div_content = false;
    $scope.toggleCustomTraining = function(state){
//        $scope.keywords_div_content = false;
//        $scope.seed_url_div_content = false;
        $scope.custom_training_div_content = state;
//        $scope.deep_learning_div_content = false;
    }

    $scope.deep_learning_div_content = true;
    $scope.toggleDeepLearning = function(state){
//        $scope.keywords_div_content = false;
//        $scope.seed_url_div_content = false;
//        $scope.deep_web_div_content = false;
        $scope.deep_learning_div_content = state;
    }


    $scope.showMoreStatus = false;
    $scope.toggleShowMore = function(){
        $scope.showMoreStatus = !$scope.showMoreStatus;
    }

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
