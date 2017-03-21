import pymongo

__author__ = 'tomas'
from bson import ObjectId
from dao.mongo_instance import MongoInstance
from mongoutils.errors import DeletingSelectedWorkspaceError, AddingWorkspaceError
# from app_context import mongo_instance
# from ui.app_context import AppContext
# from ui import AppContext
from ui.singleton import Singleton
import datetime

#################### services #########################


def get_all_roles():
    return dao_get_roles_all()


def get_all():
    roles = dao_get_roles_all()
    users = dao_get_all()

    for user in users:
        user["password"] = None # blanked for security
        roleEntities = []
        for role in user["roles"]:
            # roleEntity = {}
            # roleEntity["id"] = role
            # roleEntity["name"] = get_role_by_id(role, roles)
            roleEntities.append(get_role_by_id(role, roles))
        user["roles"] = roleEntities

    return users


def get_role_by_id(id, roles):
    for role in roles:
        if role["_id"] == id:
            return role

    return None

def get_admin_role():
    roles = dao_get_roles_all()
    for role in roles:
        if role["name"] == "admin":
            return role

    return None



def updateUser(id, isAdmin, isActive):
    dao_updateUser(id, isAdmin, isActive)


def delete(id):
    dao_delete(id)

#####################  DAO  #####################


def dao_get_all():
    docs = Singleton.getInstance().mongo_instance.get_user_collection().find().sort('email', pymongo.ASCENDING)
    return list(docs)


def dao_updateUser(id, isActive, roles):

    update_object = {}

    if isActive != None:
        update_object['active'] = isActive

    if roles != None:
        new_roles = []
        for role in roles:
            new_roles.append(ObjectId(role))
        update_object['roles'] = new_roles
    # else:
    #     update_object['roles'] = []

    Singleton.getInstance().mongo_instance.get_user_collection().update({'_id': ObjectId(id)}, {'$set': update_object})


def dao_delete(id):
    Singleton.getInstance().mongo_instance.get_user_collection().remove({"_id": ObjectId(id)})


def dao_get_roles_all():
    docs = Singleton.getInstance().mongo_instance.get_role_collection().find().sort('name', pymongo.ASCENDING)
    return list(docs)
