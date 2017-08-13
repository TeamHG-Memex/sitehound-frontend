/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('newDeepCrawlController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {

/** filters **/
    $scope.sources = [
            {"name":"Seeds", "code":"MANUAL", "results":123},
            {"name":"Onions", "code":"TOR", "results":123},
            {"name":"Google", "code":"GOOGLE", "results":123},
            {"name":"Bing", "code":"BING", "results":123}
    ];

    $scope.selected = [];//["Seeds", "Onions", "Google", "Bing"];

    $scope.seedUrls = [];
    $scope.selectedResults=[];

    $scope.toggleAll = function() {
        if ($scope.selectedResults.length === $scope.seedUrls.length) {
            // $scope.selected = [];
            $scope.selectedResults = [];
        } else if ($scope.selectedResults.length === 0 || $scope.selectedResults.length > 0) {
            // $scope.selected = $scope.items.slice();
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


    $scope.exists = function (item, list) {
        return list.indexOf(item) > -1;
    };

    $scope.isIndeterminate = function() {
        return $scope.selectedResults.length !== 0 && $scope.selectedResults.length !== $scope.seedUrls.length;
    };

    $scope.isChecked = function() {
        return $scope.selectedResults.length === $scope.seedUrls.length;
    };



    // sub-main
    $scope.filterBySource = function (source) {
        console.log(source);
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

