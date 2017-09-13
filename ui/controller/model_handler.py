from flask import Response, request
from flask_login import login_required

from service.model_service import label_seeds_url_relevancy
from ui import app

__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/label/url/<id>", methods=["PUT"])
@login_required
def label_seeds_url_relevancy_api(workspace_id, id):

    if "relevance" in request.json:
        relevance = request.json['relevance']
    else:
        relevance = None

    label_seeds_url_relevancy(workspace_id, id, relevance)
    return Response("{}", mimetype="application/json")
