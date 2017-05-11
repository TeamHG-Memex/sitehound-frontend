import pymongo

__author__ = 'tomas'
from bson import ObjectId
from dao.mongo_instance import MongoInstance
from mongoutils.errors import DeletingSelectedWorkspaceError, AddingWorkspaceError, UpdatingWorkspaceError
# from app_context import mongo_instance
# from ui.app_context import AppContext
# from ui import AppContext
from ui.singleton import Singleton
import datetime


def list_workspace(search_query):
    return dao_list_workspace(search_query)


def get_workspace(workspace_id):
    workspace = dao_get_workspace_by_id(workspace_id)

    if "link_model" in workspace and "model" in workspace["link_model"]:
        workspace["link_model"]["model"] = True
    else:
        workspace["link_model"] = {}
        workspace["link_model"]["model"] = False

    if "page_model" in workspace and "model" in workspace["page_model"]:
        workspace["page_model"]["model"] = True
    else:
        workspace["page_model"] = {}
        workspace["page_model"]["model"] = False

    return workspace


def add_workspace(name):
    ts = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    dao_add_workspace(name, ts)


def update_workspace(workspace_id, name):
    collection = Singleton.getInstance().mongo_instance.workspace_collection
    ws_doc = collection.find_one({'_id': ObjectId(workspace_id)})
    # ws_doc = Singleton.getInstance().mongo_instance.workspace_collection.find_one({'name': name})
    if ws_doc is None:
        update_object = {'name': name}
        collection.update({'_id': ObjectId(workspace_id)}, {'$set': update_object})
    else:
        raise UpdatingWorkspaceError("The id doesn't exists")



def delete_workspace(id):
    dao_delete_workspace(id)


# def get_blur_level():
#     return dao_get_blur_level()
#
#
# def save_blur_level(level):
#     dao_save_blur_level(level)



#####################  DAO  #####################


def dao_list_workspace(input_search_query):

    docs_to_skip = input_search_query["begin"]
    page_size = input_search_query["limit"]
    order_by = input_search_query["orderBy"]
    order_direction = input_search_query["reverse"]

    if order_direction>0:
        mongo_order_direction = pymongo.ASCENDING
    else:
        mongo_order_direction = pymongo.DESCENDING

    docs = Singleton.getInstance().mongo_instance.workspace_collection\
        .find({}, {'name': 1, 'created': 1, 'words': 1})\
        .limit(page_size)\
        .skip(docs_to_skip)\
        .sort(order_by, mongo_order_direction)

    return list(docs)


def dao_count_workspace():

    count = Singleton.getInstance().mongo_instance.workspace_collection\
        .count()

    return count


def dao_add_workspace(name, ts):
    ws_doc = Singleton.getInstance().mongo_instance.workspace_collection.find_one({'name': name})
    if ws_doc is None:
        Singleton.getInstance().mongo_instance.workspace_collection.save({'name': name, 'created': ts})
        # Singleton.getInstance().mongo_instance.create_collections_when_new_workspace(name)
    else:
        raise AddingWorkspaceError('The name already exists')



def dao_get_workspace_by_id(id):
    return Singleton.getInstance().mongo_instance.workspace_collection.find_one({'_id': ObjectId(id)})


def dao_delete_workspace(id):
    Singleton.getInstance().mongo_instance.workspace_collection.remove({"_id": ObjectId(id)})
    Singleton.getInstance().mongo_instance.get_crawl_job_collection().remove({"workspaceId": id})
    Singleton.getInstance().mongo_instance.get_seed_urls_collection().remove({"workspaceId": id})
    Singleton.getInstance().mongo_instance.get_broad_crawler_collection().remove({"workspaceId": id})


# ############## BLURRING #########################
#
# def dao_get_blur_level(self):
#     ws = Singleton.getInstance().mongo_instance.get_current_workspace()
#     if ws is None or "blur_level" not in ws or ws["blur_level"] is None:
#         return 0
#     else:
#         return ws["blur_level"]
#
# def dao_save_blur_level(self, level):
#     ws = Singleton.getInstance().mongo_instance.get_current_workspace()
#     if ws is None:
#         Singleton.getInstance().mongo_instance.workspace_collection.upsert({'_id': '_default'}, {'$set': {'blur_level': level}})
#     else:
#         Singleton.getInstance().mongo_instance.workspace_collection.update({'_id': ObjectId(ws['_id'] )}, {'$set': {'blur_level': level}})
