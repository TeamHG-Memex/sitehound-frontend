import logging
from bson import ObjectId
from controller.InvalidException import InvalidUsage
from service.domain_service import extract_domains_from_urls
from service.job_service import save_job
from service.login_service import get_logins
from ui import Singleton


def start_deep_crawl_job(workspace_id, num_to_fetch, selection):
    broad_crawler_provider = "HH-JOOGLE"
    crawl_type = "DEEPCRAWL"

    broad_crawler_sources = []
    for key, value in selection.iteritems():
        if value["allSelected"] or len(value["selected"]) > 0:
            broad_crawler_sources.append(key)

    urls = __get_seeds_url_by_selection(workspace_id, selection)
    domains = extract_domains_from_urls(urls)
    login_credentials = get_logins(workspace_id, domains)

    if len(urls) == 0:
        raise InvalidUsage("No Seed URLS were selected!", status_code=409)

    job_id = save_job(workspace_id, num_to_fetch=int(num_to_fetch), broad_crawler_provider=broad_crawler_provider,
                      broad_crawler_sources=broad_crawler_sources, crawl_type=crawl_type, status="STARTED")

    for doc in login_credentials:
        if "keyValues" in doc:
            doc["key_values"] = doc["keyValues"]
            doc.pop('keyValues', None)

    queue_deep_crawl(workspace_id, job_id=job_id, num_to_fetch=num_to_fetch, urls=urls, login_credentials=login_credentials)
    return job_id


def queue_deep_crawl(workspace_id, job_id, num_to_fetch, urls, login_credentials):
    logging.info("preparing deep crawl message")
    message = {
        'id': job_id,
        'workspace_id': workspace_id,
        'page_limit': int(num_to_fetch),
        'urls': urls,
        'login_credentials': login_credentials
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

