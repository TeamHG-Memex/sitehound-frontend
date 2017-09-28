import json

from flask import Response, request
from flask_login import login_required

from service.deepcrawler_service import start_deep_crawl_job, queue_deep_crawl_stop
from ui import app
from utils.json_encoder import JSONEncoder


@app.route("/api/workspace/<workspace_id>/deep-crawler", methods=["POST"])
@login_required
def api_new_deep_crawl(workspace_id):
    num_to_fetch = request.json["nResults"]
    selection = request.json["selection"]
    job_id = start_deep_crawl_job(workspace_id, num_to_fetch, selection)
    return Response(json.dumps({"jobId": job_id}), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/deep-crawler/<job_id>", methods=['DELETE'])
@login_required
def api_stop_deep_crawler(workspace_id, job_id):
    queue_deep_crawl_stop(workspace_id, job_id)
    doc = {"message": "Job was stopped succesfully"}
    return Response(JSONEncoder().encode(doc), mimetype="application/json")
