$(document).ready(function() {

//	console.log('jquery run');

	$('.tooltip').tooltipster();

/*
	function checkAndSetSelectedWorkspaceName(){
		var pathSplits = $(location).attr('hash').split("/")
		if(pathSplits && pathSplits.length > 2){
			var workspaceId = pathSplits[2];
			var ws = workspaceFactory.getWorkspace($scope.workspaceId);
			console.log(workspaceId);
//			$("#workspace-name").text(ws.name);
		}
//		if($("#workspace-name").text() == "" && $scope.workspaceId){
//			var ws = workspaceFactory.getWorkspace($scope.workspaceId);
//			//setSelectedWorkspace(id);
//			$("#workspace-name").text(ws.name);
//		}
	}
	checkAndSetSelectedWorkspaceName();
*/
	/*
	var url = '/api/workspace';
	var workspace_span = $("#workspace-name");
	var posting = $.get( url, function(data){
		var obj = $.parseJSON(data);
		$.each(obj, function(index,elem){
			if (elem.selected == true) {
				var selected_workspace = elem.name;
				workspace_span.text(selected_workspace);
			}
		});
	});
	*/
});

if (!String.format) {
  String.format = function(format) {
    var args = Array.prototype.slice.call(arguments, 1);
    return format.replace(/{(\d+)}/g, function(match, number) {
      return typeof args[number] != 'undefined'
        ? args[number]
        : match
      ;
    });
  };
}
