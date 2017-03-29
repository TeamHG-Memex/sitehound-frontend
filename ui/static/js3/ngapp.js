//Angular

var ngApp = angular.module('ngApp', ['ngResource', 'ngRoute','ngAnimate', 'ui.bootstrap',
	'toggle-switch', 'infinite-scroll','nzToggle', 'ngSilent', 'ngCookies', 'xeditable', 'checklist-model'
	,'lightGrid','lightGridDataProviders','lightGridControls'
//	, 'ngSanitize'
    , 'ngMaterial'
	, 'ngCsv'])


ngApp.run(function(editableOptions, editableThemes) {
	editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'default'. This is for xeditable
	editableThemes.bs3.inputClass = 'input-sm';
	editableThemes.bs3.buttonsClass = 'btn-sm small-custom-button';
});


ngApp.filter('objectFilterByVal', function () {
return function (input, filterByVal) {
	var filteredInput ={};
	 angular.forEach(input, function(inputValue, inputKey){
		if(inputValue == filterByVal){
		  filteredInput[inputKey]= inputValue;
		}
	 });
	 return filteredInput;
}});

ngApp.filter('objectFilterByScoreVal', function () {
return function (input, filterByVal) {
	var filteredInput ={};
	 angular.forEach(input, function(inputValue, inputKey){
		if(inputValue.score == filterByVal){
			filteredInput[inputKey]= inputValue;
		}
	 });
	 return filteredInput;
}});

ngApp.filter('fullLanguageName', function() {
	return function(input) {
		return languagesMap[input] ? languagesMap[input] : 'undefined';
	}
});

ngApp.filter('capitalize', function() {
	return function(input) {
		return (!!input) ? input.charAt(0).toUpperCase() + input.substr(1).toLowerCase() : '';
	}
});

ngApp.filter('ellipsis', function () {
    return function (value, wordwise, max, tail) {
        if (!value) return '';

        max = parseInt(max, 10);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (tail || ' …');
    };
});

ngApp.filter('encodeURIComponent', function() {
    return window.encodeURIComponent;
});
ngApp.filter('decodeURIComponent', function() {
  return window.decodeURIComponent;
});
/*
ngApp.factory('myHttpInterceptor', function ($q, $window) {
  return function (promise) {
    return promise.then(function (response) {
      $("#spinner").hide();
      return response;
    }, function (response) {
      $("#spinner").hide();
      return $q.reject(response);
    });
  };
});
*/

//ngApp.config(function ($routeProvider, $httpProvider) {
ngApp.config(function ($routeProvider) {

//	$httpProvider.responseInterceptors.push('myHttpInterceptor');
//
//	var spinnerFunction = function spinnerFunction(data, headersGetter) {
//		$("#spinner").show();
//		return data;
//	};
//
//	$httpProvider.defaults.transformRequest.push(spinnerFunction);

	$routeProvider
		.when('/',
			{
				controller: 'workspaceController',
				templateUrl: '/static/partials/workspace.html'
			})
		.when('/user',
			{
				controller: 'userController',
				templateUrl: '/static/partials/user.html'
			})
		.when('/register',
			{
				controller: 'registerController',
				templateUrl: '/static/partials/auth-register.html'
			})
		.when('/workspace/:workspaceId',
			{
				controller: 'workspaceController',
				templateUrl: '/static/partials/workspace.html'
			})
		.when('/workspace/:workspaceId/seed',
			{
				controller: 'seedController',
				templateUrl: '/static/partials/seed.html'
			})
		.when('/workspace/:workspaceId/user-defined-categories',
			{
				controller: 'userDefinedCategoriesController',
				templateUrl: '/static/partials/user-defined-categories.html'
			})
		.when('/workspace/:workspaceId/label-user-defined-categories',
			{
				controller: 'labelUserDefinedCategoriesController',
				templateUrl: '/static/partials/label-user-defined-categories.html'
			})
		.when('/workspace/:workspaceId/import-url',
			{
				controller: 'importUrlController',
				templateUrl: '/static/partials/import-url.html'
			})
		.when('/workspace/:workspaceId/seed-url',
			{
//				controller: 'seedUrlController',
//				templateUrl: '/static/partials/seed-url.html'
				redirectTo: '/seed-url/searchengine'
			})
		.when('/workspace/:workspaceId/seed-url/:source',
			{
				controller: 'seedUrlSourceController',
				templateUrl: '/static/partials/seed-url-source.html'
			})
		.when('/workspace/:workspaceId/dd-training',
			{
				controller: 'ddTrainingController',
				templateUrl: '/static/partials/dd-training.html'
			})
		.when('/workspace/:workspaceId/broad-crawl',
			{
				controller: 'broadcrawlerController',
				templateUrl: '/static/partials/broad-crawler.html'
			})
		.when('/workspace/:workspaceId/broad-crawl-results',
			{
				controller: 'broadcrawlerResultsController',
				templateUrl: '/static/partials/broad-crawler-results.html'
			})
		.when('/workspace/:workspaceId/broad-crawl-results/:jobId',
			{
				controller: 'broadcrawlerResultsController',
				templateUrl: '/static/partials/broad-crawler-results.html'
			})
		.when('/workspace/:workspaceId/broad-crawl-results-summary',
			{
				controller: 'broadcrawlerResultsSummaryController',
				templateUrl: '/static/partials/broad-crawler-results-summary.html'
			})
		.when('/workspace/:workspaceId/job',
			{
				controller: 'jobController',
				templateUrl: '/static/partials/job.html'
			})
		.when('/workspace/:workspaceId/job/:jobId',
			{
				controller: 'jobController',
				templateUrl: '/static/partials/job.html'
			})
		.when('/workspace/:workspaceId/dashboard',
			{
				controller: 'dashboardController',
				templateUrl: '/static/partials/dashboard.html'
			})
		.otherwise({
			redirectTo: '/'
			})
});



ngApp.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.sendArgs = function () {
    $modalInstance.close(items);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});



ngApp.directive('scroll', function () {
    return {
    restrict : 'C',
        link: function(scope, element) {
            element.bind("click" , function(e){
                 element.parent().find("li").removeClass("navbar-item-selected");
                 element.addClass("navbar-item-selected").removeClass("navbar-item-unselected");
            });
        }
    }
});
ngApp.factory('focusFactory', function($timeout, $window) {
    return function(id) {
      // timeout makes sure that it is invoked after any other event has been triggered.
      // e.g. click events that need to run before the focus or
      // inputs elements that are in a disabled state but are enabled when those events
      // are triggered.
      $timeout(function() {
        var element = $window.document.getElementById(id);
        if(element)
          element.focus();
      });
    };
  });

/*
ngApp.config(function ($httpProvider) {
  $httpProvider.responseInterceptors.push('myHttpInterceptor');

  var spinnerFunction = function spinnerFunction(data, headersGetter) {
    $("#spinner").show();
    return data;
  };

  $httpProvider.defaults.transformRequest.push(spinnerFunction);
});
*/
