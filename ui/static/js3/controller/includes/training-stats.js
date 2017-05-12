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

    function adviceParser(advices, tooltips){
        var adviceArray=[];

        var tooltipsKeys=[];
        angular.forEach(tooltips, function(value,key){
            tooltipsKeys.push(key);
        });

        angular.forEach(advices, function(value,key){
            var advice = {"kind": value.kind};
            advice.messages = tooltipParser(value.text, tooltipsKeys, tooltips);
            adviceArray.push(advice);
        });
        return adviceArray;
    }

    function tooltipParser(text, tooltipsKeys, tooltips){

        var arr = [];

        if(text=="" || !text){
            return arr;
        }

        var positionArr = findPositionArray(text, tooltipsKeys);

        positionArr.sort(function(a, b){
            return a.pos - b.pos;
        });

        var right_text = text;
        var lastIndex = 0;

        angular.forEach(positionArr, function(value, key){
            var left_text = text.substr(lastIndex, value.pos);// + value.key.length - lastIndex);
            var center_text = text.substr(value.pos, value.key.length);
            var tooltipText = tooltips[value.key];
            arr.push({"text":left_text, "tooltip": null });
            arr.push({"text":center_text, "tooltip": tooltipText });
            lastIndex=value.pos + value.key.length;
        });

        if(lastIndex < text.length-1){
            right_text = text.substr(lastIndex);
            arr.push({"text":right_text, "tooltip": null});
        }

        return arr;
    }

    function findPositionArray(text, tooltips){
        var positionArr = [];
        for (i = 0; i < tooltips.length; i++) {
            var key = tooltips[i];
            // var textTemp = text;
            var lastPosition = -1;
            while ((lastPosition = text.indexOf(key, lastPosition + 1)) > -1){
                console.log(lastPosition);
                positionArr.push({"pos": lastPosition, "key": key});
            }
        }
        return positionArr;
    }


}]);
