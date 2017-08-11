/**
 * Created by tomas on 11/08/17.
 */

ngApp.controller('newDeepCrawlController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, $mdDialog) {

/** filters **/
    $scope.items = ["Seeds", "Onions", "Google", "Bing"];
        $scope.selected = ["Seeds", "Onions", "Google", "Bing"];
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
            return ($scope.selected.length !== 0 &&
                $scope.selected.length !== $scope.items.length);
        };

        $scope.isChecked = function() {
            return $scope.selected.length === $scope.items.length;
        };

        $scope.toggleAll = function() {
            if ($scope.selected.length === $scope.items.length) {
                $scope.selected = [];
            } else if ($scope.selected.length === 0 || $scope.selected.length > 0) {
                $scope.selected = $scope.items.slice(0);
            }
        };


/** results */

    /** Begins results */

	$scope.bottomOfPageReached = function(){
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


}]);

