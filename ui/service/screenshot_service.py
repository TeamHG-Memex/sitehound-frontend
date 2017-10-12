import logging
from bson import ObjectId

from ui import Singleton
import base64


def get_screenshot(crawl_type, id):
    if crawl_type == "broadcrawl":
        collection = Singleton.getInstance().mongo_instance.get_broad_crawler_collection()
    elif crawl_type == "deepcrawl":
        collection = Singleton.getInstance().mongo_instance.get_deep_crawler_collection()
    elif crawl_type == "deepcrawl-domains":
        collection = Singleton.getInstance().mongo_instance.get_deep_crawler_domains_collection()
    elif crawl_type == "keywords":
        collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    else:
        logging.info("invalid crawl type: " + crawl_type)

    res = collection.find({"_id": ObjectId(id)})
    docs = list(res)

    screenshot = ""

    if len(docs) > 0 :
        url = docs[0]["url"]
        bytes = Singleton.getInstance().es_client.get_screenshoot(url)
        if bytes:
            screenshot = base64.b64decode(bytes)

    return screenshot

