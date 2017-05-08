import logging
import pymongo
from bson import ObjectId

from controller.InvalidException import InvalidUsage
from service.job_service import save_job
from service.seed_service import dao_get_keywords_by_relevance
from service.seed_url_service import get_seeds_urls_categorized

from ui import Singleton



__author__ = 'tomas'

##################### Service #####################

# This method takes the documents from the db and post them on the queue


def start_broad_crawl_job(workspace_id, num_to_fetch, broad_crawler_provider, broad_crawler_sources, crawl_type):

        #check there is trained data
        categorized_urls = get_seeds_urls_categorized(workspace_id)

        if 'relevant' not in categorized_urls or len(categorized_urls['relevant']) == 0:
            raise InvalidUsage("No trained URLS!", status_code=409)

        job_id = save_job(workspace_id, num_to_fetch=int(num_to_fetch), broad_crawler_provider=broad_crawler_provider,
                          broad_crawler_sources=broad_crawler_sources, crawl_type=crawl_type)

        job_id = str(job_id)
        queue_broad_crawl(workspace_id, job_id=job_id, num_to_fetch=int(num_to_fetch),
                          broad_crawler_provider=broad_crawler_provider, broad_crawler_sources=broad_crawler_sources)

        return job_id


def queue_broad_crawl(workspace_id, job_id, num_to_fetch, broad_crawler_provider, broad_crawler_sources):
    # keywords = dao_get_keywords()
    keywords = dao_get_keywords_by_relevance(workspace_id)
    categorized_urls = get_seeds_urls_categorized(workspace_id)
    existent_url = get_relevant_or_neutral_seeds_urls_url(workspace_id)

    # jobId = str(uuid.uuid1())
    logging.info("sending broad crawl message for %s urls with keywords %s" % (str(num_to_fetch), str(keywords)))
    message = {
        'included': keywords['included'],
        'excluded': keywords['excluded'],
        'relevantUrl': categorized_urls['relevant'],
        'irrelevantUrl': categorized_urls['irrelevant'],
        'nResults': int(num_to_fetch),
        'existentUrl': existent_url, #get_seeds_urls_url(),
        # 'appInstance': Singleton.getInstance().app_instance,
        'workspace': workspace_id, #Singleton.getInstance().mongo_instance.get_current_workspace_name(),
        'jobId': job_id,
        'crawlProvider': broad_crawler_provider,
        'crawlSources': broad_crawler_sources
    }

    logging.info(message)
    Singleton.getInstance().broker_service.add_message_to_broadcrawler(message, broad_crawler_provider)

'''
def register_broadcrawler_subscriber():
    # Callback
    # def action1(args):
    #     print("action1 run with: " + str(args))

    # def save_urls(obj):
    # url = obj['url']
    # 	print("save_url with: " + url)
    # 	print("save_url object with: " + str(obj))
    # 	dao_update_url(url=url, obj=obj)

    def save_urls(message):

        # persist the message
        dao_insert_or_update(message)

        # schedule the splash snapshot
        collection = 'broadcrawler'
        splash_publication(message['url'], message['workspace'], collection)

    Singleton.getInstance().broker_service.read_topic_from_broadcrawler(callback=save_urls)
'''


def get_existing_categories_service(workspace_id):

    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    search_object = {}
    search_object["workspaceId"] = workspace_id
    categories = list(collection.find(search_object).distinct("categories"))
    languages = list(collection.find(search_object).distinct("language"))
    return categories, languages


def get_max_id(workspace_id, job_id):

    ws_object = {}
    ws_object["workspaceId"] = workspace_id

    search_object = {}
    if job_id:
        search_object = {"jobId": job_id}

    # res = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection() \
    # collection = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection_by_workspace_id(workspace_id)

    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    res = collection \
        .find({'$and': [ws_object, search_object]}, ['_id']) \
        .sort('_id', pymongo.DESCENDING) \
        .limit(1)

    res_list = list(res)
    if len(res_list) > 0:
        max_id = str(res_list[0]["_id"])
    else:
        max_id = None

    return max_id


def get_search_results(workspace_id, page_size, input_search_query):
    mongo_result = get_search_results_mongo_dao(workspace_id, page_size, input_search_query)
    return mongo_result


def get_broadcrawl_results_summary(workspace_id, input_search_query):
    mongo_result = get_broadcrawl_results_summary_mongo_dao(workspace_id, input_search_query)
    return mongo_result


def get_search_results_mongo_dao(workspace_id, page_size, input_search_query):

    # field_names_to_include = ['url', 'urlDesc', 'snapshot', 'pinned', 'host', 'categories', 'language', 'score']
    field_names_to_include = ['url', 'pinned', 'host', 'score']

    ws_object = {}
    ws_object["workspaceId"] = workspace_id

    search_text = input_search_query['search_text']

    url_search_condition = {'url': {'$regex': search_text}}
    host_search_condition = {'host': {'$regex': search_text}}
