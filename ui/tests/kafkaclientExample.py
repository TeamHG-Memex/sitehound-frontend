#!/usr/bin/env python
import threading, logging, time

from kafka.client import KafkaClient
from kafka.consumer import SimpleConsumer
from kafka.producer import SimpleProducer

topic_group = "test-group"
host_port = "9092"
host_name = "localhost"
topic_name = 'test9'


class Producer(threading.Thread):
    daemon = True

    def run(self):
        client = KafkaClient(host_name + ":" + host_port)
        producer = SimpleProducer(client)

        while True:
            producer.send_messages(topic_name, "test")
            producer.send_messages(topic_name, "Hola, mundo!")
            time.sleep(1)


class Consumer(threading.Thread):
    daemon = True

    def run(self):
        client = KafkaClient(host_name + ":" + host_port)
        consumer = SimpleConsumer(client, topic_group, topic_name)

        for message in consumer:
            print(message)

def main():
    threads = [
        Producer(),
        Consumer()
    ]

    for t in threads:
        t.start()

    time.sleep(5)

if __name__ == "__main__":
    logging.basicConfig(
        format='%(asctime)s.%(msecs)s:%(name)s:%(thread)d:%(levelname)s:%(process)d:%(message)s',
        level=logging.INFO
        )
    main()
