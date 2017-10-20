ngApp.controller('newDeepCrawlController', ['$scope', '$filter', 'domFactory', 'seedFactory', 'fetchService', 'seedUrlFactory', 'deepcrawlerFactory', '$mdDialog',
function ($scope, $filter, domFactory, seedFactory, fetchService, seedUrlFactory, deepcrawlerFactory, $mdDialog) {

    console.log("loading new-deep-crawl.js");

    $scope.master.init();

    // $scope.sourcesCodes = ["SE", "MANUAL", "TOR"];
    $scope.sourcesCodes = ["FETCHED", "MANUAL"];

    /** filters **/
    $scope.sources = [
        // {"name":"Search Engines", "code":"searchengine", "shortCode":"SE", "results":0},
        // {"name":"Seeds", "code":"imported", "shortCode":"MANUAL", "results":0},
        // {"name":"Onions", "code":"tor", "shortCode":"TOR", "results":0}
        {"name":"Search Engines", "code":"FETCHED", "results":0},
        {"name":"Seeds",          "code":"MANUAL",  "results":0}
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

            tab.countSelected = function(){
                return tab.selected.length + (tab.allSelected? (tab.nResults - tab.elems.length):0);
            };


            $scope.tabs[source.code] = tab;
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
        filters["keywordSourceType"] = [tab.source.code];
        if(tab.lastId){
            filters["lastId"] = [tab.lastId];
        }

        seedUrlFactory.getToDeepCrawl($scope.master.workspaceId, filters)
		.then(
			function (response) {
				console.log("finish getToDeepCrawl");
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
		seedUrlFactory.getAggregatedToDeepCrawl($scope.master.workspaceId)
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

    // [{"count": 4, "_id": {"keywordSourceType": "MANUAL"}}, {"count": 40, "_id": {"keywordSourceType": "FETCHED"}}]

    function buildAggregatedBy(seedUrlAggregated){
        var resultStruct = {
        "MANUAL":0,
        "FETCHED":0
        };


       angular.forEach(seedUrlAggregated, function(value, index){
            $scope.tabs[value["_id"]["keywordSourceType"]].nResults=value["count"];
        });

    }

    $scope.newDeepCrawlConfirmation = function(ev) {
        var elem = {};
    	elem.workspaceId = $scope.master.workspaceId;
    	elem.tabs= $scope.tabs;

        elem.nResultsOptions=["100", "1.000", "10.000", "100.000", "1.000.000", "10.000.000"];
        elem.nResults ="10.000.000";

        var selectedPages = 0;
        for(var i=0; i<$scope.sourcesCodes.length; i++){
            var tab = $scope.tabs[$scope.sourcesCodes[i]];
            selectedPages += tab.selected.length + (tab.allSelected? (tab.nResults - tab.elems.length):0);
        }

        if(selectedPages ==0){
            alert("Please select some pages to deepcrawl first");
            return;
        }

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
                    // elem.nResults = parseInt(elem.nResults.replaceAll("\\.",""));
                    $scope.nResults= parseInt(elem.nResults.replaceAll("\\.",""));
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

        // var nResults = parseInt($scope.nResults.replaceAll("\\.",""));
        deepcrawlerFactory.start($scope.master.workspaceId, $scope.nResults, data).then(
            function(response){
                console.log(response);
                var jobId = response.data.jobId;
                domFactory.navigateToDeepcrawlJob(jobId);
            },
            function(err){
                console.log(err);
            }
        )

    }

    init();
}]);

