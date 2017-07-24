 ngApp.controller('loginInputController', ['$scope', '$filter', '$routeParams', '$timeout', 'domFactory', 'loginInputFactory',
function ($scope, $filter, $routeParams, $timeout, domFactory , loginInputFactory){

	$scope.workspaceId = $routeParams.workspaceId;

	domFactory.setWorkspaceName($scope.workspaceId);

    $scope.navigateToDashboard = function(){
		domFactory.navigateToDashboard();
	};

    $scope.submittedOk = false;
    $scope.submittedError = false;

    $scope.hideSubmittedOk = function(){
        $scope.submittedOk = false;
    };
    $scope.hideSubmittedError = function(){
        $scope.submittedError = false;
    };
    $scope.startLoading = function(){
        return $timeout(function(){$scope.loading = true;}, 1000);
    };
    $scope.endLoading = function(timeoutHandle){
        $timeout.cancel(timeoutHandle);
        $scope.loading = false;
    };



    $scope.lastId=null;
    $scope.loginInputs = [];

    $scope.crawlStatusBusy=false;
    function resetTimeout(){
        $scope.crawlStatusBusy=false;
	}
    $scope.fetch = function(){
		getUserFormInputs()
    };

	function getUserFormInputs(){
		$scope.crawlStatusBusy=true;
		$scope.loading = true;
		$scope.errorMessage = "";
        loginInputFactory.get($scope.workspaceId, $scope.lastId)
		.success(function (data) {
			console.log("finish fetching loginInputs");
//			$scope.seedUrls = $.parseJSON(data);
			var tempResults = data;
			Array.prototype.push.apply($scope.loginInputs, tempResults);
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
				($scope.loginInputs.length > 0 ? $scope.loginInputs[$scope.loginInputs.length-1]._id : null) ;
			// loadWordScore();
            if($scope.loginInputs.length<5){
                $timeout(getUserFormInputs, 5000);
                // getUserFormInputs();
            }
            $timeout(resetTimeout, 1000);
			// $scope.crawlStatusBusy=false;
			$scope.loading = false;
		})
		.error(function (error) {
			// $scope.errorMessage = error.message;
			$scope.crawlStatusBusy=false;
			$scope.loading = false;
			console.log(error);
		})
//		.finally(function(){
//		});
	}

    $scope.completedFilter = function(loginInput){
        return !loginInput.completed; //|| seedUrl.deleted == true;
    };

	$scope.saveUserInputForm = function(elem) {

		var valid = true;
		angular.forEach(elem.keyValues, function (v, k ) {
			if(v.trim()==""){
				valid = false;
				return;
			}
        });
		if(!valid){
			alert("All fields are required");
			return;
		}

		var tOut = $scope.startLoading();
        loginInputFactory.save(elem.workspaceId, elem.jobId, elem.url, elem._id, elem.keyValues)
		.success(function (data) {
            remove(elem);
			$scope.submittedOk = true;
			$scope.submittedError = false;
			if($scope.loginInputs.length<5){
				$timeout(getUserFormInputs, 2000);
                // getUserFormInputs();
			}
            $scope.$emit('list:filtered')
		})
		.error(function (error) {
			$scope.status = 'Unable to update data: ' + error.message;
			$scope.submittedOk = false;
			$scope.submittedError = true;
		})
		.finally(function(){
			$scope.endLoading(tOut);
		})

	};

	function remove(elem){

        $scope.loginInputs = $scope.loginInputs.filter(function(item) {
            return item._id !== elem._id;
        });

	}

}]);

var loginInputFactory = ngApp.factory('loginInputFactory',['$http', function($http){

	var urlBase = '/api/workspace/{0}/login-input';
	var dataFactory = {};

	dataFactory.get = function (workspaceId, lastId) {
		var url =  String.format(urlBase, workspaceId);

		var qsLastId = "";
		if (lastId){
			qsLastId = "?last-id=" + lastId;
		}
		return $http.get(url + qsLastId);
	};

	/**loginInputId = _id of the doc*/
	dataFactory.save= function (workspaceId, jobId, loginUrl, loginInputId, keyValues) {
		var url =  String.format(urlBase, workspaceId);
		var po = {};
		po.workspaceId = workspaceId;
		po.jobId = jobId;
		po.loginUrl = loginUrl;
		po.loginInputId = loginInputId;
		po.keyValues = keyValues;
		return $http.put(url, po);
	};

	dataFactory.getStats = function(workspaceId){
        var url =  String.format(urlBase, workspaceId) + "/stats";
        return $http.get(url);
	};

	return dataFactory;
}]);

