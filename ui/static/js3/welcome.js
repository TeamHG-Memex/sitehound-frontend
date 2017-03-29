ngApp.controller('welcomeController', ['$scope', '$filter', '$routeParams', '$location', '$interval', 'jobFactory', 'domFactory',
	function ($scope, $filter, $routeParams, $location, $interval, jobFactory, domFactory) {

	$scope.workspaceId = $routeParams.workspaceId;
}])
