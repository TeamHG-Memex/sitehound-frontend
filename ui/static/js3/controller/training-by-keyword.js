ngApp.controller('trainingByKeywordController', ['$scope', '$filter', 'workspaceSelectedService', 'seedFactory', '$mdConstant',
function ($scope, $filter, workspaceSelectedService, seedFactory, $mdConstant, $mdDialog) {

    $scope.relevantKeywords=[];
    $scope.irrelevantKeywords=[];

    $scope.splitKeys = [$mdConstant.KEY_CODE.ENTER, $mdConstant.KEY_CODE.COMMA];
    $scope.maxChips = 15;

    $scope.workspaceId = workspaceSelectedService.getSelectedWorkspaceId();

// check that any workspace was selected
    workspaceSelectedService.getSelectedWorkspaceAsync().then(
    function(response){
        $scope.workspaceName = response.data.name;
        $scope.getSeeds();
    },
    function(response){
        console.log(response)
        $scope.workspaceName = null;
    });

	/// START KEYWORD SEEDS


    $scope.getSeeds = function(){
        seedFactory.get($scope.workspaceId).then(
        function (response) {
            var words = response.data || [];
            angular.forEach(words, function(v,k){
                if(v.score>3){
                    $scope.relevantKeywords.push(v.word);
                }
                else{
                    $scope.irrelevantKeywords.push(v.word);
                }
            })
        },
        function(){}
        )
    }

    function save(word, score){
        var onSuccess = function (response) {};
        var onError = function (response) {};
        seedFactory.save($scope.workspaceId, word, score).then(onSuccess, onError);
    }

    $scope.add = function(type, chip){
        var score = 0;
        if(type=="relevant"){
            score = 5;
        } else if (type=="irrelevant"){
            score = 1;
        }
        save(chip, score);
    }

    $scope.remove = function(chip){
        seedFactory.delete($scope.workspaceId, chip).then(function(){}, function(){})
    }

	/// END KEYWORD SEEDS


}]);
