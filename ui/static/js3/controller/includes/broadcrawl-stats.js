ngApp.controller('broadcrawlStatsController', ['$scope', 'broadcrawlerResultsFactory',
function ($scope, broadcrawlerResultsFactory) {



    $scope.broadcrawlStats.broadcrawlerResultsAggregated = [];


    function getAggregated() {
        broadcrawlerResultsFactory.getAggregated($scope.workspaceId).then(
            function (response) {
                $scope.broadcrawlStats.resultStruct = buildAggregatedBy(response.data);
                isRunning = false;
            },
            function (response) {
                isRunning = false;
            }
        );
    };

    $scope.broadcrawlSources = ["SE", "DD", "TOTAL"];

    var resultStructOriginal = {
        "SE":0,
        "DD":0,
        "TOTAL":0
    };

    function buildAggregatedBy(data){
        var resultStruct = resultStructOriginal;

        angular.forEach(data, function(value, index){
            var crawlEntityType = value._id.crawlEntityType =="GOOGLE" || value._id.crawlEntityType =="BING" ? "SE": value._id.crawlEntityType;
            // var relevance = value._id.relevant === undefined || value._id.relevant === null ? "neutral" : (value._id.relevant === false? "irrelevant" : "relevant");
            resultStruct[crawlEntityType]= resultStruct[crawlEntityType] + value.count;
            resultStruct["TOTAL"] = resultStruct["TOTAL"] + resultStruct[crawlEntityType];
        });

        // $scope.resultStruct = resultStruct ;
        return resultStruct;
    }

    getAggregated();

}]);
