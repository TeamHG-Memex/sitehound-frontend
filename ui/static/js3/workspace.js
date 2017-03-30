ngApp.controller('addWorkspaceController', ['$mdDialog', '$scope', 'workspaceFactory', 'workspaceSelectedService',
function ($mdDialog, $scope, workspaceFactory, workspaceSelectedService) {
    'use strict';

    $scope.cancel = $mdDialog.cancel;

    $scope.addItem = function () {
        $scope.item.form.$setSubmitted();

        if($scope.item.form.$valid) {
            workspaceFactory.add($scope.workspace.name)
            .success(function (data) {
                $mdDialog.hide();
            })
            .error(function (err){
                console.log(err);
                if(err.message){
                    alert(err.message);
                }
            });
        }
    };

}]);

ngApp.controller('deleteWorkspaceController', ['deletedWorkspace', '$mdDialog', '$scope', '$q', 'workspaceFactory', function (deletedWorkspace, $mdDialog, $scope, $q, workspaceFactory) {
    'use strict';

    $scope.deletedWorkspace = deletedWorkspace;
    $scope.cancel = $mdDialog.cancel;

    $scope.deleteWorkspace = function(id) {

        workspaceFactory.deleteWorkspace(id)
            .success(function (data) {
                $mdDialog.hide();
            })
            .error(function (err){
                console.log(err);
                if(err.message){
                    alert(err.message);
                }
            });
    }

    function onComplete() {
      $mdDialog.hide();
    }

}]);


ngApp.controller('workspaceController',
         ['$scope', '$filter', '$timeout','workspaceFactory', 'domFactory', 'workspaceStateFactory', 'myAppFactory', '$mdDialog', '$mdEditDialog', 'workspaceSelectedService'
, function ($scope, $filter, $timeout, workspaceFactory, domFactory, workspaceStateFactory, myAppFactory, $mdDialog, $mdEditDialog, workspaceSelectedService) {
    'use strict';

	$scope.workspace = null;

    $scope.workspaces = [];
     $scope.selected=[];
     $scope.filter = {}
    $scope.filter.showOnlyMines = false;

    $scope.query = {
        filter: '',
        limit: '10',
        order: 'created',
        page: 1
    };

    $scope.onReorder = function (order) {
//      getDesserts(angular.extend({}, $scope.query, {order: order}));
      getDesserts(angular.extend({}, $scope.query, {order: order}));
    };

    $scope.onPaginate = function (page, limit) {
      getDesserts(angular.extend({}, $scope.query, {page: page, limit: limit}));
    };

    $scope.mdOnSelect = function (workspace){
        workspaceSelectedService.setSelectedWorkspace(workspace);
    }

    function getDesserts(query) {
      $scope.selected = [];
      var qry = query || $scope.query;
        return [];
//      $scope.promise = $domainResource.domains.get(qry, success).$promise;
    }

    $scope.addItem = function (event) {
      $mdDialog.show({
        clickOutsideToClose: true,
        controller: 'addWorkspaceController',
        focusOnOpen: true,
        targetEvent: event,
        templateUrl: '/static/partials/workspace/add-item-dialog.html',
      }).then(getWorkspaces);
    };


    $scope.editComment = function (event, workspace) {
      // if auto selection is enabled you will want to stop the event
      // from propagating and selecting the row
      event.stopPropagation();
      /*
       * messages is commented out because there is a bug currently
       * with ngRepeat and ngMessages were the messages are always
       * displayed even if the error property on the ngModelController
       * is not set, I've included it anyway so you get the idea
       */
      var promise = $mdEditDialog.small({
        // messages: {
        //   test: 'I don\'t like tests!'
        // },
        modelValue: workspace.name,
        placeholder: 'Rename',
        save: function (input) {
          workspace.name = input.$modelValue;
        },
        targetEvent: event,
        validators: {
          'md-maxlength': 30
        }
      });

      promise.then(function (ctrl) {
        var input = ctrl.getInput();

        input.$viewChangeListeners.push(function () {
          input.$setValidity('test', input.$modelValue !== 'test');
        });
      });
    };
/*

    $scope.$watch('query.filter', function (newValue, oldValue) {
      if(!oldValue) {
        bookmark = $scope.query.page;
      }

      if(newValue !== oldValue) {
        $scope.query.page = 1;
      }

      if(!newValue) {
        $scope.query.page = bookmark;
      }

      getDesserts();
    });


*/

    $scope.delete = function (id, name) {
        var workspace = {};
        workspace.id = id;
        workspace.name = name;

        $mdDialog.show({
            clickOutsideToClose: true,
            controller: 'deleteWorkspaceController',
            controllerAs: 'ctrl',
            focusOnOpen: true,
            targetEvent: event,
            locals: { deletedWorkspace: workspace},
            templateUrl: '/static/partials/workspace/delete-dialog.html',
        }).then(getWorkspaces);
    };




	$scope.status = "";
	$scope.loading = false;

	//TODO move this 2 to domFactory
	$scope.startLoading = function(){
		return $timeout(function(){$scope.loading = true;}, 1000);
	}

	$scope.endLoading = function(timeoutHandle){
		$timeout.cancel(timeoutHandle);
		$scope.loading = false;
	}

	function getWorkspaces(callback, order) {
	    console.log("getting workspaces!")
		var tOut = $scope.startLoading();
		workspaceFactory.getWorkspaces(order)
			.success(function (data) {
				$scope.endLoading(tOut);
//				$scope.workspaces = $.parseJSON(data);
				$scope.workspaces = data;
//				workspaceStateFactory.setSelectedWorkspace($scope.workspaceId, $scope.workspaces);

                $scope.selected[0] = workspaceSelectedService.getSelectedWorkspace();
//				if(callback){
//					callback.apply();
//				}
			})
			.error(function (error) {
				$scope.endLoading(tOut);
				$scope.status = 'Unable to load customer data: ' + error.message;
			});
	}

    $scope.prettyPrintWords = function(words) {
        var keywords = [];
        angular.forEach(words, function(v,k){
            keywords.push(" " + v.word + "("  + v.score + ")");
        })
        return keywords.join();
    }

	getWorkspaces();



}])
.directive('workspace-row', function () {
	return {
	restrict : 'C',
		link: function(scope, element) {
			console.log(element);
			element.bind("click" , function(e){
				 element.parent().find("tr").removeClass("workspace-row-selected");
				 element.addClass("workspace-row-selected").removeClass("workspace-row-even");
			});
		}
	}
});


