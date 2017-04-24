var trainingService = ngApp.factory('trainingService',['seedUrlFactory', function(seedUrlFactory){

	var service = {};

    service.udcsDirty = false;

    service.updateSeedUrl = function(workspaceId, seedUrl, source, refreshUdcOnSuccess){
        seedUrlFactory.update(workspaceId, seedUrl._id, seedUrl.relevant, seedUrl.categories, seedUrl.udc)
        .then(function(){
            if(service.udcsDirty){
                service.refreshUdc(workspaceId, source, refreshUdcOnSuccess);
               service.udcsDirty = false;
            }
        }, function(){})
    }

    service.refreshUdc = function(workspaceId, source, refreshUdcOnSuccess){
        seedUrlFactory.getUdcs(workspaceId, source).then(
            refreshUdcOnSuccess,
            function(){
                console.log("fetch udcs failed");
            }
        );
    };

	return service;
}]);