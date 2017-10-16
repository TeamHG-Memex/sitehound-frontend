import json
from flask import Response
from flask_login import login_required
from ui import app

from service.trainer_service import get_trainer_progress

@app.route("/api/workspace/<workspace_id>/dd-trainer/progress", methods=["GET"])
@login_required
def get_trainer_progress_api(workspace_id):
    in_doc = get_trainer_progress(workspace_id)
    return Response(json.dumps(in_doc), mimetype="application/json")
