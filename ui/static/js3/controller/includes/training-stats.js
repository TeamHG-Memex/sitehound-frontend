ngApp.controller('trainingStatsController', ['$scope', 'seedUrlFactory',
function ($scope, seedUrlFactory) {

    // $scope.trainSources = ["SE", "MANUAL", "DD", "TOR", "TOTAL"];
    $scope.trainSources = ["SE", "MANUAL", "DD", "TOTAL"];
    $scope.trainOutputs = ["relevant", "neutral", "irrelevant", "total"];

    //immutable!
    var resultStructOriginal = {
        "SE":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "DD":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "MANUAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        // "TOR":{"relevant":0, "irrelevant":0, "neutral":0, "total":0},
        "TOTAL":{"relevant":0, "irrelevant":0, "neutral":0, "total":0}
    };

    $scope.trainingStats.resultStruct = resultStructOriginal;

    $scope.getAggregated = function() {
        seedUrlFactory.getAggregated($scope.workspaceId).then(
            function (response) {
                $scope.trainingStats.resultStruct = buildAggregatedBy(response.data);
                // $scope.resultStruct = $scope.trainingStats.resultStruct;
            },
            function (response) {
                console.log(response);
            }
        );
    };



    $scope.getAggregated();

    function buildAggregatedBy(seedUrlAggregated){
        var resultStruct = resultStructOriginal;

        angular.forEach(seedUrlAggregated, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" ? "SE": value._id.crawlEntityType;
            var relevance = value._id.relevant === undefined || value._id.relevant === null ? "neutral" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType][relevance] = resultStruct[crawlEntityType][relevance] + value.count;
            resultStruct[crawlEntityType]["total"] = resultStruct[crawlEntityType]["relevant"] + resultStruct[crawlEntityType]["irrelevant"] + resultStruct[crawlEntityType]["neutral"] ;
        });
        angular.forEach(resultStruct, function(value, index){
            if(index!="TOTAL"){
                resultStruct["TOTAL"]["relevant"] = resultStruct["TOTAL"]["relevant"] + value["relevant"];
                resultStruct["TOTAL"]["neutral"] = resultStruct["TOTAL"]["neutral"] + value["neutral"];
                resultStruct["TOTAL"]["irrelevant"] = resultStruct["TOTAL"]["irrelevant"] + value["irrelevant"];
                resultStruct["TOTAL"]["total"] = resultStruct["TOTAL"]["total"] + value["total"];
            }
        });

        return resultStruct;

        // $scope.resultStruct = resultStruct ;
    }



}]);
