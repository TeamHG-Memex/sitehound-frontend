ngApp.controller('modelController', ['$scope', '$rootScope', '$filter', '$interval', '$mdDialog', 'domFactory', 'seedUrlFactory', 'modelerFactory', 'trainerFactory', 'smartCrawlerFactory',
function ($scope, $rootScope, $filter, $interval, $mdDialog, domFactory, seedUrlFactory, modelerFactory, trainerFactory, smartCrawlerFactory) {

    console.log("loading model");

    $scope.master.init();

/** filters **/
    $scope.sources = [
        {"name":"Clear web", "codes":["searchengine", "deepdeep"], "shortCode":"SE"},
        {"name":"Dark web", "codes":["tor"], "shortCode":"TOR"},
    ];

    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;

    function init(){
        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            // tab.nResults=null;
            tab.aggregatedResults=null;
            tab.elems=[];
            tab.lastId=null;
            tab.lastSource=null;
            tab.selected=[];
            tab.allSelected=false;
            $scope.tabs[source.shortCode] = tab;
            fetch(tab, getNextElem);
            tab.currentElem=null;
        }
        getAggregated();
    }

    function getNextElem(tab){
        if(tab.elems.length>0){
            tab.currentElem = tab.elems.splice(0, 1);
        }
        else{
            $scope.showProgress=true;
            fetch(tab, getNextElem);
        }
        if(tab.elems.length<4){
            fetch(tab);
        }
    }

    $scope.showUnderTheHood = false;
    $scope.toogleShowUnderTheHood = function (value) {
        $scope.showUnderTheHood = value;
    };

    $scope.modelerProgress={};
    $scope.modelerProgress["quality"] = {};
    $scope.modelerProgress["percentage_done"] = 0;

    $scope.getModelerProgress = function(){
        modelerFactory.getProgress($scope.master.workspaceId)
            .then(
                function(response){
                    if(response.data["quality"]){
                        $scope.modelerProgress["quality"] = response.data["quality"];
                        $scope.modelerProgress["quality"].advice = $scope.adviceParser($scope.modelerProgress["quality"].advice, $scope.modelerProgress["quality"].tooltips);
                    }
                    if(response.data["percentage_done"]){
                        $scope.modelerProgress["percentage_done"] = response.data["percentage_done"];
                    }
                },
                function(response){console.log(response);}
            )
    };



    // $scope.showMoreStatus = false;
    // $scope.toggleShowMore = function(){
    //     $scope.showMoreStatus = !$scope.showMoreStatus;
    // };
    //
    // $scope.getMoreStatusIsNotEmpty = function(){
    //     return $scope.modelerProgress["quality"] &&
    //             $scope.modelerProgress["quality"].description &&
    //             $scope.modelerProgress["quality"].description.length>0;
    // };
    //

    $scope.showFeatureWeightsStatus = false;
    $scope.toggleFeatureWeights = function(){
        $scope.showFeatureWeightsStatus = !$scope.showFeatureWeightsStatus;
    };

    $scope.getFeatureWeightsStatusIsNotEmtpy = function(){
        return  $scope.modelerProgress["quality"] &&
                $scope.modelerProgress["quality"].weights &&
                $scope.modelerProgress["quality"].weights.pos &&
                $scope.modelerProgress["quality"].weights.neg &&
                ($scope.modelerProgress["quality"].weights.pos.length + $scope.modelerProgress["quality"].weights.neg.length)>0;
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
    };



    $scope.tooltipParser = function(text, tooltipsKeys, tooltips){

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
                var left_text = text.substr(lastIndex, value.pos - lastIndex);
                right_text = text.substr(value.pos + value.key.length);
                var tooltipText = tooltips[value.key];

                arr.push({"text":left_text, "tooltipKey": value.key, "tooltip": tooltipText });
                lastIndex=value.pos + value.key.length;
        });
        arr.push({"text":right_text, "tooltip": null});

        return arr;
    };

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


    $scope.trainerProgress={};
    $scope.trainerProgress["progress"] = "";
    $scope.trainerProgress["percentage_done"] = 0;

    $scope.getTrainerProgress = function(){
        trainerFactory.getProgress($scope.master.workspaceId)
            .then(
                function(response){
                    // console.log(response);
                    if(response.data["progress"]){
                        $scope.trainerProgress["progress"] = response.data["progress"];
                    }
                    if(response.data["percentage_done"]){
                        $scope.trainerProgress["percentage_done"] = response.data["percentage_done"];
                    }
                },
                function(response){console.log(response);}
            )
    };





    /** ends progress **/


	var isRunning = false;
	function backgroundService(){
		if(!isRunning){
			isRunning = true;
            $scope.getModelerProgress();
            $scope.getTrainerProgress();
            $interval.cancel($rootScope.backgroundServicePromise);
            $rootScope.backgroundServicePromise = $interval(backgroundService, 5000);
			isRunning = false;
		}
	}

    backgroundService();



    /** Begins label **/

    $scope.label= function (ev, tab, elem, relevance) {
        tab.currentElem=null;
        seedUrlFactory.label($scope.master.workspaceId, elem._id, relevance)
        .then(
			function (response) {
                getAggregated();
            },
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			}
        );
        getNextElem(tab);
    };


    /** Begins results */

    $scope.showProgress=false;

    function fetch(tab, callback){
        var filters = {};
        filters["sources"] = tab.source.codes;
        filters["relevances"] = ["unset"];
        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
            filters["lastSource"] = [tab.lastSource];
        }

        seedUrlFactory.get($scope.master.workspaceId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls (model)");
				var tempResults = response.data;
				Array.prototype.push.apply(tab.elems, tempResults);

				if(tab.allSelected){
                    for(var i=0; i<tempResults.length;i++){
                        tab.selected.push(tempResults[i]._id);
                    }
                }
				// tab.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
                 //    (tab.elems.length > 0 ? tab.elems[tab.elems.length-1]._id : null) ;

				if(tempResults.length > 0){
    				tab.lastId = tempResults[tempResults.length-1]._id;
    				tab.lastSource = tempResults[tempResults.length-1].crawlEntityType;
                }
                else{
				    if(tab.elems.length > 0){
				        tab.lastId = tab.elems[tab.elems.length-1]._id
				        tab.lastSource = tab.elems[tab.elems.length-1].crawlEntityType
                    }
                    else{
				        tab.lastId = null;
				        tab.lastSource = null;
                    }
                }

                tab.disabled= (tab.elems.length == 0);

                // everything was labeled
                if(tempResults.length>0 && callback!=null){
                    callback(tab);
                }
				$scope.showProgress=false;
			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }


    /** aggregated results by source */

	function getAggregated() {
        // var tOut = $scope.startLoading();
		seedUrlFactory.getAggregated($scope.master.workspaceId)
			.then(
			    function (response) {
                    buildAggregatedBy(response.data);
                    // $scope.endLoading(tOut);
                },
                function (error) {
                    // $scope.endLoading(tOut);
                    $scope.status = 'Unable to load data: ' + error.message;
                }
			);
	}

    function buildAggregatedBy(seedUrlAggregated){

        var resultStruct = {
        "SE":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0},
        // "DD":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0},
        // "MANUAL":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0},
        "TOR":{"relevant":0, "irrelevant":0, "skipped":0, "pending":0, "total":0}
        };

        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" || value._id.crawlEntityType =="DD" || value._id.crawlEntityType =="MANUAL" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined ? "pending" : value._id.relevant === null ? "skipped" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["skipped"] + resultStruct[crawlEntityType]["pending"];
        });

        $scope.tabs["SE"].aggregatedResults=resultStruct["SE"];
        $scope.tabs["TOR"].aggregatedResults=resultStruct["TOR"];

    }


    /** begins smart crawl **/
	$scope.newSmartCrawlConfirmation = function (ev) {
        var elem = {};
    	elem.workspaceId = $scope.master.workspaceId;
    	// elem.tabs= $scope.tabs;

        elem.nResultsOptions=["100", "1.000", "10.000", "100.000", "1.000.000", "10.000.000"];
        elem.nResults ="10.000.000";

        // var selectedPages = 0;
        // for(var i=0; i<$scope.sourcesCodes.length; i++){
        //     var tab = $scope.tabs[$scope.sourcesCodes[i]];
        //     selectedPages += tab.selected.length + (tab.allSelected? (tab.nResults - tab.elems.length):0);
        // }
        //
        // if(selectedPages ==0){
        //     alert("Please select some pages to deepcrawl first");
        //     return;
        // }

        $mdDialog.show({
            title:"bla",
            controller: 'myDialogController',
            // controller: DialogController,
            locals:{item: elem},
            // templateUrl: 'dialog1.tmpl.html',
            templateUrl: 'static/partials-md/templates/new-smart-crawl-confirm.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function(answer) {
                if(answer){
                    // elem.nResults = parseInt(elem.nResults.replaceAll("\\.",""));
                    var nResults= parseInt(elem.nResults.replaceAll("\\.",""));
                    smartCrawl(nResults, elem.broadnessNumber);
                }
                else{
                    $scope.status = 'You cancelled the dialog.';
                    console.log($scope.status);
                }
            }, function() {
                $scope.status = 'You cancelled the dialog.';
                console.log($scope.status);
            });
    };


    // Valid return codes are ["DEEP", "N10", "N100", "N1000", "N10000", "BROAD"],
    function getBroadnessCode(broadnessNumber){

        var broadness="DEEP";
        if(broadnessNumber==0){
            broadness="DEEP";
        }
        else if(broadnessNumber==1){
            broadness="N10";
        }
        else if(broadnessNumber==2){
            broadness="N100";
        }
        else if(broadnessNumber==3){
            broadness="N1000";
        }
        else if(broadnessNumber==4){
            broadness="N10000";
        }
        else if(broadnessNumber==5){
            broadness="BROAD";
        }
        return broadness;
    }


	function smartCrawl(nResults, broadnessNumber){

        var broadness = getBroadnessCode(broadnessNumber);

        smartCrawlerFactory.start($scope.master.workspaceId, nResults, broadness).then(
	        function (response) {
                // console.log(response.data);
                var jobId = response.data["jobId"];
                domFactory.navigateToSmartCrawlerResults(jobId);
            },
            function (response) {
                console.log(response.data);
            }
        );

    }

    /**ends smart crawl **/

    init();
}]);

/*
ngApp.filter('broadnessFilter', function() {
    return function(input) {
        // return Math.ceil(input);
		return input.toFixed(2);
    };
});
*/
