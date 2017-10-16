import logging

import json
from bson import ObjectId
from ui.singleton import Singleton

__author__ = 'tomas'


def get_crawler_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)}, {"dd_crawler.crawler_progress": 1})
    docs = list(cursor)
    progress = ""

    for doc in docs:
        if "dd_crawler" in doc and "crawler_progress" in doc["dd_crawler"]:
            progress = doc["dd_crawler"]["crawler_progress"]
    return progress


def get_all_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)}, {"page_model.quality": 1, "dd_trainer.trainer_progress": 1, "dd_crawler.crawler_progress": 1, "dd_broadcrawler.broadcrawler_progress": 1})
    docs = list(cursor)

    progress = {}
    progress["model"] = []
    progress["trainer"] = []
    progress["crawler"] = ""
    # progress["broadcrawler"] = ""

    for doc in docs:
        if "page_model" in doc and "quality" in doc["page_model"]:
            progress_as_string = doc["page_model"]["quality"]
            progress["model"] = json.loads(progress_as_string)

        if "dd_trainer" in doc and "trainer_progress" in doc["dd_trainer"]:
            progress["trainer"] = doc["dd_trainer"]["trainer_progress"]

        if "dd_crawler" in doc and "crawler_progress" in doc["dd_crawler"]:
            progress["crawler"] = doc["dd_crawler"]["crawler_progress"]

        # FIXME this should exist, broacrawler is called just crawler
        # if "dd_broadcrawler" in doc and "broadcrawler_progress" in doc["dd_broadcrawler"]:
        #     progress["broadcrawler"] = doc["dd_broadcrawler"]["broadcrawler_progress"]

    return progress

