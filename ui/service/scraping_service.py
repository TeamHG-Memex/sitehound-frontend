import logging
from ui import Singleton

__author__ = 'tomas'


def scraping_publication(url):

    def register_scraping_subscriber():

        logging.info('registering register_scraping_subscriber')

    # Callback
    def action1(args):
        logging.info("action1 callback run with: " + str(args))

        logging.info('publishing for scraping: ' + url)
    message = {
        'url': url,
        'nResults': 2,
        'workspace': Singleton.getInstance().mongo_instance.get_current_workspace_name()

    }
    Singleton.getInstance().broker_service.add_message_to_scraping(message)
    return 282828


def register_scraping_subscriber():
    # Callback
    def action1(args):
        logging.info("read_topic_from_scraping run with: " + str(args))

    # def save_urls(obj):
    # url = obj['url']
    # 	print("save_url with: " + url)
    # 	print("save_url object with: " + str(obj))
    # 	dao_update_url(url=url, obj=obj)

    # Singleton.getInstance().broker_service.read_topic_from_broadcrawler(callback=save_urls)
    Singleton.getInstance().broker_service.read_topic_from_scraping(callback=action1)


