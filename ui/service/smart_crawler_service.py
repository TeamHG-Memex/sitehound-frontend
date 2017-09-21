import logging

from controller.InvalidException import InvalidUsage
from service.job_service import save_smart_crawl_job
from ui import Singleton


def start_smart_crawl_job(workspace_id, num_to_fetch, broadness):

    #check there is trained data
    # categorized_urls = get_seeds_urls_categorized(workspace_id)
    urls = __get_urls(workspace_id)
    if len(urls) == 0:
        raise InvalidUsage("No trained URLS!", status_code=409)

    job_id = save_smart_crawl_job(workspace_id, num_to_fetch=int(num_to_fetch), broadness=broadness)
    job_id = str(job_id)

    page_model = __get_page_model(workspace_id)

    __queue_smart_crawl(workspace_id, job_id=job_id, page_limit=int(num_to_fetch), broadness=broadness, urls=urls, page_model=page_model)

    return job_id


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


def __queue_smart_crawl(workspace_id, job_id, page_limit, broadness, urls, page_model):

    message = {
        'workspace': workspace_id, #Singleton.getInstance().mongo_instance.get_current_workspace_name(),
        'id': job_id,
        'page_limit': page_limit,
        'broadness': broadness,
        'urls': urls,
        'page_model': page_model,
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


