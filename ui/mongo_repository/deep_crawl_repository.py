import pymongo
from bson import ObjectId
from ui.singleton import Singleton


def get_seeds_urls_to_deep_crawl_dao(workspace_id, page_size, keyword_source_type, last_id):

    and_condition_list = []

    if keyword_source_type:
        and_condition_list.append({"keywordSourceType": keyword_source_type})

    if last_id:
        last_id_search_object = {"_id": {"$gt": ObjectId(last_id)}}
        and_condition_list.append(last_id_search_object)

    deleted_search_object = {'deleted': {"$exists": False}}
    and_condition_list.append(deleted_search_object)

    workspace_search_object = {'workspaceId': workspace_id}
    and_condition_list.append(workspace_search_object)

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()

    res = collection.find({'$and': and_condition_list})\
        .sort('_id', pymongo.ASCENDING)\
        .limit(page_size)

    docs = list(res)
    return docs


def dao_aggregate_urls_to_deep_crawl(workspace_id):

    and_search_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}
    and_search_conditions.append(workspace_search_object)

    delete_search_object = {'deleted': {'$exists': False}}
    and_search_conditions.append(delete_search_object)

    source_search_object = {'$and': and_search_conditions}

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()

    try:
        res = collection.aggregate([
            {'$match': source_search_object},
            {'$group': {'_id': {'keywordSourceType': '$keywordSourceType'}, "count": {"$sum": 1}}}
        ])
    except Exception as e:
        print e

    return res["result"]


def __get_seeds_url_by_selection(workspace_id, selection):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()

    or_sources_conditions = []

    for key, value in selection.iteritems():
        and_source_conditions = []
        workspace_search_object = {'workspaceId': workspace_id}
        and_source_conditions.append(workspace_search_object)

        # deleted_search_object = {'deleted': None}
        # and_source_conditions.append(deleted_search_object)

        source_search_conditions = []
        keywordSourceType = value["source"]

        source_search_conditions.append({'keywordSourceType': keywordSourceType})

        # if keywordSourceType == "FETCHED":
        #     source_search_conditions.append({'crawlEntityType': "BING"})
        # elif keywordSourceType == "MANUAL":
        #
        # if source == "searchengine":
        #     source_search_conditions.append({'crawlEntityType': "BING"})
        #     source_search_conditions.append({'crawlEntityType': "GOOGLE"})
        # elif source == "deepdeep":
        #     source_search_conditions.append({'crawlEntityType': "DD"})
        #
        # elif source == "tor":
        #     source_search_conditions.append({'crawlEntityType': "TOR"})
        # elif source == "imported":
        #     source_search_conditions.append({'crawlEntityType': "MANUAL"})
        # else:
        #     print("no valid source was provided:" + source)

        source_search_object = {'$or': source_search_conditions}
        and_source_conditions.append(source_search_object)

        if value["allSelected"]:
            object_ids = []
            for id in value["unselected"]:
                object_ids.append(ObjectId(id))
            ids_search_object = {'_id': {'$nin': object_ids}}

            and_source_conditions.append(ids_search_object)
        else:
            object_ids = []
            for id in value["selected"]:
                object_ids.append(ObjectId(id))

            ids_search_object = {'_id': {'$in': object_ids}}
            and_source_conditions.append(ids_search_object)

        or_sources_conditions.append({'$and': and_source_conditions})

    cursor = collection.find({'$or': or_sources_conditions}, {'_id': 0, 'url': 1})
    # docs = list(cursor)
    urls = []
    for item in cursor:
        urls.append(item["url"])

    return urls
