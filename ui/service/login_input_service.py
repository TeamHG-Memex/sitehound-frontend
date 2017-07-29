import pymongo
from bson import ObjectId

from ui.singleton import Singleton

__author__ = 'tomas'


def get_user_input_forms(workspace_id, last_id):
    page_search_object = {}
    if last_id:
        # page_search_object = {'_id' > input_search_query['last_id']}
        page_search_object = {"_id": {"$gt": ObjectId(last_id)}}

    # complete_search_object = {'$or': [{'completed': {'$exists': False}}, {'completed': {'$ne': True}}]}
    complete_search_object = {'$or': [{'keyValues.user': {'$exists': False}}, {'keyValues.user': ""}, {'keyValues.password': {'$exists': False}}, {'keyValues.password': ""}]}
    workspace_search_object = {'workspaceId': workspace_id}

    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    res = collection\
        .find({'$and': [page_search_object, complete_search_object, workspace_search_object]})\
        .sort('_id', pymongo.ASCENDING)\
        .limit(5)

    docs = list(res)
    return docs


def search_user_input_forms(workspace_id, input_search_query):

    search_text = input_search_query['search_text']
    if search_text is not None:
        text_search_conditions = [{'url': {'$regex': search_text}}, {'host': {'$regex': search_text}}]
        text_search_object = {'$or': text_search_conditions}
    else:
        text_search_object = {}

    search_object = {'$and': [
                            {'workspaceId': workspace_id},
                            text_search_object,
                            {'deleted': None},
    ]}

    docs_to_skip = input_search_query["begin"]
    page_size = input_search_query["limit"]
    order_by = input_search_query["orderBy"]
    order_direction = input_search_query["reverse"]

    if order_direction > 0:
        order_direction_mongo = pymongo.ASCENDING
    else:
        order_direction_mongo = pymongo.DESCENDING

    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()

    res = collection\
        .find(search_object)\
        .sort(order_by, order_direction_mongo)\
        .skip(docs_to_skip)\
        .limit(page_size)

    return list(res)


# def update_login_input(workspace_id, _id, url, key_values):
#     operation_values = {}
#     operation_values["url"] = url
#     operation_values["keyValues"] = key_values
#
#     operation = {'$set': operation_values}
#     collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
#     collection.update({"_id": ObjectId(_id)}, operation)


def delete_login_input_result(workspace_id, _id):
    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    result = collection.remove({'_id': ObjectId(_id)})
    return result


def search_user_input_forms_count_mongo_dao(workspace_id, input_search_query):
    search_text = input_search_query['search_text']
    if search_text is not None:
        text_search_conditions = [{'url': {'$regex': search_text}}, {'host': {'$regex': search_text}}]
        text_search_object = {'$or': text_search_conditions}
    else:
        text_search_object = {}

    search_object = {'$and': [
                            {'workspaceId': workspace_id},
                            text_search_object,
                            {'deleted': None},
    ]}

    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    res = collection\
        .find(search_object)\
        .count()

    return res


def update_user_input_forms(workspace_id, job_id, url, login_input_id, key_values):
    dao_update_user_input_forms(login_input_id, key_values)
    publish_to_login_output_queue(workspace_id, job_id, url, key_values)


def publish_to_login_output_queue(workspace_id, job_id, url, key_values):
    input_queue = "dd-login-output"
    message = {
        'workspaceId': workspace_id,
        'job_id': job_id,
        'url': url,
        'key_values': key_values
    }
    Singleton.getInstance().broker_service.post_to_queue_no_extra_headers(message, input_queue)


def dao_update_user_input_forms(login_input_id, key_values):
    operation_values = {}
    for k, v in key_values.iteritems():
        operation_values["keyValues." + k] = v

    # operation_values['completed'] = True

    operation = {'$set': operation_values}
    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()
    collection.update({"_id": ObjectId(login_input_id)}, operation)


def get_user_input_forms_stats(workspace_id):
    search_object = {'$and': [
                            {'workspaceId': workspace_id},
    ]}
    collection = Singleton.getInstance().mongo_instance.get_login_input_collection()

    complete_search_object = {'$or': [
                                    {'keyValues': {'$in': [ None,""]}},
                                    # {'keyValues.user': {'$exists': False}},
                                    # {'$keyValues.user': ""},
                                    # {'keyValues.password': {'$exists': False}},
                                    # {'$keyValues.password': ""}
    ]}

    res_hosts = collection.aggregate([
            {'$match': search_object},
            {'$project': {
                "_id": 0,
                "completed_label": {"$cond": ["$completed", "completed", "pending"]},
                # "completed": {"$cond": ["$completed", 1, 1]}
                "completed": {"$cond": [{'$and': [{'$ne':['$keyValues.user',""]}, {'$ne':['$keyValues.user',None]}, {'$ne':['$keyValues.password',""]}, {'$ne':['$keyValues.password',None]}]}, 1, 0]},
                "pending": {"$cond": [{'$and': [{'$ne':['$keyValues.user',""]}, {'$ne':['$keyValues.user',None]}, {'$ne':['$keyValues.password',""]}, {'$ne':['$keyValues.password',None]}]}, 0, 1]},
                }
            },
            {'$group': {
                "_id": "$completed_label",
                "pending": {'$sum': "$pending"},
                "completed": {'$sum': "$completed"},
                }
            }
            ])
    return res_hosts["result"][0]