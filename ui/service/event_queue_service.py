from ui.singleton import Singleton


__author__ = 'tomas'


def publish_to_events_queue(workspace_id, event_type, action):

    message = {
        'event': event_type,
        'action': action,
        # 'data': po,

        'metadata': Singleton.getInstance().broker_service.get_metadata(workspace_id)
    }
    Singleton.getInstance().broker_service.add_message_to_events(message)
