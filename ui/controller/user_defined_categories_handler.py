import json
from flask_login import login_required
from ui import app
from flask import Response, request
from utils.json_encoder import JSONEncoder
from service.user_defined_categories_service import get, delete, upsert
__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/user-defined-categories", methods=['GET'])
@login_required
def get_user_defined_categories_api(workspace_id):
    in_doc = get(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/user-defined-categories/<user_defined_category>", methods=['POST'])
@login_required
def update_user_defined_categories_api(workspace_id, user_defined_category):
    user_defined_category = user_defined_category.lower()
    upsert(workspace_id, user_defined_category)
    return Response({}, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/user-defined-categories/<user_defined_category>", methods=['DELETE'])
@login_required
def delete_user_defined_categories_api(workspace_id, user_defined_category):
    delete(workspace_id, user_defined_category)
    return Response("{}", mimetype="application/json")
