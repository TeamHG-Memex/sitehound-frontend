from ui.singleton import Singleton
import time
import json

__author__ = 'tomas'


def publish_to_events_queue(workspace_id, event_type, action, arguments):

    message = {
        'workspaceId': workspace_id,
        'timestamp': time.time(),
        'event': event_type,
        'action': action,
        'arguments': json.dumps(arguments)
    }
    Singleton.getInstance().broker_service.add_message_to_events(message)
