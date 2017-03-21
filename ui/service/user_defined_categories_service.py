__author__ = 'tomas'

from bson import ObjectId
from ui.singleton import Singleton


def get(workspace_id):
    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    if ws is None \
            or "userDefinedCategories" not in ws \
            or ws["userDefinedCategories"] is None:
        return []
    else:
        return ws["userDefinedCategories"]


def upsert(workspace_id, user_defined_category):
    operation = {'$addToSet': {"userDefinedCategories": user_defined_category}}
    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    Singleton.getInstance().mongo_instance.workspace_collection.update({"_id": ObjectId(ws["_id"])}, operation)


def delete(workspace_id, user_defined_category):
    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    operation = {'$pull': {"userDefinedCategories": user_defined_category}}
    Singleton.getInstance().mongo_instance.workspace_collection.update({"_id": ObjectId(ws["_id"])}, operation)
