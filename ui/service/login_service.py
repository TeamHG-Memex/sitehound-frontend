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
    fields = {'url': 1, 'domain': 1, 'keyValues': 1, '_id': 1}
    cursor = collection.find(query, fields)
    docs = list(cursor)

    return docs


def update_login(workspace_id, credentials):
    save_login(credentials)
    queue_login(workspace_id, credentials)


def save_login(credentials):
    collection = Singleton.getInstance().mongo_instance.get_login_collection()

    login_search_object = {'_id': ObjectId(credentials["_id"])}

    operation = {'$set': {"keyValues": credentials["keyValues"]}}
    collection.update(login_search_object, operation)


def queue_login(workspace_id, credentials):
    message = {
        'workspace_id': workspace_id,
        'id': credentials["_id"],
        'domain': credentials["domain"],
        'url': credentials["url"],
        'key_values': credentials["keyValues"]
    }

    Singleton.getInstance().broker_service.add_message_to_deepcrawler(message)
