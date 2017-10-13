import logging
import traceback
import uuid
import pymongo
import json

from mongo_repository.trained_url_repository import dao_reset_results, \
    get_seeds_urls_to_label_dao, get_seeds_udcs_by_workspace_dao, get_seeds_urls_keywords_results_dao
from mongo_repository.trained_url_repository import get_seeds_urls_url
from mongo_repository.trained_url_repository import get_seeds_urls_categorized
from mongo_repository.trained_url_repository import dao_delete_seed_url
from mongo_repository.trained_url_repository import dao_update_relevance, label
from mongo_repository.trained_url_repository import dao_update_relevanceByid
from service.job_service import save_job
from service.metadata_factory import build_metadata
from service.seed_service import dao_get_keywords_by_relevance
from mongoutils.validate import validate_url
from ui.singleton import Singleton
from time import gmtime, strftime
__author__ = 'tomas'


class Relevance:
    NEUTRAL = "neutral"
    RELEVANT = "relevant"
    IRRELEVANT = "irrelevant"
    FAILED = "failed"


def add_known_urls_handler(workspace_id, urls_raw, is_relevant):

    for url in urls_raw.splitlines():
        try:
            url = validate_url(url)
            publish_to_import_url_queue(workspace_id, url)
        except:
            logging.info(traceback.print_exc())
            print "Existing URL attempted to be uploaded, skipping it..."


def update_seeds_urls_relevance(evaluated_seeds_urls):
    for evaluated_seeds_url in evaluated_seeds_urls:
        # print (evaluated_seeds_url)
        #dao_update_url(evaluated_seeds_url['url'], evaluated_seeds_url)
        if "relevant" in evaluated_seeds_url:
            dao_update_relevance(evaluated_seeds_url['url'], evaluated_seeds_url)


def update_seeds_url_relevancy(workspace_id, id, relevance, categories, udc):
    dao_update_relevanceByid(workspace_id, id, relevance, categories, udc)



def delete_seeds_url(workspace_id, id):
    dao_delete_seed_url(workspace_id, id)


# fetches the documents (keywords and urls) from the db and post them on the queue
def schedule_spider_searchengine(workspace_id, num_to_fetch, crawler_provider, crawler_sources, keyword_source_type):

    keywords = dao_get_keywords_by_relevance(workspace_id)
    categorized_urls = get_seeds_urls_categorized(workspace_id)

    job_id = save_job(workspace_id, num_to_fetch=int(num_to_fetch), crawler_provider=crawler_provider,
                      crawler_sources=crawler_sources, crawl_type="KEYWORDS", keyword_source_type= keyword_source_type)

    message = {
        'workspace': workspace_id,
        'jobId': job_id,
        'crawlProvider': crawler_provider,
        'crawlSources': crawler_sources,
        'strTimestamp': strftime("%Y-%m-%d %H:%M:%S", gmtime()),
        'keywordSourceType': keyword_source_type,

        'included': keywords['included'],
        'excluded': keywords['excluded'],
        'relevantUrl': categorized_urls['relevant'],
        'irrelevantUrl': categorized_urls['irrelevant'],
        'nResults': int(num_to_fetch),
        'existentUrl': get_seeds_urls_url(workspace_id)
    }

    Singleton.getInstance().broker_service.add_message_to_googlecrawler(message)
    return job_id


def reset_results(workspace_id, source):
    dao_reset_results(workspace_id, source)


def publish_to_import_url_queue(workspace_id, url):
    metadata = build_metadata(workspace_id)
    metadata["keywordSourceType"] = "MANUAL"

    message = {
        'url': url,
        'isRelevant': True,
        'metadata': metadata
    }
    Singleton.getInstance().broker_service.add_message_to_import_url(message)


def get_seeds_urls_to_label(workspace_id, page_size, sources, relevances, categories, udcs, last_id, last_source):
    mongo_result = get_seeds_urls_to_label_dao(workspace_id, page_size, sources, relevances, categories, udcs, last_id, last_source)
    return mongo_result


def get_seeds_urls_keywords_results(workspace_id, page_size, last_id):
    return get_seeds_urls_keywords_results_dao(workspace_id, page_size, last_id)


def get_seeds_udc_by_workspace(workspace_id):
    mongo_result = get_seeds_udcs_by_workspace_dao(workspace_id)
    return mongo_result

