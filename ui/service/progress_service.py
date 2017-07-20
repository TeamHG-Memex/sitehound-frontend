import logging

from service.job_service import get_last_job_by_workspace_dao

__author__ = 'tomas'
from bson import ObjectId
import json
from ui.singleton import Singleton


# #@Deprecated
# def get_progress(workspace_id, phase):
#
#     if phase == "dd-modeler":
#         return get_modeler_progress(workspace_id)
#     elif phase == "dd-trainer":
#         return get_trainer_progress(workspace_id)
#     elif phase == "dd-crawler":
#         return get_crawler_progress(workspace_id)
#     else:
#         logging.info("UNSUPPORTED PHASE!!!")


def get_modeler_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)}, {"page_model.model": 1, "page_model.quality": 1, "page_model.percentage_done": 1})
    docs = list(cursor)
    page_model_progress = {}
    for doc in docs:
        model = False
        quality = []
        percentage_done = 0
        if "page_model" in doc:
            if "percentage_done" in doc["page_model"]:
                percentage_done = doc["page_model"]["percentage_done"]
                if percentage_done > 99:
                    model = True
                    result = Singleton.getInstance().es_client.get_modeler_model_results(workspace_id)
                    quality =json.loads(result["quality"])

        page_model_progress["model"] = model
        page_model_progress["quality"] = quality
        page_model_progress["percentageDone"] = percentage_done
        # progress = json.loads(page_model_progress)
    return page_model_progress


def get_trainer_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)})
    docs = list(cursor)
    trainer_progress = {}
    for doc in docs:
        progress = ""
        percentage_done = 0
        model = False
        if "dd_trainer" in doc and "trainer_progress" in doc["dd_trainer"]:
            progress = doc["dd_trainer"]["trainer_progress"]

        if "dd_trainer" in doc and "percentage_done" in doc["dd_trainer"]:
            percentage_done = doc["dd_trainer"]["percentage_done"]

        if "dd_trainer" in doc and "trainer_model" in doc["dd_trainer"]:
            model = doc["dd_trainer"]["trainer_model"]

        jobs = get_last_job_by_workspace_dao(workspace_id, 'DD-TRAINER')

    trainer_progress["progress"] = progress
    trainer_progress["percentageDone"] = percentage_done
    trainer_progress["model"] = model
    trainer_progress["jobs"] = jobs
    # trainer_progress ["model"] = true or false!!!!!;

    return trainer_progress


def get_crawler_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)})
    docs = list(cursor)
    crawler_progress = {}

    for doc in docs:
        if "dd_crawler" in doc:
            if "progress" in doc["dd_crawler"]:
                crawler_progress["progress"] = doc["dd_crawler"]["progress"]

            if "percentageDone" in doc["dd_crawler"]:
                crawler_progress["percentageDone"] = doc["dd_crawler"]["percentageDone"]

        jobs = get_last_job_by_workspace_dao(workspace_id, 'BROADCRAWL')
        crawler_progress["jobs"] = jobs

    return crawler_progress


def get_all_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)}, {"page_model.quality": 1, "dd_trainer.trainer_progress": 1, "dd_crawler.crawler_progress": 1, "dd_broadcrawler.broadcrawler_progress": 1})
    docs = list(cursor)

    #progress = []
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

