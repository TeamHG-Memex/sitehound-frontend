import logging
import traceback
import uuid
import pymongo
import json

from mongo_repository.trained_url_repository import dao_reset_results, get_seeds_urls_by_source_dao, \
    get_seeds_urls_by_workspace_dao
from mongo_repository.trained_url_repository import get_seeds_urls_url
from mongo_repository.trained_url_repository import get_seeds_urls_categorized
from mongo_repository.trained_url_repository import dao_delete_seed_url
from mongo_repository.trained_url_repository import dao_update_relevance
from mongo_repository.trained_url_repository import dao_update_relevanceByid
from service.job_service import save_job
from service.seed_service import dao_get_keywords_by_relevance
from mongoutils.validate import validate_url
from ui.singleton import Singleton

__author__ = 'tomas'


class Relevance:
    NEUTRAL = "neutral"
    RELEVANT = "relevant"
    IRRELEVANT = "irrelevant"
    FAILED = "failed"


def add_known_urls_handler(workspace_id, urls_raw, relevance):

    if relevance == Relevance.NEUTRAL:
        is_relevant = None
    elif relevance == Relevance.RELEVANT:
        is_relevant = True
    elif relevance == Relevance.IRRELEVANT:
        is_relevant = False
    else:
        print("UNSUPPORTED relevance: " + relevance)
        return
    for url in urls_raw.splitlines():
        url = validate_url(url)
        try:
            # dao_insert_url(url=url, is_relevant=True)
            publish_to_import_url_queue(workspace_id, url, is_relevant=is_relevant)
        except:
            logging.info(traceback.print_exc())
            print "Existing URL attempted to be uploaded, skipping it..."


def update_seeds_urls_relevance(evaluated_seeds_urls):
    for evaluated_seeds_url in evaluated_seeds_urls:
        # print (evaluated_seeds_url)
        #dao_update_url(evaluated_seeds_url['url'], evaluated_seeds_url)
        if "relevant" in evaluated_seeds_url:
            dao_update_relevance(evaluated_seeds_url['url'], evaluated_seeds_url)


def update_seeds_url_relevancy(workspace_id, id, relevance):
    dao_update_relevanceByid(workspace_id, id, relevance)


def delete_seeds_url(workspace_id, id):
    dao_delete_seed_url(workspace_id, id)


# fetches the documents (keywords and urls) from the db and post them on the queue
def schedule_spider_searchengine(workspace_id, num_to_fetch, broad_crawler_provider, broad_crawler_sources):
    keywords = dao_get_keywords_by_relevance(workspace_id)
    categorized_urls = get_seeds_urls_categorized(workspace_id)
    job_id = save_job(workspace_id, num_to_fetch=int(num_to_fetch), broad_crawler_provider=broad_crawler_provider,
                      broad_crawler_sources=broad_crawler_sources, crawl_type="KEYWORDS")

    message = {
        'included': keywords['included'],
        'excluded': keywords['excluded'],
        'relevantUrl': categorized_urls['relevant'],
        'irrelevantUrl': categorized_urls['irrelevant'],
        'nResults': int(num_to_fetch),
        'existentUrl': get_seeds_urls_url(workspace_id),
        'workspace': workspace_id,
        'jobId': job_id,
        'crawlProvider': broad_crawler_provider,
        'crawlSources': broad_crawler_sources
    }
    Singleton.getInstance().broker_service.add_message_to_googlecrawler(message)
    return job_id


def reset_results(workspace_id, source):
    dao_reset_results(workspace_id, source)


''' post to import_url queue'''
def publish_to_import_url_queue(workspace_id, url, is_relevant= True):

    message = {
        'url': url,
        'isRelevant': is_relevant,
        'metadata': Singleton.getInstance().broker_service.get_metadata(workspace_id)
    }
    Singleton.getInstance().broker_service.add_message_to_import_url(message)


def get_seeds_urls_by_workspace(workspace_id, drop_png=False):
    mongo_result = []
    for item in get_seeds_urls_by_workspace_dao(workspace_id):
        if drop_png:
            item.get('snapshot', {}).pop('png', None)
        mongo_result.append(item)
    return mongo_result


def get_seeds_urls_by_source(workspace_id, source, relevance, last_id):
    try:
        mongo_result = get_seeds_urls_by_source_dao(workspace_id, source, relevance, last_id)
    except Exception, e:
        print e
        logging.info("item failed")
    for item in mongo_result:
        try:
            es_result = Singleton.getInstance().es_client.get_open_crawled_index_results(item['url'])
            item['desc'] = es_result["text"]
            # already stored in mongo
            # item['title'] = es_result["crawlResultDto"]["title"]
            # item['words'] = es_result["words"]
            # item['language'] = es_result["language"]
            # item['categories'] = es_result["categories"]
        except:
            logging.info("item failed")
    return mongo_result

