ngApp.controller('importUrlController', ['$scope', '$filter', '$routeParams', '$timeout', 'domFactory', 'importUrlFactory',
function ($scope, $filter, $routeParams, $timeout, domFactory, importUrlFactory){

	$scope.workspaceId = $routeParams.workspaceId;
	domFactory.setWorkspaceName($scope.workspaceId);

	domFactory.highlightNavbar(".navbar-import-url");
	$scope.next = function(){
		domFactory.navigateToSeedUrlSearchEngine();
	}

	$scope.navigateToImportedUrl = function(){
		domFactory.navigateToImportedUrl();
	}

    $scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	}


	$scope.status = "";
	$scope.loading = false;
	$scope.submittedOk = false;
	$scope.submittedError = false;

	$scope.hideSubmittedOk = function(){
		$scope.submittedOk = false;
	}
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	}

	$scope.startLoading = function(){
		return $timeout(function(){$scope.loading = true;}, 1000);
	}

	$scope.endLoading = function(timeoutHandle){
		$timeout.cancel(timeoutHandle);
		$scope.loading = false;
	}

	$scope.saveUrls = function() {
		if ($scope.urlsToAdd == undefined || $scope.urlsToAdd.length == 0){
			alert('Please enter some urls');
			return;
		}
		var tOut = $scope.startLoading();
		importUrlFactory.save($scope.workspaceId, $scope.urlsToAdd)
		.success(function (data) {
			$scope.submittedOk = true;
			$scope.submittedError = false;
			$scope.urlsToAdd = "";
		})
		.error(function (error) {
			$scope.status = 'Unable to update data: ' + error.message;
			$scope.submittedOk = false;
			$scope.submittedError = true;
		})
		.finally(function(){
			$scope.endLoading(tOut);
		})

	}


/*
		var urlsToAdd = [$("#urlsToAdd").val()];

		var posting = $.ajax({
			type : "POST",
			url : '/add-known',
			contentType: 'application/json',
			dataType: 'json',
			data: JSON.stringify(urlsToAdd),
			success : function(data) {
				$("#saved").css("display", "inline");
				console.log("data sent: " + data);
				setTimeout(function() {
     				$("#saved").css("display", "none");
				}, 2000);

			}
		});
    }

	$(document).ready(function() {

		$('#saveButton').click(saveUrls);
	});
*/


}]);

var importUrlFactory = ngApp.factory('importUrlFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/import-url';
	var dataFactory = {};

	dataFactory.save= function (workspaceId, urlsToAdd) {
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.urls = urlsToAdd;//.split('|');
		return $http.post(url, po);
	};

	return dataFactory;
}]);

