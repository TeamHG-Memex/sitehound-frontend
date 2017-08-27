import logging
from flask_login import login_required

from flask import Response, request
import json
import requests

from service.deepcrawler_service import start_deep_crawl_job
from ui import app


@app.route("/api/workspace/<workspace_id>/deepcrawl", methods=["POST"])
@login_required
def api_new_deep_crawl(workspace_id):

    num_to_fetch = request.json["nResults"]
    selection = request.json["selection"]
    job_id = start_deep_crawl_job(workspace_id, num_to_fetch, selection)
    return Response(json.dumps({"jobId": job_id}), mimetype="application/json")


