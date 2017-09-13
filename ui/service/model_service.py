import pymongo
import urllib
from ui.singleton import Singleton
from ui import app

from mongo_repository.trained_url_repository import label


def label_seeds_url_relevancy(workspace_id, id, relevance):
    label(workspace_id, id, relevance)
    if relevance == True or relevance == False:
        queue_labels(workspace_id)


def queue_labels(workspace_id):
    docs = dao_get_labels(workspace_id)

    for doc in docs:
        location = build_html_location(doc["url"])
        doc["html_location "] = location

    message = {
        'workspace_id': workspace_id,
        'pages': docs,
    }

    Singleton.getInstance().broker_service.add_message_to_dd_modeler_input(message)


''' return http://54.202.36.157:9200/crawled-open/analyzed/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2Fmock_object?_source=result.crawlResultDto.html '''
def build_html_location(url):
    location = "http://" + app.config['ES_HOST'] + ":" + str(app.config['ES_PORT']) + "/" + app.config['ES_INDEX_NAME'] + "/" + app.config['ES_DOC_TYPE']
    location = location + "/" + urllib.quote(url, safe='')
    location = location + "?_source=result.crawlResultDto.html"
    return location


def dao_get_labels(workspace_id):

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()

    fields = {'url': 1, 'crawlEntityType': 1, 'relevant': 1, '_id': 0}

    workspace_search_object = {'workspaceId': workspace_id}
    deleted_search_condition = {'deleted': {'$exists': False}}
    relevance_search_condition = {'relevant': {'$in': [True, False]}}

    res = collection\
        .find({'$and': [workspace_search_object, deleted_search_condition, relevance_search_condition]}, fields) \
        .sort('_id', pymongo.ASCENDING)

    return list(res)