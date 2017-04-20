from flask_login import login_required

from controller.InvalidException import InvalidUsage
from mongo_repository.trained_url_repository import dao_aggregate_urls

__author__ = 'tomas'
import json
from auth import requires_auth
from ui import app
from flask import render_template, Response, request
from utils.json_encoder import JSONEncoder

from service.seed_url_service \
    import add_known_urls_handler, schedule_spider_searchengine, update_seeds_urls_relevance, \
    update_seeds_url_relevancy, delete_seeds_url, get_seeds_urls_by_source, reset_results, \
    get_seeds_urls_by_workspace


@app.route("/api/workspace/<workspace_id>/seed-url", methods=["GET"])
@login_required
def get_seed_urls_by_workspace_api(workspace_id):
    in_doc = get_seeds_urls_by_workspace(workspace_id, drop_png=True)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/<source>", methods=["POST"])
@login_required
def get_seed_urls_by_source_api(workspace_id, source):
    data = request.json
    in_doc = get_seeds_urls_by_source(workspace_id, source, data['relevance'], data['lastId'])
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/url/<id>", methods=["PUT"])
@login_required
def update_seeds_url_relevancy_api(workspace_id, id):
    relevance = request.json['relevance']
    categories = request.json['categories']
    udc = request.json['udc']
    update_seeds_url_relevancy(workspace_id, id, relevance, categories, udc)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/url/<id>", methods=["DELETE"])
@login_required
def delete_seeds_url_api(workspace_id, id):
    delete_seeds_url(workspace_id, id)
    return Response("{}", mimetype="application/json")


# triggers the schedule_spider_searchengine
@app.route("/api/workspace/<workspace_id>/seed-url/generation", methods=['POST'])
@login_required
@app.errorhandler(InvalidUsage)
def schedule_spider_searchengine_api(workspace_id):

    num_to_fetch = request.json['nResults']
    broad_crawler_provider = request.json['crawlProvider']
    broad_crawler_sources = request.json['crawlSources']

    try:
        job_id = schedule_spider_searchengine(workspace_id, num_to_fetch=int(num_to_fetch), broad_crawler_provider=broad_crawler_provider, broad_crawler_sources=broad_crawler_sources)
        return Response('{"jobId": "' + job_id + '"}', mimetype="application/json")
    except NameError, e:
        raise InvalidUsage(str(e), status_code=409)


''' Drops all the results'''
@app.route("/api/workspace/<workspace_id>/seed-url/generation/<source>", methods=['DELETE'])
@login_required
def reset_results_api(workspace_id, source):
    reset_results(workspace_id, source)
    return Response(json.dumps({}), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/import-url", methods=['POST'])
@login_required
def post_add_known_urls(workspace_id):
    json_payload = request.json
    urls_raw = json_payload['urls']
    relevance = json_payload['relevance']
    add_known_urls_handler(workspace_id, urls_raw, relevance)
    return Response(json.dumps({}), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/aggregated", methods=['GET'])
@login_required
def api_aggregate_urls(workspace_id):
    in_doc = dao_aggregate_urls(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


