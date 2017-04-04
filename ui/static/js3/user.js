ngApp.controller('userController', ['$scope', '$filter', '$modal', '$timeout','userFactory', 'roleFactory', 'domFactory',
	function ($scope, $filter, $modal, $timeout, userFactory, roleFactory, domFactory) {

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

	$scope.roles = [];
	$scope.getAllRoles = function(callback){

		var onSuccess = function (response) {
//				$scope.roles = $.parseJSON(data.response);
				$scope.roles = response.data;
                $scope.getAll()
			};
		var onError = function (error) {
				$scope.status = 'Unable to load customer data: ' + error.message;
        };
		roleFactory.getAll().then(onSuccess, onError);
	}


	$scope.delete = function(user){
		console.log("deleting:" + user);
		userFactory.delete(user._id)
			.success(function (data) {
				$scope.getAll();
				$scope.submittedOk = true;
				$scope.submittedError = !$scope.submittedOk;
				$scope.successMessage = "The user "+ user.email +" was deleted.";
			})
			.error(function (error) {
				$scope.submittedOk = false;
				$scope.submittedError = !$scope.submittedOk;
				$scope.errorMessage = error.message || 'Unable to delete the user';
			});
	}

	$scope.activate = function(id, name, isActive){
		userFactory.update(id, isActive, null)
			.success(function (data) {
				$scope.getAll();
				$scope.submittedOk = true;
				$scope.submittedError = !$scope.submittedOk;
				$scope.successMessage = "The user "+ name +" was " + (isActive ? "activated" : "locked") +".";
			})
			.error(function (error) {
				$scope.submittedOk = false;
				$scope.submittedError = !$scope.submittedOk;
				$scope.errorMessage = error.message || 'Unable to activate the user ' + name;
			});
	}

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


	//delete modal
	$scope.loadDeleteModal = function(user){
		var args = {};
		args.user = user;
		$scope.openModal('default', args);
	}


	$scope.openModal = function (size, args) {
		var modalInstance = $modal.open({
			animation: $scope.animationsEnabled,
			templateUrl: 'myDeleteModalContent.html',
			controller: 'ModalInstanceCtrl',
			size: size,
			resolve: {
				items: function () {
					return args;
				}
			}
		});

		modalInstance.result.then(function (args) {
			$scope.delete(args.user);
		});
	};



//	$scope.getAllRoles();
//
}])

