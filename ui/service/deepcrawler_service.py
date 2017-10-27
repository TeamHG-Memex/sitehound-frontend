import logging
import json
from bson import ObjectId
from controller.InvalidException import InvalidUsage
from mongo_repository.deep_crawl_repository import __get_seeds_url_by_selection
from service.domain_service import extract_domains_from_urls
from service.job_service import save_job
from service.login_service import get_logins, get_successful_logins
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

    if len(urls) == 0:
        raise InvalidUsage("No Seed URLS were selected!", status_code=409)

    job_id = save_job(workspace_id, num_to_fetch=int(num_to_fetch), crawler_provider=broad_crawler_provider,
                      crawler_sources=broad_crawler_sources, crawl_type=crawl_type, status="STARTED")

    login_credentials = get_successful_logins(workspace_id, domains)
    for doc in login_credentials:
        if "keyValues" in doc:
            doc["key_values"] = doc["keyValues"]
            doc.pop('keyValues', None)
            doc["id"] = doc["_id"]
            doc.pop('_id', None)

    queue_deep_crawl_start(workspace_id, job_id=job_id, num_to_fetch=num_to_fetch, urls=urls, login_credentials=login_credentials)
    return job_id


def queue_deep_crawl_start(workspace_id, job_id, num_to_fetch, urls, login_credentials):
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


def queue_deep_crawl_stop(workspace_id, job_id):
    logging.info("preparing stop deep-crawler")
    message = {
        'id': job_id,
        # 'workspace_id': workspace_id,
        'stop': True
    }

    logging.info(message)
    Singleton.getInstance().broker_service.add_message_to_deepcrawler(message)

