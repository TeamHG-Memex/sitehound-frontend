import json

from flask import Response, request
from flask_login import login_required

from service.login_service import update_login
from ui import app


@app.route("/api/workspace/<workspace_id>/login/<login_id>", methods=["POST"])
@login_required
def api_update_login(workspace_id, login_id):

    credentials = request.json["credentials"]
    # // save and publish to  the queue
    update_login(workspace_id, credentials)

    return Response(json.dumps({}), mimetype="application/json")


