ngApp.controller('labelUserDefinedCategoriesController', ['$scope', '$rootScope', '$filter', '$modal', '$routeParams', '$interval', '$timeout',
'domFactory', 'seedFactory', 'seedUrlFactory', 'userDefinedCategoriesFactory', 'labelUserDefinedCategoriesFactory', 'progressFactory', '$q',

function ($scope, $rootScope, $filter, $modal, $routeParams, $interval, $timeout, domFactory, seedFactory, seedUrlFactory, userDefinedCategoriesFactory, labelUserDefinedCategoriesFactory, progressFactory, $q){


    $scope.workspaceId = $routeParams.workspaceId;
    $scope.source = $routeParams.source;
    domFactory.setWorkspaceName($scope.workspaceId);

    $scope.navigateToDashboard = function(){
        domFactory.navigateToDashboard();
    }
    $scope.navigateToUserDefinedCategories = function(){
		domFactory.navigateToUserDefinedCategories();
	}

    $scope.navigateToUserDefinedCategoriesDownload = function(){
        var qs ="";
        if($scope.userDefinedCategoriesSelected()!=null){
            qs ="?categories=" +$scope.userDefinedCategoriesSelected()
        }
		domFactory.navigateToUserDefinedCategoriesDownload(qs);
	}




    //pagination
    $scope.seedUrls = [];
    $scope.lastId = $scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null;
    $scope.crawlStatusBusy = false;

    $scope.submittedOk = false;
    $scope.submittedError = false;

    $scope.hideSubmittedOk = function(){
        $scope.submittedOk = false;
    };
    $scope.hideSubmittedError = function(){
        $scope.submittedError = false;
    };

    $scope.errorMessageDefault = 'Please check your connection and contact and administrator.'

    function getSeeds(){
        seedFactory.get($scope.workspaceId)
        .success(function (data) {
            var words = data;
            $scope.words = words || [];
        })
        .error(function (error) {
            $scope.status = 'Unable to load data: ' + error.message;
        })
        .finally(function(){
//			$scope.loading = false;
        });
    };

    $scope.userDefinedCategories = [];
    function getUserDefinedCategories(){
        userDefinedCategoriesFactory.get($scope.workspaceId)
        .success(function (data) {
            $scope.userDefinedCategories = data || [];
            setFilters(data);
        })
        .error(function (error) {
            $scope.status = 'Unable to load data: ' + error.message;
        })
        .finally(function(){
            $scope.loading = false;
        });
    };

    $scope.userDefinedCategoriesFilters = {};
    function setFilters(categories){
        var temp = {};
        temp["NOT_EVALUATED"] = true
        angular.forEach(categories, function(category){
            temp[category] = true;
        });
        $scope.userDefinedCategoriesFilters = temp;
    };

    $scope.userDefinedCategoriesSelected= function(){
        if($scope.usingCategoryFilters){
            var temp = [];
            angular.forEach($scope.userDefinedCategoriesFilters, function(v, k){
                if(v){
                    temp.push(k);
                }
            });
            return temp;
        }
        else{
            return null;
        }

    };


    function getSeedUrls(){
        $scope.loading = true;
        $scope.errorMessage = "";
        $scope.crawlStatusBusy=true;
        labelUserDefinedCategoriesFactory.get($scope.workspaceId, $scope.userDefinedCategoriesSelected(), $scope.lastId)
        .success(function (data) {
            console.log("finish fetching seed Urls (ludc)");
            var tempResults = data;

            angular.forEach(tempResults, function(tempResult){
                tempResult.userDefinedCategorySelected ={};
                if(tempResult.userDefinedCategories){
                    angular.forEach(tempResult.userDefinedCategories, function(category) {
                        tempResult.userDefinedCategorySelected[category] = true;
                    });
                }
            });

            Array.prototype.push.apply($scope.seedUrls, tempResults);
            $scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1]._id :
                ($scope.seedUrls.length > 0 ? $scope.seedUrls[$scope.seedUrls.length-1]._id : null) ;
            loadWordScore();
            $scope.crawlStatusBusy=false;
            $scope.loading = false;
        })
        .error(function (error) {
            console.log(error)
            if(error.message){$scope.errorMessage = error.message;}
            $scope.crawlStatusBusy=false;
            $scope.loading = false;
        })
    }


    function loadWordScore(){
        console.log("loading word score");
        var i=0;
        angular.forEach($scope.seedUrls, function(seedUrl) {
            var wordWithScores = [];
            angular.forEach(seedUrl.words, function(word) {
                var score = $scope.evaluateWord(word)
                var hash = $scope.makeHash(word);
                var wordWithScore = {'name':word, 'score': score, 'hash': hash};
                wordWithScores.push(wordWithScore);
            });
            $scope.seedUrls[i].wordWithScores = wordWithScores;
            i++;
        });
    }


    $scope.makeHash = function (text){
        return text;
    }

    $scope.evaluateWord = function(word){
        var score = 0;
        angular.forEach($scope.words, function(reviewedWord) {
            if(word==reviewedWord.word){
                score = reviewedWord.score;
            }
        });
        return score;
    }

    $scope.wordsQuantityToShow = 10;

    $scope.getSeedUrls = function(){
        getSeedUrls();
    }

    $scope.usingCategoryFilters=false;
    $scope.reloadResults = function(){
        $scope.usingCategoryFilters=true;
        // restart the loading
        $scope.seedUrls = [];
        $scope.lastId = null;
        getSeedUrls();
    }

    $scope.fetch = function(){
        if($scope.crawlStatusBusy){
            console.log('busy');
            return;
        }
        console.log('fetch triggered');
        getSeedUrls()
    }

    $scope.deletedFilter = function(seedUrl){
        return !seedUrl.deleted; //|| seedUrl.deleted == true;
    }

	$scope.categoryFilter = function(seedUrl) {

        if($scope.usingCategoryFilters){
            // at least one filter has to match

            var found = false;
            angular.forEach($scope.userDefinedCategoriesSelected(), function(category){

                if(category=="NOT_EVALUATED"){
                    if(Object.size(seedUrl.userDefinedCategorySelected)==0){
                        found = true;
                        return;
                    }
                }
                else if(seedUrl.userDefinedCategorySelected[category] == true){
                    found = true;
                    return;
                }
            });
            return found;
        }
        else{
            return true;
        }
	}


    $scope.onWordScoreUpdated = function(word){
        seedFactory.save($scope.workspaceId, word.name, word.score)
        .success(function (data) {
            seedFactory.get($scope.workspaceId)
                .success(function (data) {
                    var words = data;
                    $scope.words = words || [];
                    loadWordScore();
                })
                .error(function (error) {
                    $scope.status = 'Unable to load data: ' + error.message;
                })
                .finally(function(){
//					$scope.loading = false;
                });
        })
        .error(function (error) {
            $scope.status = 'Unable to load data: ' + error.message;
        })
        .finally(function(){
//			$scope.loading = false;
        });
    }


    $scope.onSeedUrlLabelChanged = function(id, category, isChecked){
        console.log(isChecked);
        labelUserDefinedCategoriesFactory.update($scope.workspaceId, id, category, isChecked)
        .success(function (data) {
            console.log('updated');
        })
        .error(function (error) {
            $scope.status = 'Unable to load data: ' + error.message;
        })
        .finally(function(){
            $scope.loading = false;
        });
    }


  $scope.max = 5;
  $scope.min = 0;
  $scope.isReadonly = false;

  $scope.hoveringOver = function(value) {
    $scope.overStar = value;
    $scope.percent = 100 * (value / $scope.max);
  };

    $scope.ratingStates = [
        {stateOn: 'glyphicon-ok-sign', stateOff: 'glyphicon-ok-circle'},
        {stateOn: 'glyphicon-star', stateOff: 'glyphicon-star-empty'},
        {stateOn: 'glyphicon-heart', stateOff: 'glyphicon-ban-circle'},
        {stateOn: 'glyphicon-heart'},
        {stateOff: 'glyphicon-off'}
    ];


    var isRunning = false;

    function checkFetch(){
        if(!isRunning){
            isRunning = true;
            $scope.checkFetchDo();
            $interval.cancel($rootScope.checkFetchDoPromise);
            $rootScope.checkFetchDoPromise = $interval($scope.checkFetchDo, 3000);
        }
    }

    function checkFetchDo(){
        if($scope.seedUrls.length == 0){
            $scope.fetch();
        }
    }


    getUserDefinedCategories();

//    getSeeds();

//	getSeedUrls();

//    checkFetchDo();

}]);




