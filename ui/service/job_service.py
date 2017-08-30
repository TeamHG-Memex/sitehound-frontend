import traceback
import uuid
import pymongo
import time

__author__ = 'tomas'
from bson import ObjectId
import json
from pymongo.errors import DuplicateKeyError
from mongoutils.validate import validate_url
from ui.singleton import Singleton

#################### services #########################


def get_jobs_by_workspace(workspace_id):
    # result = {}
    # result['job'] = get_jobs_by_workspace_dao(workspace_id)
    # result['tasks'] = get_tasks_by_job(jobId);
    # return result
    return get_jobs_by_workspace_dao(workspace_id)


# def get_job(jobId):
#     result = {}
#     result['job'] = get_job_dao(jobId);
#     result['tasks'] = get_tasks_by_job(jobId);
#     return result


def dao_list_jobs(input_search_query):
    docs_to_skip = input_search_query["begin"]
    page_size = input_search_query["limit"]
    order_by = input_search_query["orderBy"]
    order_direction = input_search_query["reverse"]

    if order_direction > 0:
        mongo_order_direction = pymongo.ASCENDING
    else:
        mongo_order_direction = pymongo.DESCENDING

    query = {"workspaceId": input_search_query["workspace_id"]}

    collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()
    docs = collection \
        .find(query) \
        .limit(page_size) \
        .skip(docs_to_skip) \
        .sort(order_by, mongo_order_direction)

    return list(docs)


def dao_count_jobs(input_search_query):
    collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()
    query = {"workspaceId": input_search_query["workspace_id"]}
    count = collection.find(query).count()
    return count


## def save_job(num_to_fetch, broad_crawler_provider, broad_crawler_sources, crawl_type, job_id, workspace_name, workspace_id):
def save_job(workspace_id, num_to_fetch, broad_crawler_provider, broad_crawler_sources, crawl_type, status="QUEUED"):

    job = {}
    job["crawlType"] = crawl_type
    job["nResultsRequested"] = num_to_fetch
    job["provider"] = broad_crawler_provider
    job["sources"] = broad_crawler_sources
    job['timestamp'] = time.time()
    job['strTimestamp'] = time.strftime("%Y-%m-%d %H:%M:%S", time.gmtime())
    job["workspaceId"] = workspace_id
    job["status"] = status

    # _id = Singleton.getInstance().mongo_instance.get_crawl_job_collection().insert(job)
    collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()
    _id = collection.insert(job)
    return str(_id)

def cancel_job(job_id):
    collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()
    operation = {'$set': {"status": "CANCELLED"}}
    collection.update({"_id": ObjectId(job_id)}, operation)

################# DAO #################################

def get_jobs_by_workspace_dao(workspace_id):
    docs = Singleton.getInstance().mongo_instance.get_crawl_job_collection()\
        .find({'workspaceId': workspace_id})\
        .sort('_id', pymongo.DESCENDING)

    return list(docs)


def get_job_dao(job_id):
    return Singleton.getInstance().mongo_instance.get_crawl_job_collection().find_one({'jobId': job_id})


def get_tasks_by_job(job_id):
    return Singleton.getInstance().mongo_instance.get_crawl_task_collection().find_one({'jobId': job_id})

#
# def get_jobs_by_workspace(workspaceId):
#     return Singleton.getInstance().mongo_instance.get_crawl_job_collection().find({'jobId': jobId})
