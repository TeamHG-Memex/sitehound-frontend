import pymongo
import urllib
from ui.singleton import Singleton
from ui import app
import json
from bson import ObjectId


from mongo_repository.trained_url_repository import label


def label_seeds_url_relevancy(workspace_id, id, relevance):
    label(workspace_id, id, relevance)
    if relevance == True or relevance == False:
        queue_labels(workspace_id)


def queue_labels(workspace_id):
    docs = dao_get_labels(workspace_id)

    for doc in docs:
        location = build_html_location(doc["url"])
        doc["html_location"] = location

    message = {
        'workspace_id': workspace_id,
        'pages': docs,
    }

    Singleton.getInstance().broker_service.add_message_to_dd_modeler_input(message)


def get_modeler_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)}, {"page_model.quality": 1, "page_model.percentage_done": 1})
    docs = list(cursor)
    progress = {}
    for doc in docs:
        if "page_model" in doc:
            if "quality" in doc["page_model"]:
                quality = doc["page_model"]["quality"]
                progress["quality"] = json.loads(quality)
            if "percentage_done" in doc["page_model"]:
                progress["percentage_done"] = doc["page_model"]["percentage_done"]
    return progress



''' return http://54.202.36.157:9200/crawled-open/analyzed/https%3A%2F%2Fen.wikipedia.org%2Fwiki%2Fmock_object?_source=result.crawlResultDto.html '''
def build_html_location(url):
    #FIXME!!!
    # location = "http://" + app.config['ES_HOST'] + ":" + str(app.config['ES_PORT']) + "/" + app.config['ES_INDEX_NAME'] + "/" + app.config['ES_DOC_TYPE']
    location = "http://" + "54.202.36.157"+ ":" + str(app.config['ES_PORT']) + "/" + app.config['ES_INDEX_NAME'] + "/" + app.config['ES_DOC_TYPE']
    location = location + "/" + urllib.quote(url, safe='')
    location = location + "?_source=result.crawlResultDto.html"
    return location


def dao_get_labels(workspace_id):

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()

    # fields = {'url': 1, 'crawlEntityType': 1, 'relevant': 1, '_id': 0}
    fields = {'url': 1, 'relevant': 1, '_id': 0}

    workspace_search_object = {'workspaceId': workspace_id}
    deleted_search_condition = {'deleted': {'$exists': False}}
    relevance_search_condition = {'relevant': {'$in': [True, False]}}

    res = collection\
        .find({'$and': [workspace_search_object, deleted_search_condition, relevance_search_condition]}, fields) \
        .sort('_id', pymongo.ASCENDING)

    return list(res)