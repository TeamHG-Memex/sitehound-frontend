ngApp.controller('seedInputController', ['$scope', '$filter', 'seedFactory', 'fetchService', 'seedUrlFactory', 'trainingService', 'importUrlFactory', '$mdDialog',
function ($scope, $filter, seedFactory, fetchService, seedUrlFactory, trainingService, importUrlFactory, $mdDialog) {


    $scope.master.init();


    /** BEGIN GENERATE SE**/
    $scope.selected = {};
    $scope.selected.sources = ['SE'];
    $scope.nResults=100;

    $scope.showAlert = function(ev, custom) {
        // Appending dialog to document.body to cover sidenav in docs app
        // Modal dialogs should fully cover application
        // to prevent interaction outside of dialog
        $mdDialog.show(
            $mdDialog.alert()
                .parent(angular.element(document.querySelector('#popupContainer')))
                .clickOutsideToClose(false)
                .title(custom.title)
                .textContent(custom.textContent)
                .ariaLabel(custom.title)
                .ok('Got it!')
                .targetEvent(ev)
        );
    };

	$scope.generateSeedUrls = function(ev){


        if($scope.master.keywordsCount==0){
            var custom = {};
            custom.title = 'Included Keywords not provided';
            custom.textContent = 'Please enter some Included Keywords for querying the Source/s.';
            $scope.showAlert(ev, custom);
            return;
		}

        if($scope.selected.sources.length == 0){
        	var custom = {};
        	custom.title = 'Source was not provided';
        	custom.textContent = 'Please select the Source from where to get the crawling data.';
            $scope.showAlert(ev, custom);
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
            $scope.showAlert(ev, custom);
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
