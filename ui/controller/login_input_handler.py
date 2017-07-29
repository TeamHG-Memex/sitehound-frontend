from flask import Response, request
from flask_login import login_required

from service.login_input_service import get_user_input_forms, update_user_input_forms, get_user_input_forms_stats, \
    search_user_input_forms, search_user_input_forms_count_mongo_dao, delete_login_input_result
from ui import app
from utils.json_encoder import JSONEncoder
import logging
import json

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
    job_id = request.json['jobId']
    url = request.json['loginUrl']
    login_input_id = request.json['loginInputId']
    key_values = request.json['keyValues']
    update_user_input_forms(workspace_id, job_id, url, login_input_id, key_values)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/login-input/stats", methods=["GET"])
@login_required
def update_user_input_forms_stats_api(workspace_id):
    in_doc = get_user_input_forms_stats(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")



@app.route("/api/workspace/<workspace_id>/login-input/summary/<id>", methods=["DELETE"])
@login_required
def delete_user_input_forms_api(workspace_id, id):
    delete_login_input_result(workspace_id, id)
    return Response("{}", mimetype="application/json")


# @app.route("/api/workspace/<workspace_id>/login-input/<id>/summary", methods=["PUT"])
# @login_required
# def update_user_input_forms_api(workspace_id, id):
#     url = request.json['url']
#     key_values = request.json['keyValues']
#     update_login_input(workspace_id, id, url, key_values)
#     return Response("{}", mimetype="application/json")


# @app.route("/api/workspace/<workspace_id>/broad-crawl-results", methods=["POST"])
@app.route("/api/workspace/<workspace_id>/login-input/summary", methods=["GET"])
@login_required
def search_user_input_forms_api(workspace_id):
    # search - the expression to filter the results by
    # orderBy - the name of the field to order the results by
    # reverse - "true" or "false", depending on whether the order should be reversed
    # limit - maximal number of results to return
    # begin - zero-based index of the first element to return
    # def get_broad_crawl_results_summary_data(workspace_id):

    search_query = {}

    order_by = "_id"
    if request.args.get('orderBy') is not None:
        order_by = request.args.get('orderBy')
    search_query["orderBy"] = order_by

    reverse = 1
    if request.args.get('reverse') is not None:
        reverse_bool = bool(request.args.get('reverse'))
        if reverse_bool:
            reverse = -1
    search_query["reverse"] = reverse

    search = None
    if request.args.get('search') is not None:
        search = request.args.get('search')
    search_query["search_text"] = search

    begin = 0
    if request.args.get('begin') is not None:
        begin = int(request.args.get('begin'))
    search_query["begin"] = begin

    limit = 10
    if request.args.get('limit') is not None:
        limit = int(request.args.get('limit'))
    search_query["limit"] = limit

    search_results = search_user_input_forms(workspace_id, search_query)
    total_results = search_user_input_forms_count_mongo_dao(workspace_id, search_query)

    result_dto = {'data': search_results, 'totalResults': total_results}
    result_dto_as_string = JSONEncoder().encode(result_dto)
    return Response(result_dto_as_string, mimetype="application/json")