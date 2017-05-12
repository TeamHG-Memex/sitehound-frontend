ngApp.controller('seedInputController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService', 'importUrlFactory',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, importUrlFactory) {


    $scope.master.init();


    /** BEGIN GENERATE SE**/
    $scope.selected = {};
    $scope.selected.sources = ['SE'];
    $scope.nResults=100;



	$scope.generateSeedUrls = function(ev){


        if($scope.master.keywordsCount==0){
            var custom = {};
            custom.title = 'Included Keywords not provided';
            custom.textContent = 'Please enter some Included Keywords for querying the Source/s.';
            $scope.master.showAlert(ev, custom);
            return;
		}

        if($scope.selected.sources.length == 0){
        	var custom = {};
        	custom.title = 'Source was not provided';
        	custom.textContent = 'Please select the Source from where to get the crawling data.';
            $scope.master.showAlert(ev, custom);
            return;
        }

		fetchService.generate($scope.master.workspaceId, $scope.nResults, $scope.master.crawlProvider, $scope.selected.sources)
		.then(
			function (response) {
			$scope.jobId = response.data.jobId;
			$scope.showByKeywordsProgressTab = true;
			},
			function(response) {
				console.log(response);
			}
		);
	};

	$scope.showByKeywordsProgressTab = false;
	$scope.jobId = "";



	// BEGIN UPLOAD
	$scope.upload = {};


	$scope.import = function(ev) {
		if ($scope.upload.urlsToAdd == undefined || $scope.upload.urlsToAdd.length == 0){
			// alert('Please enter some urls');
            var custom = {};
            custom.title = 'URL/s not provided';
            custom.textContent = 'Please enter some URLs to fetch the data from.';
            $scope.master.showAlert(ev, custom);
            return;
		}
		importUrlFactory.save($scope.master.workspaceId, $scope.upload.urlsToAdd, $scope.upload.relevance).then(
			function(response){
				console.log(response.data);
			    $scope.upload.urlsToAdd="";
                $scope.showByurlProgressTab = true;
			},
			function(response){
				console.log(response);
			}
		)
    };

    $scope.showByurlProgressTab = false;


}]);
