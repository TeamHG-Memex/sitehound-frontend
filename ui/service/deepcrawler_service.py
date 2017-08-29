import logging
import pymongo
from bson import ObjectId

from controller.InvalidException import InvalidUsage
from service.job_service import save_job
from service.seed_service import dao_get_keywords_by_relevance
from service.seed_url_service import get_seeds_urls_categorized

from ui import Singleton


##################### Service #####################

# This method takes the documents from the db and post them on the queue

def start_deep_crawl_job(workspace_id, num_to_fetch, selection):
    broad_crawler_provider = "HH-JOOGLE"
    crawl_type = "DEEPCRAWL"

    broad_crawler_sources = []
    for key, value in selection.iteritems():
        if value["allSelected"] or len(value["selected"]) > 0:
            broad_crawler_sources.append(key)

    urls = __get_seeds_url_by_selection(workspace_id, selection)

    if len(urls) == 0:
        raise InvalidUsage("No Seed URLS were selected!", status_code=409)

    job_id = save_job(workspace_id, num_to_fetch=int(num_to_fetch), broad_crawler_provider=broad_crawler_provider,
                      broad_crawler_sources=broad_crawler_sources, crawl_type=crawl_type, status="STARTED")

    queue_deep_crawl(workspace_id, job_id=job_id, num_to_fetch=num_to_fetch, urls=urls)
    return job_id


def queue_deep_crawl(workspace_id, job_id, num_to_fetch, urls):
    logging.info("preparing deep crawl message")
    message = {
        'id': job_id,
        'workspace_id': workspace_id,
        'page_limit': int(num_to_fetch),
        'urls': urls
    }

    logging.info(message)
    Singleton.getInstance().broker_service.add_message_to_deepcrawler(message)


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
        source = value["source"]
        if source == "searchengine":
            source_search_conditions.append({'crawlEntityType': "BING"})
            source_search_conditions.append({'crawlEntityType': "GOOGLE"})
        elif source == "deepdeep":
            source_search_conditions.append({'crawlEntityType': "DD"})

        elif source == "tor":
            source_search_conditions.append({'crawlEntityType': "TOR"})
        elif source == "imported":
            source_search_conditions.append({'crawlEntityType': "MANUAL"})
        else:
            print("no valid source was provided:" + source)

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


def get_deepcrawl_progress(workspace_id, job_id):
    job_doc = get_job_by_id(job_id)
    domains_detail_docs = get_domains_by_job_id(workspace_id, job_id)

    if "progress" in job_doc:
        progress = job_doc["progress"]
        for domain in progress["domains"]:
            domain_detail = __find_domain_detail_by_domain(domain["domain"], domains_detail_docs)
            domain["domain_detail"] = domain_detail

    return job_doc


def __find_domain_detail_by_domain(domain, domains_detail_docs):

    for domain_detail in domains_detail_docs:
        if domain_detail["domain"] == domain:
            return domain_detail

    return None


def get_job_by_id(job_id):
    collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()

    and_source_conditions = []

    job_search_object = {'_id': ObjectId(job_id)}
    and_source_conditions.append(job_search_object)

    query = {'$and': and_source_conditions}
    cursor = collection.find(query)
    docs = list(cursor)
    return docs[0]


def get_domains_by_job_id(workspace_id, job_id):

    collection = Singleton.getInstance().mongo_instance.get_deep_crawler_domains_collection()

    and_source_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}
    and_source_conditions.append(workspace_search_object)

    job_search_object = {'jobId': job_id}
    and_source_conditions.append(job_search_object)

    query = {'$and': and_source_conditions}
    cursor = collection.find(query)
    docs = list(cursor)
    return docs
