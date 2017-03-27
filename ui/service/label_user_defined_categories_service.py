import logging
import pymongo
from bson import ObjectId
from ui.singleton import Singleton
__author__ = 'tomas'


def get_seeds_urls(workspace_id, categories_as_string, last_id, limit, _source_exclude=["result.crawlResultDto.image", "result.crawlResultDto.html"]):

    categories_search_condition = {}
    if categories_as_string is not None:
        categories = categories_as_string.split(",")
        if "NOT_EVALUATED" in categories:
            categories_search_condition = {'$or': [{'userDefinedCategories': {'$exists': False}}, {'userDefinedCategories': {'$in': categories}}]}
        else:
            categories_search_condition = {'userDefinedCategories': {'$in': categories}}

    page_search_object = {}
    if last_id is not None:
        page_search_object = {"_id": {"$gt": ObjectId(last_id)}}

    deleted_search_object = {'deleted': None}
    workspace_search_object = {'workspaceId': workspace_id}
    field_names_to_include = ['_id', 'host', 'desc', 'crawlEntityType', 'url', 'words', 'title', 'categories', 'language', 'relevant', 'userDefinedCategories']

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    res = collection \
        .find({'$and': [categories_search_condition, page_search_object, deleted_search_object, workspace_search_object]},
              field_names_to_include) \
        .sort('_id', pymongo.ASCENDING) \
        .limit(limit)

    docs = list(res)

    for item in docs:
        try:
            es_result = Singleton.getInstance().es_client.get_open_crawled_index_results(item['url'], _source_exclude)
            item['desc'] = es_result["text"]
            if "crawlResultDto" in es_result and "html" in es_result["crawlResultDto"]:
                item['html'] = es_result["crawlResultDto"]["html"]
        except:
            logging.info("item failed")
    return docs


def label(url_id, user_defined_category):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    operation = {'$addToSet': {"userDefinedCategories": user_defined_category}}
    collection.update({"_id": ObjectId(url_id)}, operation)


def unlabel(url_id, user_defined_category):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    operation = {'$pull': {"userDefinedCategories": user_defined_category}}
    collection.update({"_id": ObjectId(url_id)}, operation)


def dao_aggregated_labels_urls(workspace_id):

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    source_search_conditions = []
    workspace_search_object = {'workspaceId': workspace_id}
    delete_search_object = {'deleted': {'$exists': False}}
    # 'deleted': {'$exists': False}}
    source_search_conditions.append(workspace_search_object)
    source_search_conditions.append(delete_search_object)

    source_search_object = {'$and': source_search_conditions}

    try:
        res = collection.aggregate([

            {'$match': source_search_object},
            {'$project': {'_id': 0, 'userDefinedCategories': 1}},
            {'$unwind': "$userDefinedCategories"},
            {'$group': {'_id': "$userDefinedCategories", 'tags': { '$sum': 1}}},
            {'$project': {'_id': 0, 'userDefinedCategories': "$_id", 'tags': 1}},
            {'$sort': {'userDefinedCategories': -1}}

        # {'$group': {'_id': {'userDefinedCategories': '$userDefinedCategories'}, "count": {"$sum": 1}}}

        ])
    except Exception as e:
        logging.error(e)

    return res["result"]


