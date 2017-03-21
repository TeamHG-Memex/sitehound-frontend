import logging
from flask import Response, request
from flask import make_response
from flask_login import login_required


from service.label_user_defined_categories_service import get_seeds_urls, unlabel, label, dao_aggregated_labels_urls
from ui import app
from utils.json_encoder import JSONEncoder

__author__ = 'tomas'


handler_path = "label-user-defined-categories"


@app.route("/api/workspace/<workspace_id>/" + handler_path, methods=["GET"])
@login_required
def get_label_user_defined_categories_api(workspace_id):
    last_id = request.args.get('lastid')
    categories = request.args.get('categories')
    limit = 3
    in_doc = get_seeds_urls(workspace_id, categories, last_id, limit)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/" + handler_path + "/all", methods=["GET"])
@login_required
def get_all_label_user_defined_categories_api(workspace_id):
    try:
        limit = 10000
        _source_exclude = ["result.crawlResultDto.image"]
        in_doc = get_seeds_urls(workspace_id, None, None, limit=limit, _source_exclude=_source_exclude)
        logging.info("all found" + str(len(in_doc)) + "docs")
        out_doc = JSONEncoder().encode(in_doc)
        logging.info("making response")
        response = make_response(out_doc)
        response.headers["Content-Disposition"] = "attachment; filename=training.json"
        response.headers["mimetype"] = "application/json"
        logging.info("sending response")
    except Exception as e:
        logging.error(e.message)
    return response


@app.route("/api/workspace/<workspace_id>/" + handler_path + "/url/<url_id>/<category>", methods=["POST"])
@login_required
def add_label_user_defined_categories_api(workspace_id, url_id, category):
    if category:
        category = category.lower()
    label(url_id, category)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/" + handler_path + "/url/<url_id>/<category>", methods=["DELETE"])
@login_required
def delete_label_user_defined_categories_api(workspace_id, url_id, category):
    if category:
        category = category.lower()
    unlabel(url_id, category)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/" + handler_path + "/aggregated", methods=['GET'])
@login_required
def api_aggregated_labels_urls(workspace_id):
    in_doc = dao_aggregated_labels_urls(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


