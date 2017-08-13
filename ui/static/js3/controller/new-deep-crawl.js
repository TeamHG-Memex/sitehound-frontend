/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('newDeepCrawlController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {

/** filters **/
    $scope.items = ["Seeds", "Onions", "Google", "Bing"];
    $scope.selected = [];//["Seeds", "Onions", "Google", "Bing"];

    $scope.seedUrls = [];
    $scope.selectedResults=[];

        $scope.toggleAll = function() {
        if ($scope.selected.length === $scope.items.length) {
            $scope.selected = [];
            $scope.selectedResults = [];
        } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
            $scope.selected = $scope.items.slice();
            $scope.selectedResults = $scope.seedUrls.slice();
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

    function traslate(userTerm){
        if(userTerm=="Seeds"){
            return "MANUAL";
        }
        else if(userTerm=="Onions"){
            return "TOR";
        }
        else if(userTerm=="Google"){
            return "GOOGLE";
        }
        else if(userTerm=="Bing"){
            return "BING";
        }
        else{
            console.log("unkonwn " + userTerm);
        }
    }

    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.isIndeterminate = function() {
        return  ($scope.selected.length !== 0 && $scope.selected.length !== $scope.items.length ) ||
                ($scope.selectedResults.length != 0 && $scope.selectedResults.length !== $scope.seedUrls.length);
    };

    $scope.isChecked = function() {
        return $scope.selected.length === $scope.items.length && $scope.selectedResults.length === $scope.seedUrls.length;
    };



    // sub-main
    $scope.toggleBySource = function (item, list, source) {
        source = traslate(source);
        var idx = list.indexOf(item);
        if (idx > -1) {
            list.splice(idx, 1);
            for(var i=$scope.selectedResults.length-1; i>=0; i--){
                if($scope.selectedResults[i].crawlEntityType==source) {
                    $scope.selectedResults.splice(i, 1);
                }
            }
        }
        else {
            list.push(item);
            for(var i=0; i<$scope.seedUrls.length; i++){
                if($scope.seedUrls[i].crawlEntityType==source){
                    $scope.selectedResults.push($scope.seedUrls[i]);
                }
            }
        }
    };


    /** Begins results */

	$scope.bottomOfPageReached = function(){
		fetch();
	};

    $scope.filters = {};
	$scope.filters.sources = [];
	$scope.filters.relevances = [];
	$scope.filters.categories = [];
	$scope.filters.udcs = [];

	$scope.filters.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;

	function fetch(){

        seedUrlFactory.get($scope.master.workspaceId, $scope.filters)
		.then(
			function (response) {
				console.log("finish fetching seed Urls");
				var tempResults = response.data;
				Array.prototype.push.apply($scope.seedUrls, tempResults);

				$scope.filters.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
					($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
			},
			function (response) {
				console.log(response);
			});
	}

	fetch();


    /**
     * sends
     * 1) for the ones displayed, the checked status
     * 2) for the ones not yet fetched, the main/submain checkbox status
     * @param ev
     */
	$scope.newDeepCrawl = function (ev) {
	    console.log(ev);
        alert("deepcrawl!");
    }

}]);

