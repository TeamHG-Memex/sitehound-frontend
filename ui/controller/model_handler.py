import json
from flask import Response, request
from flask_login import login_required

from service.model_service import label_seeds_url_relevancy, get_modeler_progress
from ui import app

@app.route("/api/workspace/<workspace_id>/label/url/<id>", methods=["PUT"])
@login_required
def label_seeds_url_relevancy_api(workspace_id, id):

    if "relevance" in request.json:
        relevance = request.json['relevance']
    else:
        relevance = None

    label_seeds_url_relevancy(workspace_id, id, relevance)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/dd-modeler/progress", methods=["GET"])
@login_required
def get_modeler_progress_api(workspace_id):

    in_doc = get_modeler_progress(workspace_id)
    # out_doc = JSONEncoder().encode(in_doc)
    # return Response(json.dumps(out_doc), mimetype="application/json")

    return Response(json.dumps(in_doc), mimetype="application/json")
    # return Response(json.dumps(jsonVar), mimetype="application/json")
    # return Response(json.dumps(var2), mimetype="application/json")
