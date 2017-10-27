import logging

import pymongo
from bson import ObjectId

from controller.InvalidException import InvalidUsage
from service.job_service import save_smart_crawl_job
from ui import Singleton


def start_smart_crawl_job(workspace_id, num_to_fetch, broadness):
    urls = __get_urls(workspace_id)
    if len(urls) == 0:
        raise InvalidUsage("No trained URLS!", status_code=409)

    job_id = save_smart_crawl_job(workspace_id, num_to_fetch=int(num_to_fetch), broadness=broadness)
    page_model = __get_page_model(workspace_id)
    __queue_smart_crawl_start(workspace_id, job_id=job_id, page_limit=int(num_to_fetch), broadness=broadness, urls=urls, page_model=page_model)
    return job_id


def get_smart_crawler_results(workspace_id, page_size, input_search_query):

    and_conditions = []
    and_conditions.append({'workspaceId': workspace_id})
    and_conditions.append({'deleted': {'$exists': False}})
    and_conditions.append({'crawlEntityType': 'DD'})
#    and_conditions.append({'crawlType': 'SMARTCRAWL'})

    if 'job_id' in input_search_query and input_search_query['job_id'] is not None:
        job_search_object = {'jobId': input_search_query["job_id"]}
        and_conditions.append(job_search_object)

    ''' max_id restricts the results to the current set of returned results and not screw the pagination by score '''
    if 'last_id' in input_search_query and input_search_query['last_id'] is not None:
        last_id_search_object = {"_id": {"$gt": ObjectId(input_search_query['last_id'])}}
        and_conditions.append(last_id_search_object)

    if "search_text" in input_search_query:
        search_text = input_search_query['search_text']
        url_search_condition = {'url': {'$regex': search_text}}
        host_search_condition = {'host': {'$regex': search_text}}
        and_conditions.append({'$or': [url_search_condition, host_search_condition]})

    # and_source_conditions = {'$and': and_conditions}

    collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    query = {'$and': and_conditions}
    cursor = collection.find(query) \
            .sort('_id', pymongo.ASCENDING) \
            .limit(page_size)

    docs = list(cursor)
    return docs


# def get_smart_crawler_progress(job_id):
#     collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()
#     cursor = collection.find({'_id': ObjectId(job_id)}, {"progress": 1, "percentage_done": 1})
#     docs = list(cursor)
#     status = {}
#
#     for doc in docs:
#         if "progress" in doc:
#             status["progress"] = doc["progress"]
#         if "percentage_done" in doc:
#             status["percentage_done"] = doc["percentage_done"]
#     return status


def __queue_smart_crawl_start(workspace_id, job_id, page_limit, broadness, urls, page_model):
    '''
    {
        "workspace_id": "workspace id",
        "id": "crawl id",
        "page_limit": 100
        "broadness": "BROAD" # Valid codes are["N10", "N100", "N1000", "N10000", "BROAD"],
        "urls": ["http://example.com", "http://example.com/2"],
        "page_model": "b64-encoded page classifier",
    }
    '''

    message = {
        'workspace_id': workspace_id, #Singleton.getInstance().mongo_instance.get_current_workspace_name(),
        'id': job_id,
        'page_limit': page_limit,
        'broadness': broadness,
        'urls': urls,
        'page_model': page_model,
    }
    logging.info(message)
    Singleton.getInstance().broker_service.add_message_to_dd_crawler_input(message)


def __queue_smart_crawler_stop(workspace_id, job_id):

    message = {
        'id': job_id,
        'stop': True
    }
    logging.info(message)
    Singleton.getInstance().broker_service.add_message_to_dd_crawler_input(message)


def __get_urls(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    relevant_urls_result = collection.find(
        {'workspaceId': workspace_id, 'relevant': True, 'deleted': {'$exists': False}}, {'_id': 0, 'url': 1})
    relevant_urls = []
    for url_doc in relevant_urls_result:
        if 'url' in url_doc:
            relevant_urls.append(url_doc['url'])

    return relevant_urls


def __get_page_model(workspace_id):
    base64 = Singleton.getInstance().es_client.get_modeler_model(workspace_id)
    return base64


