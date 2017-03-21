ngApp.controller('registerController', ['$scope', '$filter', '$timeout','userFactory', 'domFactory',
	function ($scope, $filter, $timeout, userFactory, domFactory) {


	$scope.status = "";
	$scope.loading = false;
	$scope.submittedOk = false;
	$scope.submittedError = false;

	$scope.email = ""
	$scope.password = ""
	$scope.confirmPassword = ""

	$scope.hideSubmittedOk = function(){
		$scope.submittedOk = false;
	}
	$scope.hideSubmittedError = function(){
		$scope.submittedError = false;
	}

	$scope.check = function() {
		$scope.registerForm.email.$setValidity("minLength",$scope.email.length>=8);
		$scope.registerForm.password.$setValidity("minLength",$scope.password.length>=8);
		$scope.registerForm.confirmPassword.$setValidity("doNotMatch",$scope.password == $scope.confirmPassword);
		return $scope.registerForm.$valid;
	};

	$scope.save = function(){
		if($scope.check()){
			userFactory.save($scope.email, $scope.password)
				.success(function (data) {
					$scope.submittedOk = true;
					$scope.submittedError = false;
					$scope.email = "";
					$scope.password = "";
					$scope.confirmPassword = "";
				})
				.error(function (error) {
					$scope.submittedOk = false;
					$scope.submittedError = true;
					$scope.errorMessage = error.message;
				});
		}
	};

	$scope.autoGeneratePassword = function(){
		var length = 12;
		var pwd = generatePassword (length);
		$scope.password = pwd;
		$scope.confirmPassword = pwd;
	}

	function generatePassword (length){
		var chars = "abcdefghijklmnopqrstuvwxyz!@#$%^&*()-+<>ABCDEFGHIJKLMNOP1234567890";
		var pass = "";
		for (var x = 0; x < length; x++) {
			var i = Math.floor(Math.random() * chars.length);
			pass += chars.charAt(i);
		}
		return pass;
	}


}])


