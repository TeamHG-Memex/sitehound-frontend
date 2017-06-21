from flask import Response, request
from flask_login import login_required

from service.login_input_service import get_user_input_forms, update_user_input_forms, get_user_input_forms_stats
from ui import app
from utils.json_encoder import JSONEncoder

__author__ = 'tomas'

@app.route("/api/workspace/<workspace_id>/login-input", methods=["GET"])
@login_required
def get_user_input_forms_api(workspace_id):

    last_id = request.args.get('last-id')
    in_doc = get_user_input_forms(workspace_id, last_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/login-input", methods=["PUT"])
@login_required
def update_user_input_forms__api(workspace_id):
    login_input_id = request.json['loginInputId']
    key_values = request.json['keyValues']
    update_user_input_forms(login_input_id, key_values)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/login-input/stats", methods=["GET"])
@login_required
def update_user_input_forms_stats_api(workspace_id):
    in_doc = get_user_input_forms_stats(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")