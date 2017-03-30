////http://danielnagy.me/md-data-table/scripts/nutritionResource.js
////ngApp.factory('$domainResource', ['$resource', function ($resource) {
////    'use strict';
////    return {
////      domains: $resource('/api/workspace/:id', null,  {
////          'update': { method:'PUT' }
////      })
////    };
////}]);
//
////var workspaceResource = $resource('/api/workspace/:workspaceId', {workspaceId:'@id'});
//
////ngApp.controller('addDomainController', ['$mdDialog', '$domainResource', '$scope', function ($mdDialog, $domainResource, $scope) {
//ngApp.controller('addDomainController', ['$mdDialog', '$scope', function ($mdDialog, $scope) {
//    'use strict';
//
//    this.cancel = $mdDialog.cancel;
//
//    function success(dessert) {
//      $mdDialog.hide(dessert);
//    }
//
//    this.addItem = function () {
//      $scope.item.form.$setSubmitted();
//
//      if($scope.item.form.$valid) {
//        workspaceResource.$save({dessert: $scope.dessert}, success);
//      }
//    };
//
//}]);
//
//
//ngApp.controller('deleteDomainController', ['desserts', '$mdDialog','$scope', '$q', function (desserts, $mdDialog, $scope, $q) {
//    'use strict';
//
//
//    $scope.self = this;
//    $scope.self.scope = $scope;
//    $scope.self.desserts = desserts;
//
//    this.cancel = $mdDialog.cancel;
//
//    this.bulkDelete= function(){
//        $q.all(desserts.forEach(deleteDessert)).then(onComplete);
//    };
//
//    function deleteDessert(dessert, index) {
////      var deferred = $domainResource.domains.remove({id: dessert._id});
//      var deferred = workspaceResource.$delete({id: dessert._id});
//
//      return deferred.$promise;
//    }
//
//    function onComplete() {
//      $mdDialog.hide();
//    }
//
//    function error() {
//      $scope.error = 'Invalid secret.';
//    }
//
//    function success() {
//      $q.all(desserts.forEach(deleteDessert)).then(onComplete);
//    }
//
//}]);
//
//ngApp.controller('domainController', ['$mdDialog', '$mdEditDialog', 'domainFactory', '$scope',
//function ($mdDialog, $mdEditDialog, domainFactory, $scope) {
//    'use strict';
//
//    var bookmark;
//
//    $scope.selected = [];
//    $scope.filter = {}
//    $scope.filter.showOnlyMines = false;
////    $scope.status = ['PENDING', 'FAILED', 'SCANNING', 'SCANNED', 'BLACKLISTED']
//    $scope.status = ['PENDING', 'FAILED', 'SCANNING', 'SCANNED']
//
//
//	$scope.onStatusChange = function(id, status){
//		console.log("updating status: "+ id + " to " + status )
//		domainFactory.updateStatus(id, status);
//	}
//
//	$scope.blacklist = function(id){
//	    // TODO add a confirmation window
//		console.log("Blacklisting: "+ id)
//		domainFactory.blacklist(id);
//		getDesserts($scope.query);
//	}
//
//    $scope.toggleShowOnlyMines = function(){
//        $scope.query.page = 1;
//        getDesserts($scope.query);
//    }
//
//    $scope.filter = {
//      options: {
//        debounce: 500
//      }
//    };
//
//    $scope.isAdmin = function(){
//        var isAdmin= !!window.isAdmin || false;
//        return isAdmin;
//    }
//
//    $scope.query = {
//        filter: '',
//        limit: '10',
//        order: 'domain',
//        page: 1
//    };
//
//    function getDesserts(query) {
//      $scope.selected = [];
//
//      var qry = query || $scope.query;
//      if($scope.filter.showOnlyMines){
//          qry.showOnlyMines = $scope.filter.showOnlyMines;
//      }
//      else{
//          qry.showOnlyMines = null;
//      }
//
//      $scope.promise = workspaceResource.get(qry, success).$promise;
//
////        domainFactory.getList(qry)
////		.success(function (response) {
////            console.log(response);
////            debugger;
//////            $scope.domains = response.data;
////            $scope.domains = response;
////        })
////		.error(function (error) {
////		    console.log(error);
////		});
//    }
//
//    function success(result) {
//        $scope.domains = result;
//    }
///*
//    $scope.editComment = function (event, dessert) {
//
//      event.stopPropagation();
//
//      var promise = $mdEditDialog.large({
//        messages: {
//          test: 'I don\'t like tests!'
//        },
//        modelValue: dessert.comment,
//        placeholder: 'Add a comment',
//        targetEvent: event,
//        title: 'Add a comment',
//        //validators: {
//        //  'md-maxlength': 30
//        //},
//        save: function (input) {
//          dessert.comment = input.$modelValue;
//          $scope.update(dessert);
//        }
//      });
//
//      promise.then(function (ctrl) {
//
//        var input = ctrl.getInput();
//
//        input.$viewChangeListeners.push(function () {
//          input.$setValidity('test', input.$modelValue !== 'test');
//        });
//      });
//    };
//*/
//      $scope.update = function(dessert){
//          var id = dessert._id;
//          // Now call update passing in the ID first then the object you are updating
//          workspaceResource.update({ "id":id }, dessert);
//  //        $nutrition.desserts.save({dessert: $scope.dessert}, success);
//      };
//
//
//    $scope.editType = function (dessert) {
//        console.log(dessert.type);
//    };
//
//
//    $scope.getActiveStatus = function(){
//      return ["Active","Locked"];
//    }
//
//      $scope.toggle = function (item, list) {
//          console.log('toggle');
//          var idx = list.indexOf(item);
//          if (idx > -1) list.splice(idx, 1);
//          else list.push(item);
//      };
//
//    $scope.addItem = function (event) {
//      $mdDialog.show({
//        clickOutsideToClose: true,
//        controller: 'addDomainController',
//        controllerAs: 'ctrl',
//        focusOnOpen: false,
//        targetEvent: event,
//        templateUrl: '/static/partials/domain/add-item-dialog.html',
//      }).then(getDesserts);
//    };
//
//    $scope.delete = function (event) {
//      $mdDialog.show({
//        clickOutsideToClose: true,
//        controller: 'deleteDomainController',
//        controllerAs: 'ctrl',
//        focusOnOpen: true,
//        targetEvent: event,
//        locals: { desserts: $scope.selected },
//        templateUrl: '/static/partials/domain/delete-dialog.html',
//      }).then(getDesserts);
//    };
//
//    $scope.onPaginate = function (page, limit) {
//      getDesserts(angular.extend({}, $scope.query, {page: page, limit: limit}));
//    };
//
//    $scope.onReorder = function (order) {
//      getDesserts(angular.extend({}, $scope.query, {order: order}));
//    };
//
//    $scope.removeFilter = function () {
//      $scope.filter.show = false;
//      $scope.query.filter = '';
//
//      if($scope.filter.form.$dirty) {
//        $scope.filter.form.$setPristine();
//      }
//    };
//
//    $scope.$watch('query.filter', function (newValue, oldValue) {
//      if(!oldValue) {
//        bookmark = $scope.query.page;
//      }
//
//      if(newValue !== oldValue) {
//        $scope.query.page = 1;
//      }
//
//      if(!newValue) {
//        $scope.query.page = bookmark;
//      }
//
//      getDesserts();
//    });
//
//
//}]);
//
//
////var domainFactory = ngApp.factory('domainFactory',['$http', ' $httpParamSerializerProvider', function($http, $httpParamSerializerProvider){
//var domainFactory = ngApp.factory('domainFactory',['$http', function($http){
//
//
//	var dataFactory = {}
////
////    var paramSerializer = $httpParamSerializerProvider.$get();
//
////	dataFactory.getList = function (qry) {
//////		var url = "/ondemand/domain/" +  paramSerializer(qry) ;
////		var url = "/ondemand/domain?" +  "page=1&limit=10" ;
////		debugger
////		return $http.get(url);
////	};
//
//
//	dataFactory.updateStatus = function (id, status) {
//		var url = "/ondemand/domain/" + id +"/status/" + status;
//		return $http.post(url);
//	};
//
//	dataFactory.blacklist = function (id) {
//		var url = "/ondemand/domain/" + id +"/blacklist";
//		return $http.post(url);
//	};
//
//	return dataFactory;
//}]);
