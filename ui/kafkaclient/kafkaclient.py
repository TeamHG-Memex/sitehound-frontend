#!/usr/bin/env python
import threading
import time
import traceback

from kafka import KafkaConsumer
from kafka import KafkaProducer
from kafka.client import KafkaClient
from kafka.common import OffsetOutOfRangeError
from kafka.producer import SimpleProducer


class KafkaConnector(object):

    def __init__(self, host_name, host_port):
        self.client = KafkaClient(bootstrap_servers=host_name + ":" + host_port, receive_buffer_bytes=8*1024*1024)
        self.producer = KafkaProducer(bootstrap_servers=host_name + ":" + host_port, receive_buffer_bytes=8*1024*1024)

    def create_topic(self, topic_name):
        topics = self.client.cluster.topics()
        if topic_name not in topics:
            self.client.add_topic(topic_name)

    def send_message(self, topic_name, message):
        # self.producer.send_messages(topic_name, message)
        self.producer.send(topic_name, message)

    def register_consumer(self, callback, parse_json, topic_group, topic_name):
        consumer = KafkaConsumer(topic_name)
        consumer_thread = ConsumerThread(consumer, callback, parse_json)
        print "Starting new subscriber for topic " + topic_name + ' with group ' + topic_group
        consumer_thread.start()


class ConsumerThread(threading.Thread):
    daemon = True

    def __init__(self, consumer, callback, parse_json):
        super(ConsumerThread, self).__init__()
        self.consumer = consumer

        #seeing if this helpss...
        # self.consumer.seek(0, 2)

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
                        traceback.print_exc()
                        continue
                    try:
                        self.callback(payload)
                    except:
                        print "****Warning: executing callback: ****"
                        traceback.print_exc()
            except OffsetOutOfRangeError: # related to https://github.com/mumrah/kafka-python/issues/263
                traceback.print_exc()
                print 'WARNING: That offset no longer exists, resuming from the tail of the queue'
                self.consumer.seek(0,2)
            except: # related to https://github.com/mumrah/kafka-python/issues/263
                traceback.print_exc()
                print 'WARNING: That offset no longer exists, resuming from the tail of the queue'
                self.consumer.seek(0,2)

            print('one sec please')
            time.sleep(1)
