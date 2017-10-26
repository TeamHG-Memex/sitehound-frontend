from ui import Singleton
from bson import ObjectId


def get_logins(workspace_id, domains):

    collection = Singleton.getInstance().mongo_instance.get_login_collection()

    and_source_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}
    and_source_conditions.append(workspace_search_object)

    domains_search_object = {'domain': {'$in': domains}}
    and_source_conditions.append(domains_search_object)

    key_values_search_object = {'keyValues': {"$exists": True}}
    and_source_conditions.append(key_values_search_object)

    query = {'$and': and_source_conditions}
    fields = {'url': 1, 'domain': 1, 'keysOrder': 1, 'keyValues': 1, 'result': 1, '_id': 1}
    cursor = collection.find(query, fields)
    docs = list(cursor)
    for doc in docs:
        doc["_id"] = str(doc["_id"])

    return docs


def get_successful_logins(workspace_id, domains):

    collection = Singleton.getInstance().mongo_instance.get_login_collection()

    and_source_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}
    and_source_conditions.append(workspace_search_object)

    domains_search_object = {'domain': {'$in': domains}}
    and_source_conditions.append(domains_search_object)

    # key_values_search_object = {'keyValues': {"$exists": True}}
    key_values_search_object = {'keyValues': {"$exists": True}}
    and_source_conditions.append(key_values_search_object)

    key_values_login_search_object = {"$and": [{"keyValues.login": {"$exists": True}}, {"keyValues.login": {"$ne": None}}, {"keyValues.login": {"$ne": ""}}]}
    and_source_conditions.append(key_values_login_search_object)

    key_values_password_search_object = {"$and": [{"keyValues.password": {"$exists": True}}, {"keyValues.password": {"$ne": None}}, {"keyValues.password": {"$ne": ""}}]}
    and_source_conditions.append(key_values_password_search_object)

    result_search_object = {"$or": [{'result': "success"}, {'result': {"$exists": False}}]}
    and_source_conditions.append(result_search_object)

    query = {'$and': and_source_conditions}
    fields = {'url': 1, 'domain': 1, 'keyValues': 1, '_id': 1}
    cursor = collection.find(query, fields)
    docs = list(cursor)
    for doc in docs:
        doc["_id"] = str(doc["_id"])

    return docs


def update_login(workspace_id, job_id, credentials):
    save_login(credentials)
    queue_login(workspace_id, job_id, credentials)


def save_login(credentials):
    collection = Singleton.getInstance().mongo_instance.get_login_collection()

    login_search_object = {'_id': ObjectId(credentials["_id"])}

    operation = {'$set': {"keyValues": credentials["keyValues"]}}
    collection.update(login_search_object, operation)


def queue_login(workspace_id, job_id, credentials):
    message = {
        'workspace_id': workspace_id,
        'job_id': job_id,
        'id': credentials["_id"],
        'domain': credentials["domain"],
        'url': credentials["url"],
        'key_values': credentials["keyValues"]
    }

    Singleton.getInstance().broker_service.add_message_to_login(message)
