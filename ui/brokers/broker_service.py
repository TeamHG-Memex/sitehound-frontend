from kafkaclient.kafkaclient import KafkaConnector
from time import gmtime, strftime
import time
import json
# from service.broadcrawler_service import register_broadcrawler_subscriber
# from service.scraping_service import register_scraping_subscriber
# from service.seed_url_service import register_google_crawler_subscriber
# from service.splash_service import register_splash_subscriber
from ui import Singleton
import logging


class BrokerService(object):

    def __init__(self, app_instance, kafka_host_name, kafka_host_port, set_broad_crawler = None):

        self.keywords_topic = "google-keywords"
        self.keywords_topic_input = self.keywords_topic + "-input"

        self.broad_crawler_topic = "broadcrawler"
        self.broad_crawler_topic_input = self.broad_crawler_topic + "-input"

        self.deep_crawler_topic = "dd-deepcrawler"
        self.deep_crawler_topic_input = self.deep_crawler_topic + "-input"

        self.scraping_topic = "scraping"
        self.scraping_topic_input = self.scraping_topic + "-input"

        self.splash_topic = "splash"
        self.splash_topic_input = self.splash_topic + "-input"

        self.import_url_topic = "import-url"
        self.import_url_topic_input = self.import_url_topic + "-input"

        self.events_topic = "events"
        self.events_topic_input = self.events_topic + "-input"

        self.login_topic = "login-output"
        self.dd_modeler_input = "dd-modeler-input"
        self.dd_crawler_input = "dd-crawler-input"

        self.kafka_connector = KafkaConnector(kafka_host_name, kafka_host_port)

        logging.info("connecting with kafka: " + kafka_host_name + ":" + kafka_host_port)

        self.create_topics_for_googlecrawler(app_instance)
        self.create_topics_for_broadcrawler(app_instance)
        self.create_topics_for_deepcrawler(app_instance)
        self.create_topics_for_scraping(app_instance)
        self.create_topics_for_splash(app_instance)
        self.create_topics_for_import_url(app_instance)
        self.create_topics_for_events(app_instance)
        self.create_topics_for_login(app_instance)
        self.create_topics_for_dd_modeler_input(app_instance)
        self.create_topics_for_dd_crawler_input(app_instance)
        logging.info("Broker started")

    def init_subscribers(self):
        # register_google_crawler_subscriber()
        # register_broadcrawler_subscriber()
        # register_scraping_subscriber()
        # register_splash_subscriber()
        ''' register_import_url_subscriber()  will be only pushing new records, hh-joogle will do the heavy lifting'''
        logging.info("NOT INITIALIZING SUBSCRIBERS")

    ###### GOOGLE SEARCH KEYWORDS########
    '''
    This I/O queues takes list of keywords and retrieves urls as a result of querying google search
    '''
    def create_topics_for_googlecrawler(self, app_instance):
        self.app_instance = app_instance
        suffix = "" if app_instance == "" else ("-" + app_instance)
        self.keywords_topic_output = self.keywords_topic + "-output" #+ suffix # TODO
        self.keywords_topic_group = self.keywords_topic + "-group" #+ suffix
        logging.info("creating topic " + self.keywords_topic_input)
        self.kafka_connector.create_topic(self.keywords_topic_input)
        logging.info("creating topic " + self.keywords_topic_output)
        self.kafka_connector.create_topic(self.keywords_topic_output)

    def add_message_to_googlecrawler(self, message):
        logging.info("posting  message to %s" % self.keywords_topic_input)
        self.post_to_queue_no_extra_headers(message, self.keywords_topic_input)

    def read_topic_from_googlecrawler(self, callback):
        logging.info('registering read_topic_from_googlecrawler')
        self.read_from_queue(callback, self.keywords_topic_group, self.keywords_topic_output)

    ###### BROAD CRAWL SEARCH KEYWORDS########
    '''
    This I/O queues takes list of keywords and retrieves urls as a result of USING THE BROAD CRAWLER
    '''
    def create_topics_for_broadcrawler(self, app_instance):
        self.app_instance = app_instance
        # suffix = "" if app_instance == "" else ("-" + app_instance)
        # self.broad_crawler_topic_output = self.broad_crawler_topic + "-output" #+ suffix # TODO
        # self.broad_crawler_topic_group = self.broad_crawler_topic + "-group" #+ suffix

        logging.info("creating topic " + self.broad_crawler_topic_input)
        self.kafka_connector.create_topic(self.broad_crawler_topic_input)

        # logging.info("creating topic " + self.broad_crawler_topic_output)
        # self.kafka_connector.create_topic(self.broad_crawler_topic_output)


    def add_message_to_broadcrawler(self, message, set_broad_crawler = None):

        logging.info("set broad crawler: %s " % set_broad_crawler)
        self.post_to_queue(message, self.broad_crawler_topic_input, self.broad_crawler_topic_output)

    def read_topic_from_broadcrawler(self, callback):
        logging.info('registering read_topic_from_broadcrawler')
        self.read_from_queue(callback, self.broad_crawler_topic_group, self.broad_crawler_topic_output)

    ###### DEEP CRAWL ########
    def create_topics_for_deepcrawler(self, app_instance):
        self.app_instance = app_instance
        logging.info("creating topic " + self.deep_crawler_topic_input)
        self.kafka_connector.create_topic(self.deep_crawler_topic_input)

    def add_message_to_deepcrawler(self, message):
        self.post_to_queue_no_extra_headers(message, self.deep_crawler_topic_input)


    ###### SCRAPING BASE URL########
    '''
    This I/O queues takes an url and retrieves the results of the SCRAPING
    '''
    def create_topics_for_scraping(self, app_instance):
        self.app_instance = app_instance
        suffix = "" if app_instance == "" else ("-" + app_instance)
        self.scraping_topic_output = self.scraping_topic + "-output" #+ suffix # TODO
        self.scraping_topic_group = self.scraping_topic + "-group" #+ suffix
        logging.info("creating topic " + self.scraping_topic_input)
        self.kafka_connector.create_topic(self.scraping_topic_input)
        logging.info("creating topic " + self.scraping_topic_output)
        self.kafka_connector.create_topic(self.scraping_topic_output)

    def add_message_to_scraping(self, message):
        self.post_to_queue(message, self.scraping_topic_input, self.scraping_topic_output)

    def read_topic_from_scraping(self, callback):
        logging.info('registering read_topic_from_scraping')
        self.read_from_queue(callback, self.scraping_topic_group, self.scraping_topic_output)


    ###### SPLASH ########
    '''
    This I/O queues takes an url and retrieves the image using splash
    '''
    def create_topics_for_splash(self, app_instance):
        self.app_instance = app_instance
        suffix = "" if app_instance == "" else ("-" + app_instance)
        self.splash_topic_output = self.splash_topic + "-output" #+ suffix # TODO
        self.splash_topic_group = self.splash_topic + "-group" #+ suffix
        logging.info("creating topic " + self.splash_topic_input)
        self.kafka_connector.create_topic(self.splash_topic_input)
        logging.info("creating topic " + self.splash_topic_output)
        self.kafka_connector.create_topic(self.splash_topic_output)

    def add_message_to_splash(self, message):
        self.post_to_queue(message, self.splash_topic_input, self.splash_topic_output)

    def read_topic_from_splash(self, callback):
        logging.info('registering read_topic_from_splash')
        self.read_from_queue(callback, self.splash_topic_group, self.splash_topic_output)

    ###### IMPORT URL ########
    '''
    This I/O queues publishes the manually imported urls
    '''
    def create_topics_for_import_url(self, app_instance):
        logging.info("creating topic " + self.import_url_topic_input)
        self.kafka_connector.create_topic(self.import_url_topic_input)

    def add_message_to_import_url(self, message):
        self.post_to_queue(message, self.import_url_topic_input, "")


    ###### EVENTS ########
    '''
    This I/O queues publishes the events queue
    '''
    def create_topics_for_events(self, app_instance):
        logging.info("creating topic " + self.events_topic_input)
        self.kafka_connector.create_topic(self.events_topic_input)

    def add_message_to_events(self, message):
        self.post_to_queue_no_extra_headers(message, self.events_topic_input)


    ###### LOGIN ########
    '''
    This I/O queues publishes the events queue
    '''
    def create_topics_for_login(self, app_instance):
        logging.info("creating topic " + self.login_topic)
        self.kafka_connector.create_topic(self.login_topic)

    def add_message_to_login(self, message):
        self.post_to_queue_no_extra_headers(message, self.login_topic)

    ###### DD-MODELER-INPUT ########
    '''
    This I/O queues publishes the dd-modeler-input queue
    '''
    def create_topics_for_dd_modeler_input(self, app_instance):
        logging.info("creating topic " + self.dd_modeler_input)
        self.kafka_connector.create_topic(self.dd_modeler_input)

    def add_message_to_dd_modeler_input(self, message):
        self.post_to_queue_no_extra_headers(message, self.dd_modeler_input)


    ###### DD-CRAWLER-INPUT ########
    '''
    This I/O queues publishes the dd-crawler-input queue
    '''
    def create_topics_for_dd_crawler_input(self, app_instance):
        logging.info("creating topic " + self.dd_crawler_input)
        self.kafka_connector.create_topic(self.dd_crawler_input)

    def add_message_to_dd_crawler_input(self, message):
        self.post_to_queue_no_extra_headers(message, self.dd_crawler_input)


    ##### private core methods

    # def get_metadata(self, workspace_id):
    #     metadata = {}
    #     metadata['workspace'] = workspace_id
    #     metadata['source'] = Singleton.getInstance().app_instance
    #     # metadata['callbackQueue'] = "callback_queue_not_used"
    #     # metadata['timestamp'] = time.time()
    #     metadata['strTimestamp'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
    #     return metadata

    #post
    def post_to_queue(self, message, input_queue, callback_queue):

        # add more headers to the message
        message['source'] = Singleton.getInstance().app_instance#self.app_instance
        message['callbackQueue'] = callback_queue
        message['timestamp'] = time.time()
        message['strTimestamp'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())

        json_message = json.dumps(message)
        print "sending to " + input_queue + " message: " + json_message
        self.kafka_connector.send_message(input_queue, json_message)

    #post
    def post_to_queue_no_extra_headers(self, message, input_queue):
        json_message = json.dumps(message)
        print "sending to " + input_queue + " message: " + json_message
        self.kafka_connector.send_message(input_queue, json_message)

    #read
    def read_from_queue(self, callback, topic_group, output_queue):
        print "in read_topic_from topic %s with callback %s" % (output_queue, str(callback))
        self.kafka_connector.register_consumer(callback, self.parse_json, topic_group, output_queue)

    # OffsetAndMessage(offset=0, message=Message(magic=0, attributes=0, key=None, value='sssss'))
    def parse_json(self, message):
        payload = message[1][3]
        obj = json.loads(payload)
        obj['offset'] = message[0]
        return obj