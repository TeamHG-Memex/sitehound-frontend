
from ui import app, Singleton


import json

from dao.JsonDatetimeEncoder import MyEncoder
from ui import app
from flask import Response, request, jsonify
from utils.json_encoder import JSONEncoder
from flask_login import login_required
from flask_security import roles_required, utils
from mongoengine import NotUniqueError

from controller.InvalidException import InvalidUsage
from service.user_service import get_all, delete, get_all_roles

from ui.service.user_service import update_user

__author__ = 'tomas'


@app.route("/api/role", methods=['GET'])
@login_required
@roles_required('admin')
def get_all_roles_api():
    in_doc = get_all_roles()
    # out_doc = MyEncoder(JSONEncoder()).encode(in_doc)
    # return Response(json.dumps(out_doc, cls = MyEncoder), mimetype="application/json")
    out_doc = MyEncoder(JSONEncoder()).encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/user", methods=['GET'])
@login_required
@roles_required('admin')
def get_all_api():
    in_doc = get_all()
    # out_doc = MyEncoder(JSONEncoder()).encode(in_doc)
    # return Response(json.dumps(out_doc, cls = MyEncoder), mimetype="application/json")
    out_doc = MyEncoder(JSONEncoder()).encode(in_doc)
    return Response(out_doc, mimetype="application/json")


@app.route("/api/user/<id>/account-status", methods=['PUT'])
@app.errorhandler(InvalidUsage)
@login_required
@roles_required('admin')
def account_status_api(id):

    # roles = None
    isActive = None
    # if 'roles' in request.json:
    #     roles = request.json['roles']
    #
    if 'isActive' in request.json:
        isActive = bool(request.json['isActive'])

    # if isActive is None and roles is None:
    #     raise InvalidUsage("no update provided", status_code=409)

    dao_update_user_account_status(id, isActive)
    return Response("{}", mimetype="application/json")


@app.route("/api/user/<id>", methods=['PUT'])
@app.errorhandler(InvalidUsage)
@login_required
@roles_required('admin')
def edit_api(id):

    roles = None
    active = None
    if 'roles' in request.json:
        roles = request.json['roles']

    if 'active' in request.json:
        active = bool(request.json['active'])

    if active is None and roles is None:
        raise InvalidUsage("no update provided", status_code=409)

    update_user(id, active, roles)
    return Response("{}", mimetype="application/json")


@app.route("/api/user/<id>", methods=['DELETE'])
@login_required
@roles_required('admin')
def delete_api(id):
    delete(id)
    return Response("{}", mimetype="application/json")


@login_required
@roles_required('admin')
@app.errorhandler(InvalidUsage)
@app.route('/api/user/<username>', methods=['POST'])
def create_account(username):
    password = request.json['password']
    encrypted_password = utils.encrypt_password(password)

    try:
        Singleton.getInstance().user_datastore.create_user(
                email=username, password=encrypted_password, roles=[], active=True, login_count=0)
    except NotUniqueError as ex:
        raise InvalidUsage('An username with that email already exists', status_code=409)

    return Response("{}", mimetype="application/json")
