import json
from flask_login import login_required

from service.event_queue_service import publish_to_events_queue
from ui import app
from flask import Response, request
from utils.json_encoder import JSONEncoder
from service.seed_service import get_keywords, update_keyword, delete_keyword

__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/event/<event_type>", methods=['POST'])
@login_required
def get_event_api(workspace_id, event_type):
    po = request.json

    if "arguments" in po:
        arguments = po["arguments"]
    else:
        arguments = ""

    publish_to_events_queue(workspace_id, event_type, po["action"], arguments)

    out_doc = JSONEncoder().encode({})
    return Response(out_doc, mimetype="application/json")


