from flask_login import login_required
from ui import app
from flask import Response, request
from utils.json_encoder import JSONEncoder
from service.job_service import get_jobs_by_workspace, cancel_job, dao_list_jobs, dao_count_jobs

__author__ = 'tomas'

# returns all the jobs (and their state)
# @app.route("/api/workspace/<workspace_id>/job", methods=["GET"])
# @login_required
# def get_jobs_api(workspace_id):
#     in_doc = get_jobs_by_workspace(workspace_id)
#     out_doc = JSONEncoder().encode(in_doc)
#     return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/job/<job_id>", methods=["DELETE"])
@login_required
def delete_job_api(workspace_id, job_id):
    cancel_job(job_id)
    return Response("{}", mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/job", methods=['GET'])
@login_required
def get_jobs_api(workspace_id):

    search_query = {}

    search_query["workspace_id"] = workspace_id

    if request.args.get('orderBy') is not None:
        order = request.args.get('orderBy')
        if order[:1] == "-":
            order_by = order[1:]
            reverse = -1
        else:
            order_by = order
            reverse = 1
    else:
        order_by = "score"
        reverse = 1

    search_query["orderBy"] = order_by
    search_query["reverse"] = reverse

    search = None
    if request.args.get('search') is not None:
        search = request.args.get('search')
    search_query["search_text"] = search

    if request.args.get('limit') is not None:
        limit = int(request.args.get('limit'))
        search_query["limit"] = limit
    else:
        search_query["limit"] = 10
        limit = 10

    begin = 1
    if request.args.get('page') is not None:
        begin = int(request.args.get('page'))
    search_query["begin"] = (begin - 1) * limit

    # in_doc = list_workspace(search_query)
    # count = dao_count_workspace()

    in_doc = dao_list_jobs(search_query)
    count = dao_count_jobs(search_query)

    results = {}
    results["count"] = count
    results["list"] = in_doc
    out_doc = JSONEncoder().encode(results)
    return Response(out_doc, mimetype="application/json")

