ngApp.controller('crawlingResultsController', ['$scope', '$filter', 'headerFactory', 'broadcrawlerResultsFactory', 'broadcrawlerResultsSummaryFactory', '$mdDialog',
function ($scope, $filter, headerFactory, broadcrawlerResultsFactory, broadcrawlerResultsSummaryFactory, $mdDialog) {


	$scope.master.init();
    $scope.workspaceId = $scope.master.workspaceId;

//    $scope.showFilters = ['sources', 'relevances', 'categories', , 'udcs']
    $scope.showFilters = ['broadcrawl-sources']

    $scope.display = {};
    $scope.display.results = {};
    $scope.display.results.table = true;
    $scope.display.results.cards = true;

	/* Filters */
    $scope.filters = {};
    $scope.filters.sources = ['searchengine','deepdeep'];
    // $scope.filters.relevances = [];
    $scope.filters.categories = [];
    $scope.filters.languages = [];
    // $scope.filters.udcs = [];



    $scope.results = [];
    $scope.resultsCount = 0;

	$scope.searchText = '';
	$scope.categories = [];
	$scope.selectedCategories = {};

	$scope.languages = [];
	$scope.selectedLanguages = {};

	$scope.labelCategories = $scope.categories.length > 0 ? 'Categories: ' : '' ;
	$scope.labelLanguages = $scope.languages.length > 0 ? 'Languages: ' : '' ;
	$scope.filterDisclaimer = $scope.categories.length + $scope.languages.length > 0 ? 'Show only (leave blank for all). Then click Search' : '';


    $scope.lastId = $scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null;
    $scope.maxId = null;
    $scope.crawlStatusBusy = false;
//	$scope.jobId = $routeParams.jobId ? $routeParams.jobId : null;
// 	$scope.pageNumber = -1;

    $scope.bookmarkSwitchStatus = false;

    $scope.broadcrawlStats={};
    $scope.broadcrawlStats.resultStruct={};


    var searchResultsButtonStarted = false;

	$scope.search = function(ev){

		if($scope.filters.sources.length==0){
            var custom = {};
            custom.title = 'Source is required';
            custom.textContent = 'Select a source from where to load the data.';
            $scope.master.showAlert(ev, custom);
            return;
        }

        if(!$scope.display.results.table && !$scope.display.results.cards) {
            var custom = {};
            custom.title = 'A display is required';
            custom.textContent = 'Select a display where to show the results.';
            $scope.master.showAlert(ev, custom);
            return;
        }

        $scope.results = [];
        $scope.crawlStatusBusy = false;
        searchResultsButtonStarted = true;
        $scope.pageNumber = 0;

        if($scope.display.results.table){
            console.log("table");
            getDesserts($scope.query);
		}
		if($scope.display.results.cards){
            console.log("cards");
            $scope.fetch();
        }
	};



	$scope.fetch = function(){
		if (!searchResultsButtonStarted || !$scope.display.results.cards){
			return;
		}

		if($scope.crawlStatusBusy){
			console.log('busy');
			return;
		}

		$scope.crawlStatusBusy = true;
		var searchText = '';
		if($scope.searchText == ''){
			searchText = '.*';
		}
		else{
			searchText = $scope.searchText;
		}
		var selectedLanguages = [];
		angular.forEach($scope.selectedLanguages, function(isSelected, key) {
			if(isSelected){
				selectedLanguages.push(key);
			}
		});
		var selectedCategories = [];
		angular.forEach($scope.selectedCategories, function(isSelected, key) {
			if(isSelected){
				selectedCategories.push(key);
			}
		});


		broadcrawlerResultsFactory.search($scope.workspaceId, searchText, $scope.filters, $scope.bookmarkSwitchStatus, $scope.lastId, $scope.maxId, $scope.pageNumber)
		.then(function(response){
			$scope.status = 'Data loaded';
			var tempResults = response.data.results;

			Array.prototype.push.apply($scope.results, tempResults);

			$scope.pageNumber = $scope.pageNumber + 1;
			$scope.lastId = tempResults.length > 0 ? tempResults[tempResults.length-1].id :
				($scope.results.length > 0 ? $scope.results[$scope.results.length-1].id : null) ;
			$scope.maxId = response.data.maxId ? response.data.maxId : null;
			$scope.loading = false;
			$scope.crawlStatusBusy = false;

			$scope.master.bottomOfPageReachedAddUniqueListener($scope.fetch);

            },
            function(error){
                $scope.status = 'Unable to load data: ' + error;
                $scope.loading = false;
                $scope.crawlStatusBusy = false;
    		}
        );
	};



	/*
	 $scope.getCrawlStatus = function(jobId) {
	 broadcrawlerFactory.getCrawlStatus($scope.workspaceId, jobId)
	 .success(function(data){
	 $scope.status = 'Data loaded';
	 $scope.categories = data.categories;
	 $scope.languages = data.languages;
	 $scope.nResultsFound = data.nResults;
	 $scope.labelCategories = $scope.categories.length > 0 ? 'Categories Found: ' : '' ;
	 $scope.labelLanguages = $scope.languages.length > 0 ? 'Languages Found: ' : '' ;
	 $scope.labelnResultsFound = $scope.nResultsFound > 0 ? 'Results Found: ' : '' ;
	 })
	 .error(function(error){
	 $scope.status = 'Unable to load data: ' + error;
	 })
	 .finally(function(){
	 $scope.loading = false;
	 });
	 }
	 */

    $scope.bookmarkFilter = function(result){
        if ($scope.bookmarkSwitchStatus){
            return result.pinned;
        }
        else{
            return true;
        }
    }

    $scope.notRemovedFilter = function(result){
        return !(result.deleted === true);
    }



    $scope.remove = function(model){
		broadcrawlerResultsFactory.remove($scope.workspaceId, model.id)
		.then(function(response){
			$scope.status = 'document deleted';
			model.deleted = true;
			$scope.loading = false;
            },
            function(error){
                $scope.status = 'Unable to load data: ' + error;
                $scope.loading = false;
            }
        )
	};

	$scope.deepCrawl = function(result){
		console.log('deepcrawling: ' + result.url);
		deepcrawlerFactory.send(result.url)
		.success(function(data){
			$scope.status = 'Data loaded';
			console.log("post to arachnado sent succesfully.");
			window.open('http://' + data.ARACHNADO_HOST_NAME +':' + data.ARACHNADO_HOST_PORT,'arachnado').focus()
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	$scope.bookmark = function(result, isPinned){
		bookmarkUpdate(result, true);
	}

	$scope.unbookmark = function(result, isPinned){
		bookmarkUpdate(result, false)
		.success(function(data){
			$scope.status = 'Data loaded';
			result.deleted = true;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

	var bookmarkUpdate = function(result, isPinned){
		console.log('bookmarking: ' + result.url + ' as ' + isPinned);
		bookmarkFactory.bookmark($scope.workspaceId, result.id, isPinned)
		.success(function(data){
			$scope.status = 'Data loaded';
			result.pinned = isPinned;
		})
		.error(function(error){
			$scope.status = 'Unable to load data: ' + error;
		})
		.finally(function(){
			$scope.loading = false;
		});
	}

//	$scope.getCrawlStatus();


	/// summary table ////
    $scope.selected = [];

    $scope.query = {
        search: '',
        limit: 10,
        // orderBy: 'created',
        orderBy: 'score',
        page: 1
    };

    $scope.onReorder = function (order) {
        getDesserts(angular.extend({}, $scope.query, {orderBy: order}));
    };

    $scope.onPaginate = function (page, limit) {
        getDesserts(angular.extend({}, $scope.query, {page: page, limit: limit}));
    };

    $scope.mdOnSelect = function (_id){
        // console.log($scope.selected);
        console.log("selected: " + _id);
    };

    $scope.mdOnDeselect = function (_id){
        // console.log($scope.selected);
        console.log("deselected: " + _id);
    };

    $scope.table = {};
    $scope.table.results = [];
    $scope.table.totalResultsCount = 0;

    function getDesserts(query) {

        var qry = query || $scope.query;
		qry.sources = $scope.filters.sources;

        broadcrawlerResultsSummaryFactory.get($scope.master.workspaceId, qry).then(
        	function (response) {
                $scope.table.results = response.data.results;
                $scope.table.totalResultsCount = response.data.totalResultsCount
            },
			function (response) {
                console.log(response);
            }
		)
    }

	// Cards
    $scope.mdFeatureExtractionOnClick = function (host){

        $scope.toggleSelection(host, $scope.selected);

        // console.log($scope.selected);
        console.log("clicked: " + host);
    };







    /// advanced tab for details
    $scope.showAdvanced = function(elem, ev) {

    	elem.workspaceId = $scope.master.workspaceId;

        $mdDialog.show({
            controller: 'myDialogController',
            // controller: DialogController,
            locals:{item: elem},
            // templateUrl: 'dialog1.tmpl.html',
            templateUrl: 'static/partials-md/templates/broadcrawl-resutls-detail.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose:true,
            fullscreen: $scope.customFullscreen // Only for -xs, -sm breakpoints.
        })
            .then(function(answer) {
                $scope.status = 'You said the information was "' + answer + '".';
            }, function() {
                $scope.status = 'You cancelled the dialog.';
            });
    };

}]);



ngApp.controller('myDialogController', ['$scope', '$mdDialog', 'item',
    function ($scope, $mdDialog, item) {

        $scope.elem = item;


        $scope.hide = function() {
            $mdDialog.hide();
        };

        $scope.cancel = function() {
            $mdDialog.cancel();
        };

        $scope.answer = function(answer) {
            $mdDialog.hide(answer);
        };

    }]);

