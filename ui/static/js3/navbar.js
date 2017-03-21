var domFactory = ngApp.factory('domFactory',['$http', '$location', '$route', '$routeParams', '$ngSilentLocation', 'deepcrawlerFactory',
function($http, $location, $route, $routeParams, $ngSilentLocation, deepcrawlerFactory){

	var domFactory = {};

	domFactory.setWorkspaceName = function (id) {
		if(id==undefined){
			return;
		}
		var urlBase = '/api/workspace';
		var res = $http.get(urlBase + '/' + id);
		res.success(function (data) {
			if(data==null){
				$location.path("/");
				$ngSilentLocation.silent('workspace/' + id);
			}
			else{
				$("#workspace-name").text(data.name);
			}
		})
		.error(function (error) {
			console.log('Unable to get workspace: ' + error.message);
		})

	};

	domFactory.highlightNavbar = function(navbarSelector) {
		$(navbarSelector).parent().find("li").removeClass("navbar-item-selected");
		$(navbarSelector).addClass("navbar-item-selected");//.removeClass("navbar-item-unselected");
	}

	$(".navbar-workspace").bind("click", function(e){
		var url = "/workspace/" + $routeParams.workspaceId;
		domFactory.highlightNavbar(".navbar-workspace");
		reload(url);
	});


	$(".navbar-dashboard").bind("click", function(e){
		domFactory.navigateToDashboard();
	});
	domFactory.navigateToDashboard = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/dashboard";
		reload(url);
		domFactory.highlightNavbar(".navbar-seed");
	}


	$(".navbar-seed").bind("click", function(e){
		domFactory.navigateToSeed();
	});
	domFactory.navigateToSeed = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/seed";
		reload(url);
		domFactory.highlightNavbar(".navbar-seed");
	}

	$(".navbar-import-url").bind("click", function(e){
		domFactory.navigateToImportUrl();
	});
	domFactory.navigateToImportUrl = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/import-url";
		reload(url);
		domFactory.highlightNavbar(".navbar-import-url");
	}

	$(".navbar-seed-url-searchengine").bind("click", function(e){
		domFactory.navigateToSeedUrlSearchEngine();
	});
	domFactory.navigateToSeedUrlSearchEngine = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/seed-url/searchengine";
		reload(url);
		domFactory.highlightNavbar(".navbar-seed-url");
	}


	$(".navbar-seed-url-twitter").bind("click", function(e){
		domFactory.navigateToSeedUrlTwitter();
	});
	domFactory.navigateToSeedUrlTwitter = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/seed-url/twitter";
		domFactory.highlightNavbar(".navbar-seed-url");
		reload(url);
	}

	$(".navbar-seed-url-tor").bind("click", function(e){
		domFactory.navigateToSeedUrlTor();
	});
	domFactory.navigateToSeedUrlTor = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/seed-url/tor";
		domFactory.highlightNavbar(".navbar-seed-url");
		reload(url);
	}

	$(".navbar-seed-url-deepdeep").bind("click", function(e){
		domFactory.navigateToSeedUrlDeepDeep();
	});
	domFactory.navigateToSeedUrlDeepDeep = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/seed-url/deepdeep";
		domFactory.highlightNavbar(".navbar-seed-url");
		reload(url);
	}


	$(".navbar-seed-url-imported").bind("click", function(e){
		domFactory.navigateToImportedUrl();
	});
	domFactory.navigateToImportedUrl = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/seed-url/imported";
		domFactory.highlightNavbar(".navbar-seed-url");
		reload(url);
	}

	$(".navbar-broad-crawl-new").bind("click", function(e){
		domFactory.navigateToBroadcrawlNew();
	});
	domFactory.navigateToBroadcrawlNew = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/broad-crawl";
		domFactory.highlightNavbar(".navbar-broad-crawl");
		reload(url);
	}

	$(".navbar-broad-crawl-results").bind("click", function(e){
		domFactory.navigateToBroadcrawlResults();
	});
	domFactory.navigateToBroadcrawlResults = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/broad-crawl-results";
		domFactory.highlightNavbar(".navbar-broad-crawl");
		reload(url);
	}

	$(".navbar-broad-crawl-results-summary").bind("click", function(e){
		domFactory.navigateToBroadcrawlResultsSummary();
	});
	domFactory.navigateToBroadcrawlResultsSummary = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/broad-crawl-results-summary";
		domFactory.highlightNavbar(".navbar-broad-crawl");
		reload(url);
	}

	domFactory.navigateToDDtraining = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/dd-training";
		domFactory.highlightNavbar(".navbar-seed-url");
		reload(url);
	}

	domFactory.navigateToUserDefinedCategories = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/user-defined-categories";
		reload(url);
	}

	domFactory.navigateToLabelUserDefinedCategories = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/label-user-defined-categories";
		reload(url);
	}


///api/workspace/583da61cd11ff30007931b6d/label-user-defined-categories
	domFactory.navigateToUserDefinedCategoriesDownload = function(){
		var url = "api/workspace/" + $routeParams.workspaceId + "/label-user-defined-categories/all";
        window.location.assign(url);
	}






    $(".navbar-deep-crawl").bind("click", function(e){
        deepcrawlerFactory.getConfig()
        .success(function(data){
		    window.open('http://' + data.ARACHNADO_HOST_NAME +':' + data.ARACHNADO_HOST_PORT,'arachnado').focus();
        });
	});


	$(".navbar-jobs").bind("click", function(e){
		domFactory.navigateToJobs();
	});
	domFactory.navigateToJobs = function(){
		var url = "/workspace/" + $routeParams.workspaceId + "/job/";// + $routeParams.workspaceId + "/broad-crawl-results";
		domFactory.highlightNavbar(".navbar-broad-crawl");
		reload(url);
	}


/* imported, deepdeep, tor, searchengine, twitter */
	domFactory.navigateTo = function(crawlType){
        var url = "/workspace/" + $routeParams.workspaceId + "/seed-url/"  + crawlType;
		reload(url);
	}

	function reload(url){
		if(!$routeParams.workspaceId || $routeParams.workspaceId == "undefined"){
			alert("Please select a workspace by clicking on it");
			$location.path("/");
			$route.reload();
		}
		else{
			$location.path(url);
			$route.reload();
		}
	}

	return domFactory;

}]);