#    urldesc_search_condition = {'urlDesc': {'$regex': search_text}} #fixme get this from ES
#   desc_search_condition = {'desc': {'$regex': search_text}} #fixme get this from ES
#    words_search_condition = {'words': {'$regex': search_text}}
    #text_search_conditions = [url_search_condition, host_search_condition, urldesc_search_condition, desc_search_condition, words_search_condition]
    text_search_conditions = [url_search_condition, host_search_condition]

    text_search_object = {}
    text_search_object = {'$or': text_search_conditions}

    # if filter == "only-pinned-filter":
    #     filter_object = {"pinned" : True}
    # elif filter == "not-pinned-filter":
    #     filter_object = {"pinned" : None}
    # else:
    #     filter_object = {}

    if input_search_query["search_pin"]:
        filter_object = {"pinned": True}
    else:
        filter_object = {}

    language_search_object = {}
    if 'search_languages' in input_search_query and input_search_query["search_languages"] is not None and len(input_search_query["search_languages"]) > 0:
        search_languages = input_search_query["search_languages"]
        language_search_conditions = []
        for search_language in search_languages:
            language_search_conditions.append({"language": search_language})

        language_search_object = {"$or": language_search_conditions}

    category_search_object = {}
    if 'search_categories' in input_search_query and input_search_query['search_categories'] is not None and len(input_search_query["search_categories"]) > 0:
        search_categories = input_search_query['search_categories']
        category_search_conditions = []
        for search_category in search_categories:
            category_search_conditions.append({'categories': search_category})
        category_search_object = {'$or': category_search_conditions}

    # page_size = 5

    if 'page_number' in input_search_query and input_search_query['page_number'] is not None:
        # page_search_object = {'_id' > input_search_query['last_id']}
        docs_to_skip = input_search_query['page_number'] * page_size
    else:
        docs_to_skip = 0
    # docs_to_skip = 0
    # if 'last_id' in input_search_query and input_search_query['last_id'] is not None:
    #     last_id_search_object = {"_id": {"$gte": ObjectId(input_search_query['last_id'])}}
    # else:
    #     last_id_search_object = {}


    ''' can not use this filter yet, a new sub-collection is needed because of updates crossing jobs '''
    # if 'job_id' in input_search_query and input_search_query['job_id'] is not None:
    #     job_search_object = {'jobId': None}
    # else:
    #     job_search_object = {}

    ''' max_id restricts the results to the current set of returned results and not screw the pagination by score '''
    if 'max_id' in input_search_query and input_search_query['max_id'] is not None:
        max_id_search_object = {"_id": {"$lte": ObjectId(input_search_query['max_id'])}}
    else:
        max_id_search_object = {}

    deleted_search_object = {'deleted': None}

    search_object = {'$and': [
                            ws_object,
                            text_search_object,
                            category_search_object,
                            filter_object,
                            language_search_object,
                              # page_search_object,
                              # job_search_object,
                            deleted_search_object,
                            # last_id_search_object,
                            max_id_search_object
    ]}

    # collection = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection_by_workspace_id(workspace_id)
    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    res_hosts = collection.aggregate([
            # {'$match': {"deleted": None}},
            # {'$match': language_search_object},
            {'$match': search_object},
            {'$match': {"score": {'$lt': 100}}},
            # {'$project': {"host": 1, "score": 1, "url": 1, "urlDesc": 1, "language": 1, "categories": 1,
            {'$project': {"host": 1, "score": 1, "url": 1, "title": 1, "language": 1, "categories": 1,
                "pinned": {"$cond": ["$pinned", 1, 0]},
                "deleted": {"$cond": ["$deleted", 1, 0]}
             }},
            {'$sort': {"host": 1, "score": -1, "_id": 1}},
            # {'$sort': {"_id": 1}},
            {'$group': {
                        '_id': "$host",
                        "host": {'$first': "$host"},
                        "score": {'$max': "$score"},
                        "count": {'$sum': 1},
                        "url": {'$first': "$url"},
                        "id": {'$first': "$_id"},
                        # "urlDesc": {'$first': "$urlDesc"},
                        "title": {'$first': "$title"},
                        "language": {'$first': "$language"},
                        "categories": {'$first': "$categories"},
                        "pinned": {'$max': "$pinned"},
                        "deleted": {'$max': "$deleted"},
                        # "categories": {'$addToSet': "$categories"}, //TODO get the full collection of categories
                        # "categories": {'$push': {"$unwind": "$categories"}},
             }},
            {'$match': {"deleted": 0}},
            {'$sort': {"score": -1, "_id": 1}},
            # {'$sort': {"_id": 1}},
            {'$skip': docs_to_skip},
            {'$limit': page_size}
            ])

    output = res_hosts["result"]
    return output


