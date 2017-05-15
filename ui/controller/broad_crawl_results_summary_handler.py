import json
from flask_login import login_required
from service.broadcrawler_service import \
    get_broadcrawl_results_summary, get_broadcrawl_results_summary_count_mongo_dao, pin_service
from ui import app, Singleton
from flask import Response, request
from utils.json_encoder import JSONEncoder

__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/broad-crawl-results-summary", methods=["GET"])
@login_required
# search - the expression to filter the results by
# orderBy - the name of the field to order the results by
# reverse - "true" or "false", depending on whether the order should be reversed
# limit - maximal number of results to return
# begin - zero-based index of the first element to return
def get_broad_crawl_results_summary_data(workspace_id):

    search_query = {}

    # page_size = 10

    if request.args.get('orderBy') is not None:
        order = request.args.get('orderBy')
        if order[:1] == "-":
            order_by = order[1:]
            reverse = 1
        else:
            order_by = order
            reverse = -1
    else:
        order_by = "score"
        reverse = 1

    search_query["orderBy"] = order_by
    search_query["reverse"] = reverse

    # reverse = 1
    # if request.args.get('reverse') is not None:
    #     reverse_bool = bool(request.args.get('reverse'))
    #     if reverse_bool:
    #        reverse = -1
    # search_query["reverse"] = reverse

    search = None
    if request.args.get('search') is not None:
        search = request.args.get('search')
    search_query["search_text"] = search

    # begin = 0
    # if request.args.get('begin') is not None:
    #     begin = int(request.args.get('begin'))
    # search_query["begin"] = begin

    # limit = 10
    if request.args.get('limit') is not None:
        limit = int(request.args.get('limit'))
        search_query["limit"] = limit
    else:
        search_query["limit"] = 10

    sources = []
    if request.args.get('sources') is not None:
        sources_gui = request.args.get('sources')
        if 'searchengine' in sources_gui:
            sources.append('GOOGLE')
            sources.append('BING')
        if 'deepdeep' in sources_gui:
            sources.append('DD')
    search_query["search_sources"] = sources



    begin = 1
    if request.args.get('page') is not None:
        begin = int(request.args.get('page'))
    search_query["begin"] = (begin - 1) * limit

    search_results = get_broadcrawl_results_summary(workspace_id, search_query)
    total_results = get_broadcrawl_results_summary_count_mongo_dao(workspace_id, search_query)

    result_dto = {'results': search_results, 'totalResultsCount': total_results}
    result_dto_as_string = JSONEncoder().encode(result_dto)
    return Response(result_dto_as_string, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/broad-crawl-results-summary", methods=["POST"])
@login_required
# search - the expression to filter the results by
# orderBy - the name of the field to order the results by
# reverse - "true" or "false", depending on whether the order should be reversed
# limit - maximal number of results to return
# begin - zero-based index of the first element to return
def save_broad_crawl_results_summary_data(workspace_id):

    gui_model = json.loads(request.data)

    uuid = gui_model["id"]
    is_pinned = gui_model["pinned"] == 1
    pin_service(workspace_id, uuid, is_pinned)
    return Response({}, mimetype="application/json")
