import time
import uuid
from time import gmtime, strftime
from brokers.broker_service import BrokerService
from dao.mongo_instance import MongoInstance
from kafkaclient.kafkaclient import KafkaConnector
from service.broadcrawler_service import get_search_results
from ui import Singleton

__author__ = 'tomas'


class MongoBroadCrawlerSearchTest(object):

    def __init__(self):

        app_instance = str(uuid.uuid1())
        app_instance = 'app-instance'#str(uuid.uuid1())
        instance = Singleton.getInstance()
        instance.app_instance = app_instance
        instance.mongo_instance = MongoInstance()


        search_query = {}
        search_text = 'abellan'
        print ''
        print 'searching: ' + search_text
        search_query['search_text'] = search_text
        search_results = get_search_results(search_query)
        print (search_results)
        print 'searching complete for: ' + search_text


        # in host
        print ''
        search_text = 'Guingueta'
        print 'searching: ' + search_text
        search_query['search_text'] = search_text
        search_results = get_search_results(search_query)
        print (search_results)
        print 'searching complete for: ' + search_text

        # in words
        print ''
        search_text = 'restaurantes'
        print 'searching: ' + search_text
        search_query['search_text'] = search_text
        search_results = get_search_results(search_query)
        print (search_results)
        print 'searching complete for: ' + search_text

        print 'done!'


if __name__ == "__main__":
    MongoBroadCrawlerSearchTest()