var workspaceFactory = ngApp.factory('workspaceFactory',['$http', function($http){

	var urlBase = '/api/workspace';
	var dataFactory = {}

	dataFactory.getWorkspaces = function () {
		return $http.get(urlBase);
	};

	dataFactory.getWorkspace = function (id) {
		return $http.get(urlBase + '/' + id);
	};

	dataFactory.add = function (workspace) {
		return $http.post(urlBase, workspace);
	};

	dataFactory.deleteWorkspace = function (id) {
		return $http.delete(urlBase + '/' + id);
	};

	return dataFactory;
}]);


var workspaceStateFactory = ngApp.factory('workspaceStateFactory',['$routeParams', '$ngSilentLocation', '$cookies', function($routeParams, $ngSilentLocation, $cookies){

	var dataFactory = {}

//	dataFactory.set = function(workspaceId, workspaces){
//		dataFactory.setSelectedWorkspace(workspaceId, workspaces);
//		$ngSilentLocation.silent('workspace/' + workspaceId);
//		$routeParams.workspaceId = workspaceId;
//	}


	dataFactory.setSelectedWorkspace = function(id, workspaces){
		angular.forEach(workspaces, function(elem, index){
			if(elem._id == id){
				elem.selected = true;
				$("#workspace-name").text(elem.name);
			}
			else{
				elem.selected = false;
			}
		});
	}

	dataFactory.get = function(){
		var workspaceId = $routeParams.workspaceId;
		if(workspaceId){
			$cookies.put("workspaceId", workspaceId);
		}
		else{
			workspaceId = $cookies.get("workspaceId");
			if(workspaceId){
				dataFactory.set(workspaceId);
			}
			else{
				workspaceId = null;
			}
		}
		return workspaceId;
	}

	dataFactory.clear = function(){
		$ngSilentLocation.silent('/');
		$("#workspace-name").text('');
		$routeParams.workspaceId = null;
		$cookies.remove("workspaceId");
	}

	return dataFactory;

}]);


var myAppFactory = ngApp.factory('myAppFactory', ['$http', function ($http) {

	var dataFactory = {}

    dataFactory.getData = function () {
        return $http({
            method: 'GET',
            url: 'http://angular-data-grid.github.io/demo/data.json'
        });
    }
    return dataFactory;

}]);



var workspaceSelectedService =  ngApp.factory('workspaceSelectedService', [ '$cookies', function($cookies){

    var dataFactory = {}
    var selectedWorkspace = null;

    dataFactory.setSelectedWorkspace = function(workspace){
        selectedWorkspace = workspace;
        $cookies.put("workspaceId", workspace._id);
    }

    dataFactory.getSelectedWorkspace = function(){
        return selectedWorkspace;
    }

    dataFactory.getSelectedWorkspaceId = function(){
        var workspaceId;
        if(selectedWorkspace==null){
            workspaceId = $cookies.get("workspaceId");
        }
        else{
            workspaceId = selectedWorkspace._id
        }
        return workspaceId;
    }


    return dataFactory;
}]);