var labelUserDefinedCategoriesFactory = ngApp.factory('labelUserDefinedCategoriesFactory',['$http', function($http){

    var urlBase = '/api/workspace/{0}/label-user-defined-categories';
    var dataFactory = {};

    dataFactory.get = function (workspaceId, categories, lastId) {
        var url =  String.format(urlBase, workspaceId);
        if (categories!= null){
            url = url +"?categories=" + categories;
        }

        var glue ="";
        if (lastId){
            if(categories!= null){
                glue = "&";
            }
            else{
                glue = "?";
            }
            url = url + glue + "lastid=" + lastId;
        }

        return $http.get(url);
    };

    dataFactory.update = function(workspaceId, urlId, category, isChecked){
        var res = "";
        if(isChecked){
            res = dataFactory.label(workspaceId, urlId, category);
        }
        else{
            res = dataFactory.unlabel(workspaceId, urlId, category);
        }
        return res;
    }

    dataFactory.label = function(workspaceId, id, category){
        var url =  String.format(urlBase, workspaceId);
        return $http.post(url + "/url/" + id + "/" + category);
    };

    dataFactory.unlabel = function(workspaceId, id, category){
        var url =  String.format(urlBase, workspaceId);
        return $http.delete(url + "/url/" + id + "/" + category);
    };

    dataFactory.delete = function(workspaceId, id){
        var url =  String.format(urlBase, workspaceId);
        return $http.delete(url + "/url/" + id);
    };

    dataFactory.resetResults = function(workspaceId, source){
        var url =  String.format(urlBase, workspaceId);
        return $http.delete(url + '/generation/' + source);
    }

    dataFactory.getAggregated = function (workspaceId) {
        var url =  String.format(urlBase+'/aggregated', workspaceId);
        return $http.get(url);
    };

    return dataFactory;

}]);
