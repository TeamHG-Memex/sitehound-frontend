import json
from flask_login import login_required
from ui import app
from flask import Response, request
from utils.json_encoder import JSONEncoder
from service.seed_service import get_keywords, update_keyword, delete_keyword

__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/seed", methods=['GET'])
@login_required
def get_keyword_api(workspace_id):
    in_doc = get_keywords(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed", methods=['POST'])
@login_required
def update_keyword_api(workspace_id):
    scored_word = request.json
    hash = update_keyword(workspace_id, scored_word['word'], scored_word['score'])
    response = {"hash": hash}
    response_str = JSONEncoder().encode(response)
    return Response(response_str, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed/<hash>", methods=['DELETE'])
@login_required
def delete_keyword_api(workspace_id, hash):
    delete_keyword(workspace_id, hash)
    return Response("{}", mimetype="application/json")
