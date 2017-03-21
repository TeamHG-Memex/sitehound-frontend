from flask_login import login_required
from service.job_service import get_jobs_by_workspace, cancel_job

__author__ = 'tomas'
import json
from ui import app
from flask import Response
from utils.json_encoder import JSONEncoder


# returns all the jobs (and their state)
@app.route("/api/workspace/<workspace_id>/job", methods=["GET"])
@login_required
def get_jobs_api(workspace_id):
    in_doc = get_jobs_by_workspace(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(json.dumps(out_doc), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/job/<job_id>", methods=["DELETE"])
@login_required
def delete_job_api(workspace_id, job_id):
    cancel_job(job_id)
    return Response("{}", mimetype="application/json")

