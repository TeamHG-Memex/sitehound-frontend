ngApp.controller('welcomeController', ['$scope', '$filter', '$routeParams', '$location', '$interval', 'jobFactory', 'domFactory',
	function ($scope, $filter, $routeParams, $location, $interval, jobFactory, domFactory) {

debugger;
	$scope.workspaceId = $routeParams.workspaceId;

  this.name = 'John Smith';
  this.contacts = [
    {type: 'phone', value: '408 555 1212'},
    {type: 'email', value: 'john.smith@example.org'}
  ];

    $scope.greet = function(){
        alert($scope.name);
    }

	$scope.randomText = "randomText 5646465646516546";
}])
