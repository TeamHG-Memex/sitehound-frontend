__author__ = 'tomas'

from kafkaclient import KafkaConnector
from time import gmtime, strftime, time

if __name__ == "__main__":

    host_port = "9092"
    host_name = "localhost"
    topic_group = "test-group"
    topic_name = 'testa4'
    message = 'python integration test ' + strftime("%Y-%m-%d %H:%M:%S", gmtime())


    kafkaclient = KafkaConnector(host_name, host_port)

    # putIfAbsent topic
    # kafkaclient.create_topic(topic_name)

    # produce
    kafkaclient.send_message(topic_name, message)
    print "Finish sending %s" % (message)

    # consume
    kafkaclient.register_consumer("function-todo", topic_group, topic_name)
    print "Finish registering "

    time.sleep(60)
    print "Finish all"
