var domFactory = ngApp.factory('domFactory',['$http', '$location', '$route', '$routeParams', '$ngSilentLocation', 'deepcrawlerFactory',
function($http, $location, $route, $routeParams, $ngSilentLocation, deepcrawlerFactory){

	var domFactory = {};

	domFactory.navigateTo = function(target){
        var url = "/" + target;
		reload(url);
	};

	domFactory.navigateToDeepcrawlJob = function(jobId){
        var url = "/deepcrawler-job/"  + jobId;
		reload(url);
	};

	domFactory.navigateToSmartCrawlerResults = function(jobId){
        var url = "/smart-crawler-results/"  + jobId;
		reload(url);
	};

	function reload(url){
		$location.path(url);
		$route.reload();
	}


	domFactory.navigateToUrl = function(url){
		// $location.path(url);
		// $route.reload();
 		window.location.assign(url);
	};

	return domFactory;

}]);
