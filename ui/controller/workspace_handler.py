from flask_login import login_required

from controller.InvalidException import InvalidUsage

__author__ = 'tomas'
import json
from ui import app
from flask import Response, request, jsonify

from service.workspace_service import list_workspace, add_workspace, delete_workspace, get_workspace, \
    dao_count_workspace, update_workspace
from utils.json_encoder import JSONEncoder
from mongoutils.errors import AddingWorkspaceError


@app.errorhandler(InvalidUsage)
def handle_invalid_usage(error):
    response = jsonify(error.to_dict())
    response.status_code = error.status_code
    return response

#
# @app.route("/api/workspace", methods=['GET'])
# @login_required
# def get_workspaces_api():
#     in_doc = list_workspace()
#     out_doc = JSONEncoder().encode(in_doc)
#     return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace", methods=['GET'])
@login_required
def get_workspaces_api():

    search_query = {}

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

    in_doc = list_workspace(search_query)
    count = dao_count_workspace()

    results = {}
    results["count"] = count
    results["list"] = in_doc
    out_doc = JSONEncoder().encode(results)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace/<workspace_id>", methods=['GET'])
@login_required
def get_workspace_api(workspace_id):
    in_doc = get_workspace(workspace_id)
    out_doc = JSONEncoder().encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/workspace", methods=['POST'])
@login_required
@app.errorhandler(InvalidUsage)
def add_workspace_api():
    try:
        name = request.data
        add_workspace(name)
        # in_doc = list_workspace()
        # out_doc = JSONEncoder().encode(in_doc)
        # return Response(out_doc, mimetype="application/json")
        return Response({}, mimetype="application/json")
    except AddingWorkspaceError:
        raise InvalidUsage('A workspace with that name already exists', status_code=409)


@app.route("/api/workspace/<workspace_id>/<name>", methods=['PUT'])
@login_required
def update_workspace_api(workspace_id):
    name = request.data
    update_workspace(workspace_id, name)
    # in_doc = list_workspace()
    # out_doc = JSONEncoder().encode(in_doc)
    # return Response(out_doc, mimetype="application/json")
    return Response("{}", mimetype="application/json")

@app.route("/api/workspace/<id>", methods=['DELETE'])
@login_required
def delete_workspace_api(id):
    delete_workspace(id)
    return Response("{}", mimetype="application/json")