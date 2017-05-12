import logging
import json
from flask_login import login_required
from service.broadcrawler_service import get_search_results, delete_broadcrawler_result, get_max_id, count_service, \
    get_existing_categories_service, dao_aggregate_broadcrawl_results
from service.broadcrawler_service import pin_service
from ui import app, Singleton
from flask import render_template, Response, request
from utils.json_encoder import JSONEncoder

__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/broad-crawl-results", methods=["POST"])
@login_required
def get_broad_crawl_results_data(workspace_id):

    # max_id = get_max_id(workspace_id, request.json["jobId"])
    max_id = get_max_id(workspace_id, None)

    search_query = {}
    search_query["search_text"] = request.json["searchText"]
    search_query["search_languages"] = request.json["languages"]
    search_query["search_categories"] = request.json["categories"]
    search_query["search_pin"] = request.json["isPinned"]
    search_query["last_id"] = request.json["lastId"]
    # search_query["max_id"] = request.json["maxId"]
    # search_query["job_id"] = request.json["jobId"]
    search_query["page_number"] = request.json["pageNumber"]

    logging.info("filter is set to: %s" % str(filter))
    page_size = 4
    search_results = get_search_results(workspace_id, page_size, search_query)

    result_dto = {}
    # result_dto['results'] = JSONEncoder().encode(search_results)
    result_dto['results'] = search_results
    result_dto['maxId'] = max_id

    result_dto_json = JSONEncoder().encode(result_dto)
    return Response(result_dto_json, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/broad-crawl-results/bookmark/<id>", methods=["PUT"])
@login_required
def pin_url(workspace_id, id):

    # url_to_pin = request.json["url"]
    is_pinned = request.json["isPinned"]
    pin_service(workspace_id, id, is_pinned)
    return Response(json.dumps(["ok"]))


@app.route("/api/workspace/<workspace_id>/broad-crawl-results/<id>", methods=["DELETE"])
@login_required
def delete_broadcrawler_result_api(workspace_id, id):
    delete_broadcrawler_result(workspace_id, id)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/broad-crawl/status", methods=["GET"])
@login_required
def get_count(workspace_id):

    categories, languages = get_existing_categories_service(workspace_id)
    count = count_service(workspace_id)
    return Response(json.dumps({"categories": categories, "languages": languages, "nResults": count}), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/broad-crawl-results/aggregated", methods=['GET'])
@login_required
def api_aggregate_broadcrawl_results(workspace_id):
    in_doc = dao_aggregate_broadcrawl_results(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")