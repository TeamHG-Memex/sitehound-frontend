#!/usr/bin/env python
import threading, logging, time
import traceback

from kafka.client import KafkaClient
from kafka.common import OffsetOutOfRangeError
from kafka.consumer import SimpleConsumer
from kafka.producer import SimpleProducer

class KafkaConnector(object):

    def __init__(self, host_name, host_port):
        self.client = KafkaClient(host_name + ":" + host_port)
        self.producer = SimpleProducer(self.client)

    def create_topic(self, topic_name):
        topic_exists = self.client.has_metadata_for_topic(topic_name)
        if not topic_exists:
            self.client.ensure_topic_exists(topic_name)

    def send_message(self, topic_name, message):
        self.producer.send_messages(topic_name, message)

    def register_consumer(self, callback, parse_json, topic_group, topic_name):
        consumer = SimpleConsumer(self.client, topic_group, topic_name, max_buffer_size=None)
        consumer_thread = ConsumerThread(consumer, callback, parse_json)
        print "Starting new subscriber for topic " + topic_name + ' with group ' + topic_group
        consumer_thread.start()

class ConsumerThread(threading.Thread):
    daemon = True

    def __init__(self, consumer, callback, parse_json):
        super(ConsumerThread, self).__init__()
        self.consumer = consumer

        #seeing if this helpss...
        self.consumer.seek(0, 2)

        self.callback = callback
        self.parse_json = parse_json

    def run(self):
        while True: # keep it polling as a daemon
            try:
                for message in self.consumer: # this is a non-blocking queue inside
                    try:
                        # print(message)
                        payload = self.parse_json(message)
                    except:
                        print "****Warning: parsing message: ****"
                        #print(message)
                        traceback.print_exc()
                        continue
                    try:
                        self.callback(payload)
                    except:
                        logging.info("****Warning: executing callback: ****")
                        #print(message)
                        traceback.print_exc()
            except OffsetOutOfRangeError: # related to https://github.com/mumrah/kafka-python/issues/263
                traceback.print_exc()
                logging.info('WARNING: That offset no longer exists, resuming from the tail of the queue')
                self.consumer.seek(0,2)
            except: # related to https://github.com/mumrah/kafka-python/issues/263
                traceback.print_exc()
                logging.info('WARNING: That offset no longer exists, resuming from the tail of the queue')
                self.consumer.seek(0,2)

            logging.info('one sec please')
            time.sleep(1)
