import pymongo
from bson import ObjectId

__author__ = 'tomas'
# import itertools
# import csv
# import pymongo
from pymongo import MongoClient
import traceback

'''
This class initializes a Memex Mongo object and rebuilds the db collections if you want.
Warning: init_db will delete your collection when set to True
which_collection specifies whether to connect to the scrapy crawl data or common crawl data collection
to connect to common crawl specify this as cc_crawldata
'''


mongo_database_name = "MemexHack"
seed_urls_collection_name = "seed_urls"
broad_crawler_collection_name = "broad_crawler"
crawl_job_collection_name = "crawl_job"
workspace_collection_name = "workspace"
user_collection_name = "user"
role_collection_name = "role"
login_input = "login_input"


class MongoInstance(object):

    def __init__(self, address="localhost", port=27017):
        self.client = MongoClient(address, port)
        db = self.client[mongo_database_name]
        self.db = db

        self.workspace_collection = db[workspace_collection_name]
        self.initialize()

    def get_workspace_collection(self):
        return self.db[workspace_collection_name]

    def get_seed_urls_collection(self):
        return self.db[seed_urls_collection_name]

    def get_broad_crawler_collection(self):
        return self.db[broad_crawler_collection_name]

    def get_crawl_job_collection(self):
        return self.db[crawl_job_collection_name]

    def get_user_collection(self):
        return self.db[user_collection_name]

    def get_role_collection(self):
        return self.db[role_collection_name]

    def get_login_input_collection(self):
        return self.db[login_input]

    def initialize(self):
        collections = self.db.collection_names()

        if crawl_job_collection_name not in collections:
            self.db.create_collection(crawl_job_collection_name)

        if seed_urls_collection_name not in collections:
            self.db.create_collection(seed_urls_collection_name)
            self.db[seed_urls_collection_name].create_index([("workspaceId", pymongo.ASCENDING), ("url", pymongo.ASCENDING)], unique=True, drop_dups=True)

        if broad_crawler_collection_name not in collections:
            self.db.create_collection(broad_crawler_collection_name)
            self.db[broad_crawler_collection_name].create_index([("workspaceId", pymongo.ASCENDING), ("score", pymongo.DESCENDING), ("_id", pymongo.ASCENDING)], name="scoring_search_index")

        if login_input not in collections:
            self.db.create_collection(login_input)
            self.db[login_input].create_index([("workspaceId", pymongo.ASCENDING), ("url", pymongo.ASCENDING)], unique=True, name="workspaceId_url_index")

    def get_workspace_by_id(self, id):
        return self.workspace_collection.find_one({"_id": ObjectId(id)})



