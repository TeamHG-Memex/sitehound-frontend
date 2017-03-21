import time
import uuid
from time import gmtime, strftime
from brokers.broker_service import BrokerService
from dao.mongo_instance import MongoInstance
from kafkaclient.kafkaclient import KafkaConnector
from ui import Singleton

__author__ = 'tomas'

class SplashKafkaIntegrationTest(object):

    def __init__(self):
        self.counter = 0
        self.sample_size = 50

        def action1(args):
            print ("callback run with: " + str(args))
            print ("current counter:" + str(self.counter))
            self.counter = self.counter + 1

        kafka_host_port = "9092"
        kafka_host_name = "localhost"
        # topic_group = "test-group"
        # topic = 'splash'
        # topic_input = topic + '-input'
        # topic_output = topic + '-input'#+ '-output'

        app_instance = str(uuid.uuid1())
        app_instance = 'app-instance'#str(uuid.uuid1())
        instance = Singleton.getInstance()
        instance.app_instance = app_instance
        instance.mongo_instance = MongoInstance()

        kafka_connector = KafkaConnector(kafka_host_name, kafka_host_port)
        # kafka_connector.create_topic(topic_input)

        broker_service = BrokerService(app_instance, kafka_host_name, kafka_host_port)

        #subscribe
        # broker_service.read_from_queue(action1, topic_group, topic_output)
        broker_service.read_topic_from_splash(action1);
        time.sleep(1)

        #produce
        message = {}
        i=0
        while i < self.sample_size:
            message['index'] = i
            message['text'] = 'test'
            # message['date'] =  strftime("%Y-%m-%d %H:%M:%S", gmtime())
            message['splash_url_path'] = "/render.json?png=1&html=1&url=http://www.hyperiongray.com"
                #"splash_url_path" : "/render.json?png=1&html=1&url=http://www.hyperiongray.com",

            # broker_service.post_to_queue(message, topic_input, topic_output)
            broker_service.add_message_to_splash(message)
            print 'sending: ' + str(i)
            i = i +1

        time.sleep(5)
        print "Finish all"
        print ('Samples produced: ' + str(self.sample_size))
        print ('Samples consumed: ' + str(self.counter))
        if self.sample_size == self.counter:
            print 'Test passed'
        else:
            print 'test failed!!!'

        time.sleep(1000000)

if __name__ == "__main__":
    SplashKafkaIntegrationTest()
