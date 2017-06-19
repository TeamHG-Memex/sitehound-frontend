from flask_login import login_required

from service.event_queue_service import publish_to_events_queue
from service.job_service import get_jobs_by_workspace, cancel_job, save_job
from flask import Response, request
import json
from ui import app
from flask import Response
from utils.json_encoder import JSONEncoder


@app.route("/api/workspace/<workspace_id>/job", methods=["GET"])
@login_required
def get_jobs_api(workspace_id):
    in_doc = get_jobs_by_workspace(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(json.dumps(out_doc), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/job", methods=["POST"])
@login_required
def create_jobs_api(workspace_id):
    provider = request.json['provider']
    crawl_type = request.json['crawlType']
    num_to_fetch = request.json['nResults']

    sources_str = request.json['sources']
    sources = [sources_str]

    job_id = save_job(workspace_id, num_to_fetch, provider, sources, crawl_type)
    return Response(json.dumps({"jobId": job_id}), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/job/<job_id>", methods=["DELETE"])
@login_required
def cancel_job_api(workspace_id, job_id):
    cancel_job(job_id)
    publish_to_events_queue(workspace_id, "job", "stop", {"jobId": job_id})
    return Response("{}", mimetype="application/json")

