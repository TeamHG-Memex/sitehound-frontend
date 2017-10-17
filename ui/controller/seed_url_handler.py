from flask_login import login_required

from controller.InvalidException import InvalidUsage
from mongo_repository.deep_crawl_repository import dao_aggregate_urls_to_deep_crawl
from mongo_repository.trained_url_repository import dao_aggregate_urls

__author__ = 'tomas'
import json
from auth import requires_auth
from ui import app
from flask import render_template, Response, request
from utils.json_encoder import JSONEncoder

from service.seed_url_service \
    import add_known_urls_handler, schedule_spider_searchengine, update_seeds_urls_relevance, \
    update_seeds_url_relevancy, delete_seeds_url, reset_results, \
    get_seeds_urls_to_label, get_seeds_udc_by_workspace, get_seeds_urls_keywords_results, get_seeds_urls_to_deep_crawl, get_seeds_urls_all_labeled


@app.route("/api/workspace/<workspace_id>/seed-url", methods=["GET"])
@login_required
def get_seed_urls_by_workspace_api(workspace_id):

    sources = request.args.getlist('sources')
    relevances_as_string = request.args.getlist('relevances')
    categories = request.args.getlist('categories')
    last_id = request.args.get('lastId')
    last_source = request.args.get('lastSource')
    keyword_source_type = request.args.get('keywordSourceType')
    page_size = 4
    udcs = request.args.getlist('udcs') #DEPRECATED

    relevances = []
    for rel in relevances_as_string:
        if rel == 'true':
            relevances.append(True)
        elif rel == 'false':
            relevances.append(False)
        elif rel == 'null':
            relevances.append(None)
        elif rel == 'unset':
            relevances.append('unset')
        else:
            print "unsupported relevance type: " + rel

    in_doc = get_seeds_urls_to_label(workspace_id, page_size, sources, relevances, categories, udcs, last_id, last_source)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/all-labeled", methods=["GET"])
@login_required
def get_seed_urls_all_labeled_by_workspace_api(workspace_id):

    sources = request.args.getlist('sources')
    relevances_as_string = request.args.getlist('relevances')
    last_id = request.args.get('lastId')
    page_size = 4

    relevances = []
    for rel in relevances_as_string:
        if rel == 'true':
            relevances.append(True)
        elif rel == 'false':
            relevances.append(False)
        elif rel == 'null':
            relevances.append(None)
        elif rel == 'unset':
            relevances.append('unset')
        else:
            print "unsupported relevance type: " + rel

    in_doc = get_seeds_urls_all_labeled(workspace_id, page_size, sources, relevances, last_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/to-deep-crawl", methods=["GET"])
@login_required
def get_seed_urls_to_deep_crawl_api(workspace_id):
    last_id = request.args.get('lastId')
    keyword_source_type = request.args.get('keywordSourceType')
    page_size = 4
    in_doc = get_seeds_urls_to_deep_crawl(workspace_id, page_size, keyword_source_type, last_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/keywords-results", methods=["GET"])
@login_required
def get_seeds_urls_keywords_results_api(workspace_id):

    last_id = request.args.get('lastId')
    page_size = 4
    in_doc = get_seeds_urls_keywords_results(workspace_id, page_size, last_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


# @app.route("/api/workspace/<workspace_id>/seed-url/<source>", methods=["POST"])
# @login_required
# def get_seed_urls_by_source_api(workspace_id, source):
#     data = request.json
#     # in_doc = get_seeds_urls_by_source(workspace_id, source, data['relevance'], data['lastId'])
#     in_doc = get_seeds_urls_by_source(workspace_id, source, data['relevances'], data['categories'], data['udcs'], data['lastId'])
#     out_doc = JSONEncoder().encode(in_doc)
#     return Response(out_doc, mimetype="application/json")


# @app.route("/api/workspace/<workspace_id>/seed-url/<source>/udcs", methods=["GET"])
# @app.route("/api/workspace/<workspace_id>/seed-url/udcs", methods=["GET"])
# @login_required
# def get_seed_udc_by_workspace_api(workspace_id):
#     in_doc = get_seeds_udc_by_workspace(workspace_id)
#     out_doc = JSONEncoder().encode(in_doc)
#     return Response(out_doc, mimetype="application/json")
#
#

@app.route("/api/workspace/<workspace_id>/seed-url/url/<id>", methods=["PUT"])
@login_required
def update_seeds_url_relevancy_api(workspace_id, id):

    if "relevance" in request.json:
        relevance = request.json['relevance']
    else:
        relevance = None

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
    crawler_provider = request.json['crawlProvider']
    crawler_sources = request.json['crawlSources']
    keyword_source_type = "FETCHED"

    try:
        job_id = schedule_spider_searchengine(workspace_id,
                                              num_to_fetch=int(num_to_fetch),
                                              crawler_provider=crawler_provider,
                                              crawler_sources=crawler_sources,
                                              keyword_source_type=keyword_source_type)

        return Response('{"jobId": "' + job_id + '"}', mimetype="application/json")
    except NameError, e:
        raise InvalidUsage(str(e), status_code=409)


''' Drops all the results'''
@app.route("/api/workspace/<workspace_id>/seed-url/generation/<source>", methods=['DELETE'])
@login_required
def reset_results_api(workspace_id, source):
    reset_results(workspace_id, source)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/import-url", methods=['POST'])
@login_required
def post_add_known_urls(workspace_id):
    json_payload = request.json
    urls_raw = json_payload['urls']
    # relevance = json_payload['relevance']
    relevance = True
    add_known_urls_handler(workspace_id, urls_raw, relevance)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/aggregated", methods=['GET'])
@login_required
def api_aggregate_urls(workspace_id):
    in_doc = dao_aggregate_urls(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/seed-url/aggregated/to-deep-crawl", methods=['GET'])
@login_required
def api_aggregate_urls_to_deep_crawl(workspace_id):
    in_doc = dao_aggregate_urls_to_deep_crawl(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


