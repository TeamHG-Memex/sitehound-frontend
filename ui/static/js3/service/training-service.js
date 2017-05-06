var trainingService = ngApp.factory('trainingService',['seedUrlFactory', function(seedUrlFactory){

	var service = {};

    service.udcsDirty = false;

    service.updateSeedUrl = function(workspaceId, seedUrl, refreshUdcOnSuccess){
        seedUrlFactory.update(workspaceId, seedUrl._id, seedUrl.relevant, seedUrl.categories, seedUrl.udc)
        .then(function(){
            if(service.udcsDirty){
                service.refreshUdc(workspaceId, refreshUdcOnSuccess);
               service.udcsDirty = false;
            }
        }, function(){})
    }

    service.refreshUdc = function(workspaceId, refreshUdcOnSuccess){
        seedUrlFactory.getUdcs(workspaceId).then(
            refreshUdcOnSuccess,
            function(){
                console.log("fetch udcs failed");
            }
        );
    };

	return service;
}]);