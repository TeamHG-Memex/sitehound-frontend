/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('newDeepCrawlController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'deepcrawlerFactory', '$mdDialog',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, deepcrawlerFactory, $mdDialog) {

    $scope.nResultsOptions=["100", "1.000", "10.000", "100.000", "1.000.000", "10.000.000"];
    $scope.nResults ="10.000.000";

    $scope.sourcesCodes = ["SE", "MANUAL", "TOR"];

    /** filters **/
    $scope.sources = [
        {"name":"Search Engines", "code":"searchengine", "shortCode":"SE", "results":0},
        {"name":"Seeds", "code":"imported", "shortCode":"MANUAL", "results":0},
        {"name":"Onions", "code":"tor", "shortCode":"TOR", "results":0}
        // {"name":"DeepDeep", "code":"deepdeep", "shortCode":"DD", "results":0}
    ];

    /** tabs */
    $scope.tabs = {};
    $scope.selectedTabIndex = 0;

    function init(){
        for(var i=0; i<$scope.sources.length; i++){
            var source = $scope.sources[i];
            var tab = {};
            tab.source=source;
            tab.nResults=null;
            tab.elems=[];
            tab.selected=[];
            tab.allSelected=false;
            tab.lastId=null;
            $scope.tabs[source.shortCode] = tab;
            fetch(tab);
        }
        $scope.getAggregated();
    }

    $scope.toggleAll = function(tab) {
        if (tab.selected.length == tab.elems.length){
            tab.selected = [];
            tab.allSelected=false;
        } else {
            for(var i=0; i<tab.elems.length; i++){
                var idx = tab.selected.indexOf(tab.elems[i]._id);
                if (idx == -1) {
                    tab.selected.push(tab.elems[i]._id);
                }
            }
            if(tab.elems.length!=tab.nResults){
                // not all were displayed yet
                var res = confirm("Also apply selection to all " + tab.nResults + " results?");
                if(res){
                    tab.allSelected= true;
                }
                else{
                    tab.allSelected=false;
                }
            }

        }
    };

    $scope.toggle = function (item, list) {
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
        }
        else {
            list.push(item);
        }
    };

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.isIndeterminate = function(tab) {
        return tab.selected.length !== 0 && (tab.selected.length !== tab.elems.length);
    };

    $scope.isChecked = function(tab) {
        return tab.selected.length !== 0 && (tab.selected.length === tab.elems.length);
    };



    /** Begins results */

	// $scope.currentResults=0;
    $scope.showProgress=false;
	$scope.bottomOfPageReached = function(tab){
	    if($scope.showProgress){
	        return; // don't double do it
        }
	    $scope.showProgress=true;
	    console.log("bottomOfPageReached:" + tab);
		fetch(tab);
	};

    function fetch(tab){
        var filters = {};
        filters["sources"] = [tab.source.code];
        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
        }

        seedUrlFactory.get($scope.master.workspaceId, filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;
				Array.prototype.push.apply(tab.elems, tempResults);

				if(tab.allSelected){
                    for(var i=0; i<tempResults.length;i++){
                        tab.selected.push(tempResults[i]._id);
                    }
                }
				tab.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					(tab.elems.length > 0 ? tab.elems[tab.elems.length-1]._id : null) ;

				$scope.showProgress=false;
                tab.disabled= (tab.elems.length ==0);
			},
			function(response) {
				$scope.showProgress=false;
				console.log(response);
			});
    }


    /** aggregated results by source */

	$scope.getAggregated = function() {
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
        });

        setTabsValue("SE", resultStruct["SE"]["total"]);
        setTabsValue("MANUAL", resultStruct["MANUAL"]["total"]);
        setTabsValue("TOR", resultStruct["TOR"]["total"]);
        // setTabsValue("DD", resultStruct["DD"]["total"]);
    }

    function setTabsValue(shortCode, value){
        $scope.tabs[shortCode].nResults=value;
    }


    $scope.newDeepCrawlConfirmation = function(ev) {
        var elem = {};
    	elem.workspaceId = $scope.master.workspaceId;
        elem.nResults = parseInt($scope.nResults.replaceAll("\\.",""));
    	elem.tabs= $scope.tabs;

        $mdDialog.show({
            title:"bla",
            controller: 'myDialogController',
            // controller: DialogController,
            locals:{item: elem},
            // templateUrl: 'dialog1.tmpl.html',
            templateUrl: 'static/partials-md/templates/new-deep-crawl-confirm.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function(answer) {
                if(answer){
                    deepcrawl();
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

    function deepcrawl(){

        var data = {};
        for(var i=0; i<$scope.sourcesCodes.length; i++){
            var sourceCode = $scope.sourcesCodes[i];
            data[sourceCode] = {};

            data[sourceCode].selected = $scope.tabs[sourceCode].selected;
            data[sourceCode].allSelected = $scope.tabs[sourceCode].allSelected;
            data[sourceCode].source =$scope.tabs[sourceCode].source.code;

            if(data[sourceCode].allSelected){
                var elems = $scope.tabs[sourceCode].elems;
                var unselected = [];
                for(var j=0; j<elems.length; j++){
                    var elem = elems[j];
                    if(data[sourceCode].selected.indexOf(elem._id)<0){
                        unselected.push(elem._id);
                    }
                }
                data[sourceCode].unselected = unselected;
            }
        }

        var nResults = parseInt($scope.nResults.replaceAll("\\.",""));
        deepcrawlerFactory.publish2DeepCrawl($scope.master.workspaceId, nResults, data);
    }

    init();
}]);

