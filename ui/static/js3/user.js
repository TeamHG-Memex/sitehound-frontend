
ngApp.controller('addUserController', ['$mdDialog', '$scope', 'userFactory',
function ($mdDialog, $scope, userFactory) {
	'use strict';

	$scope.cancel = $mdDialog.cancel;


	$scope.check = function() {
		$scope.registerForm.email.$setValidity("minLength",$scope.user.email.length>=8);
		$scope.registerForm.user_password.$setValidity("minLength",$scope.user.password.length>=8);
//		$scope.registerForm.confirmPassword.$setValidity("doNotMatch",$scope.user.password == $scope.confirmPassword);

		return $scope.registerForm.$valid;
	};

	$scope.addItem = function () {
		$scope.registerForm.$setSubmitted();

		if($scope.check()){
			userFactory.add($scope.user.email, $scope.user.password).then(
				function (data) {
					$mdDialog.hide();
				},
				function (err){
					console.log(err);
					if(err.message){
						alert(err.message);
					}
				}
			);
		}
	};
}]);


ngApp.controller('editUserController', ['editUser', '$mdDialog', '$scope', 'userFactory', 'roleFactory',
function (editUser, $mdDialog, $scope, userFactory, roleFactory) {

	$scope.editUser = editUser;
	$scope.cancel = $mdDialog.cancel;

/*
	$scope.roles = [];
	$scope.getAllRoles = function(){

		var onSuccess = function (response) {
//				$scope.roles = $.parseJSON(data.response);
				$scope.roles = response.data;
//				$scope.getAll()
			};
		var onError = function (error) {
				$scope.status = 'Unable to load customer data: ' + error.message;
		};
		roleFactory.getAll().then(onSuccess, onError);
	}
*/

	$scope.saveUser = function(user){

		if(user.isAdmin){
			user.roles = ["admin"];
		}
		else{
			user.roles = [];
		}
//		user.roles =
//		var roles = user.isAdmin ? ["admin"]: []
		userFactory.update(user).then(
			function (data) {
				$mdDialog.hide();
			},
			function (err){
				console.log(err);
				if(err.message){
					alert(err.message);
				}
			},
			onComplete
		)
	}

	function onComplete() {
	  $mdDialog.hide();
	}

//	$scope.getAllRoles();
}])



ngApp.controller('deleteUserController', ['deletedUser', '$mdDialog', '$scope', '$q', 'userFactory',
function (deletedUser, $mdDialog, $scope, $q, userFactory) {
	'use strict';

	$scope.deletedUser = deletedUser;
	$scope.cancel = $mdDialog.cancel;

	$scope.deleteUser = function(user) {
		userFactory.delete(user._id).then(
			function (data) {
				$mdDialog.hide();
			},
			function (err){
				console.log(err);
				if(err.message){
					alert(err.message);
				}
			}
		)
	}

	function onComplete() {
	  $mdDialog.hide();
	}

//	$scope.delete = function(user){
//		console.log("deleting:" + user);
//		userFactory.delete(user._id)
//			.success(function (data) {
//				$scope.getAll();
//				$scope.submittedOk = true;
//				$scope.submittedError = !$scope.submittedOk;
//				$scope.successMessage = "The user "+ user.email +" was deleted.";
//			})
//			.error(function (error) {
//				$scope.submittedOk = false;
//				$scope.submittedError = !$scope.submittedOk;
//				$scope.errorMessage = error.message || 'Unable to delete the user';
//			});
//	}


}]);


