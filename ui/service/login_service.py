from ui import Singleton


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
    fields = {'url': 1, 'domain': 1, 'keyValues': 1, '_id': 0}
    cursor = collection.find(query, fields)
    docs = list(cursor)

    return docs
