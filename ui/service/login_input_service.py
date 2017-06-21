import pymongo
from bson import ObjectId

from ui.singleton import Singleton

__author__ = 'tomas'


def get_user_input_forms(workspace_id, last_id):
    page_search_object = {}
    if last_id:
        # page_search_object = {'_id' > input_search_query['last_id']}
        page_search_object = {"_id": {"$gt": ObjectId(last_id)}}

    complete_search_object = {'$or': [{'completed': {'$exists': False}}, {'completed': {'$ne': True}}]}
    workspace_search_object = {'workspaceId': workspace_id}

    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    res = collection\
        .find({'$and': [page_search_object, complete_search_object, workspace_search_object]})\
        .sort('_id', pymongo.ASCENDING)\
        .limit(3)

    docs = list(res)
    return docs


def update_user_input_forms(login_input_id, key_values):
    operation_values = {}
    for k, v in key_values.iteritems():
        operation_values["keyValues." + k] = v

    operation_values['completed'] = True

    operation = {'$set': operation_values}
    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    collection.update({"_id": ObjectId(login_input_id)}, operation)


def get_user_input_forms_stats(workspace_id):
    search_object = {'$and': [
                            {'workspaceId': workspace_id},
    ]}
    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    res_hosts = collection.aggregate([
            {'$match': search_object},
            {'$project': {
                "_id": 0,
                "completed_label": {"$cond": ["$completed", "completed", "pending"]},
                "completed": {"$cond": ["$completed", 1, 1]}
                }
            },
            {'$group': {
                "_id": "$completed_label",
                "count": {'$sum': "$completed"}
                }
            }
            ])
    return list(res_hosts["result"])