ngApp.controller('userController', ['$mdDialog', '$scope', '$filter', '$modal', '$timeout','userFactory', 'roleFactory', 'domFactory',
	function ($mdDialog, $scope, $filter, $modal, $timeout, userFactory, roleFactory, domFactory) {

	$scope.selected = []

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

	$scope.boolToStr = function(arg) {return arg ? 'True' : 'False'};
	$scope.intToStr = function(arg) {return arg ==1 ? 'True' : 'False'};
//
	$scope.users = [];
//	$scope.remember = false;

	$scope.selectedRoles =[];

	$scope.isUserAdmin = function(user){
		return (user.roles && user.roles.length >0 && user.roles[0].name == "admin");
	}

	$scope.compareFn = function(obj1, obj2){
		return obj1._id === obj2._id;
	};

	 $scope.showRoles = function(user) {
		var selected = [];
		angular.forEach($scope.roles, function(roleInDb) {
			angular.forEach(user.roles, function(roleInUser) {
				if (roleInUser._id == roleInDb._id) {
					selected.push(roleInDb.name);
				}
			});
		});
		return selected.length ? selected.join(', ') : 'None';
	};

	$scope.getAll = function(){
		var onSuccess = function (response) {
//				$scope.users = $.parseJSON(response.data);
				$scope.users = response.data;
				angular.forEach($scope.users, function(user) {
					user.isAdmin = $scope.isUserAdmin(user);
				})
			};
		var onError = function (error) {
				$scope.status = 'Unable to load user data';
			};
		userFactory.getAll().then(onSuccess, onError);
	}




//	$scope.activate = function(id, name, isActive){
//		userFactory.update(id, isActive, null)
//			.success(function (data) {
//				$scope.getAll();
//				$scope.submittedOk = true;
//				$scope.submittedError = !$scope.submittedOk;
//				$scope.successMessage = "The user "+ name +" was " + (isActive ? "activated" : "locked") +".";
//			})
//			.error(function (error) {
//				$scope.submittedOk = false;
//				$scope.submittedError = !$scope.submittedOk;
//				$scope.errorMessage = error.message || 'Unable to activate the user ' + name;
//			});
//	}

	$scope.getRoleAdmin = function(){
		var admin;
		angular.forEach($scope.roles, function(role) {
			if(role.name == "admin"){
				admin = role;
				return;
			}
		});
		return admin;
	}


	$scope.setRoles = function(user){
		var id = user._id;
		var name = user.email;
		var isAdmin = user.isAdmin;

		if(isAdmin){
			user.roles.push($scope.getRoleAdmin());
		}
		else{
			user.roles = [];
		}

		var roleIds = [];
		angular.forEach(user.roles, function(role) {
			roleIds.push(role._id);
		});


		userFactory.update(id, null, roleIds)
		.success(function (data) {
			$scope.submittedOk = true;
			$scope.submittedError = !$scope.submittedOk;
			$scope.successMessage = "Role Admin " + (isAdmin? "granted":"revoked") +" to user " + user.email +".";
			$scope.getAll();
		})
		.error(function (error) {
			$scope.submittedOk = false;
			$scope.submittedError = !$scope.submittedOk;
			$scope.errorMessage = error.message || 'Unable to activate the user';
		});
	}


	$scope.editAccountState = function(user){
		userFactory.editAccountState(user).then(
		function (data) {
				$scope.getAll();
				$scope.submittedOk = true;
				$scope.submittedError = !$scope.submittedOk;
				$scope.successMessage = "The user "+ name +" was " + (isActive ? "activated" : "locked") +".";
			},
		function (error) {
			$scope.submittedOk = false;
			$scope.submittedError = !$scope.submittedOk;
			$scope.errorMessage = error.message || 'Unable to activate the user ' + name;
		})

	}



	$scope.getAll = function(){


		var onSuccess = function (response) {
//				$scope.users = $.parseJSON(response.data);
				$scope.users = response.data;
				angular.forEach($scope.users, function(user) {
					user.isAdmin = $scope.isUserAdmin(user);
				})
			};
		var onError = function (error) {
				$scope.status = 'Unable to load user data';
			};
		userFactory.getAll().then(onSuccess, onError);
	}




	//delete modal
//	$scope.loadDeleteModal = function(user){
//		var args = {};
//		args.user = user;
//		$scope.openModal('default', args);
//	}



//	$scope.openModal = function (size, args) {
//		var modalInstance = $modal.open({
//			animation: $scope.animationsEnabled,
//			templateUrl: 'myDeleteModalContent.html',
//			controller: 'ModalInstanceCtrl',
//			size: size,
//			resolve: {
//				items: function () {
//					return args;
//				}
//			}
//		});
//
//		modalInstance.result.then(function (args) {
//			$scope.delete(args.user);
//		});
//	};

	$scope.openModalAdd = function (event) {
		  $mdDialog.show({
				clickOutsideToClose: true,
				controller: 'addUserController',
				focusOnOpen: true,
				targetEvent: event,
				templateUrl: '/static/partials-md/user/add-item-dialog.html',
		  }).then(
			$scope.getAll,
			function (error) {
				$scope.submittedOk = false;
				$scope.submittedError = !$scope.submittedOk;
				$scope.errorMessage = error.message || 'Unable to add the user ' + name;
			})
	};

	$scope.openModalEdit= function (user) {
	  $mdDialog.show({
//		$mdEditDialog.large({
			clickOutsideToClose: true,
			controller: 'editUserController',
			focusOnOpen: true,
			targetEvent: event,
			locals: { editUser: user},
			templateUrl: '/static/partials-md/user/edit-item-dialog.html',
		}).then(
			$scope.getAll,
			function (error) {
				$scope.submittedOk = false;
				$scope.submittedError = !$scope.submittedOk;
//				$scope.errorMessage = error.message || 'Unable to edit the user ' + name;
			})
	};


	$scope.openModalDelete = function (user) {
		$mdDialog.show({
			clickOutsideToClose: true,
			controller: 'deleteUserController',
			controllerAs: 'ctrl',
			focusOnOpen: true,
			targetEvent: event,
			locals: { deletedUser: user},
			templateUrl: '/static/partials-md/user/delete-dialog.html',
		}).then($scope.getAll);
	};




$scope.getAll();
//	$scope.getAllRoles();
//
}])

