ngApp.controller('trainingByUrlController', ['$scope', '$filter', 'workspaceSelectedService', 'seedUrlFactory',
function ($scope, $filter, workspaceSelectedService, seedUrlFactory, $mdDialog) {

    $scope.relevantKeywords=[];
    $scope.irrelevantKeywords=[];

    var originatorEv;
    $scope.openMenu = function($mdMenu, ev) {
      originatorEv = ev;
      $mdMenu.open(ev);
    };



}]);
