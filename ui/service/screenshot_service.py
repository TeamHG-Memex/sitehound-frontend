import logging
from bson import ObjectId

from ui import Singleton


def get_screenshot(crawl_type, id):
    if crawl_type == "broadcrawl":
        collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    elif crawl_type == "keywords":
        collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    else:
        logging.info("invalid crawl type: " + crawl_type)

    res = collection.find({"_id": ObjectId(id)})
    url = res[0]["url"]
    base64 = Singleton.getInstance().es_client.get_screenshoot(url)
    return base64