def get_broadcrawl_results_summary_mongo_dao(workspace_id, input_search_query):

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


    # collection = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection_by_workspace_id(workspace_id)
    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    res_hosts = collection.aggregate([
            {'$match': search_object},
            {'$match': {"score": {'$lt': 100}}},
            {'$project': {"host": 1, "score": 1, "url": 1, "title": 1, "language": 1, "categories": 1,
                "pinned": {"$cond": ["$pinned", 1, 0]},
                "deleted": {"$cond": ["$deleted", 1, 0]}
             }},
            {'$sort': {"host": 1, "score": -1, "_id": 1}},
            {'$group': {
                        '_id': "$host",
                        "host": {'$first': "$host"},
                        "score": {'$max': "$score"},
                        "count": {'$sum': 1},
                        "url": {'$first': "$url"},
                        "id": {'$first': "$_id"},
                        # "urlDesc": {'$first': "$urlDesc"},
                        "title": {'$first': "$title"},
                        "language": {'$first': "$language"},
                        "categories": {'$first': "$categories"},
                        "pinned": {'$max': "$pinned"},
                        "deleted": {'$max': "$deleted"},
             }},
            {'$match': {"deleted": 0}},
            {'$sort': {order_by: order_direction, "_id": 1}},
            {'$skip': docs_to_skip},
            {'$limit': page_size}
            ])

    return list(res_hosts["result"])


def get_broadcrawl_results_summary_count_mongo_dao(workspace_id, input_search_query):

    # ws_object = {}
    # ws_object["workspaceId"] = workspace_id
    #
    search_text = input_search_query['search_text']

    text_search_object = {}

    if search_text is not None:
        text_search_conditions = [{'url': {'$regex': search_text}}, {'host': {'$regex': search_text}}]
        text_search_object = {'$or': text_search_conditions}

    search_object = {'$and': [
                            {'workspaceId': workspace_id},
                            text_search_object,
                            {'deleted': None},
    ]}

    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    res_hosts = collection.aggregate([
            # {'$match': {"deleted": None}},
            # {'$match': language_search_object},
            {'$match': search_object},
            {'$match': {"score": {'$lt': 100}}},
            # {'$project': {"host": 1, "score": 1, "url": 1, "urlDesc": 1, "language": 1, "categories": 1,
            {'$project': {"host": 1, "score": 1, "url": 1, "title": 1, "language": 1, "categories": 1,
                "pinned": {"$cond": ["$pinned", 1, 0]},
                "deleted": {"$cond": ["$deleted", 1, 0]}
             }},
            {'$sort': {"host": 1, "score": -1, "_id": 1}},
            {'$group': {
                        '_id': "$host",
                        "host": {'$first': "$host"},
                        "score": {'$max': "$score"},
                        "count": {'$sum': 1},
                        "url": {'$first': "$url"},
                        "id": {'$first': "$_id"},
                        # "urlDesc": {'$first': "$urlDesc"},
                        "title": {'$first': "$title"},
                        "language": {'$first': "$language"},
                        "categories": {'$first': "$categories"},
                        "pinned": {'$max': "$pinned"},
                        "deleted": {'$max': "$deleted"},
             }},
            {'$match': {"deleted": 0}},
            # {'$sort': {"score": -1, "_id": 1}},
            # {'$sort': {orderBy: orderDirection, "_id": 1}},
            # {'$skip': docs_to_skip},
            # {'$limit': page_size}
            ])

    output = len(res_hosts["result"])
    return output





def get_relevant_or_neutral_seeds_urls_url(workspace_id):
    # res = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection()\
    # collection = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection_by_workspace_id(workspace_id)
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    res = collection.find({'relevant': {'$ne': False}, "workspaceId": workspace_id}, {'url': 1})
    docs = list(res)
    urls = []
    for doc in docs:
        # urls.append({"id": str(doc["_id"]), "url": doc["url"]})
        urls.append(doc["url"])

    return urls


def delete_broadcrawler_result(workspace_id, id):
    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    update_object= {}
    update_object['deleted'] = True
    collection.update({"_id": ObjectId(id)}, {'$set': update_object}, True)


''' Pin Service '''


def pin_service(workspace_id, id, is_pinned):
    logging.info("PINNING: %s" % id + " as " + str(is_pinned))
    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    update_object = {"pinned": is_pinned}
    collection.update({"_id": ObjectId(id)}, {'$set': update_object}, True)


def count_service(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    return collection.find({"workspaceId": workspace_id}).count()
