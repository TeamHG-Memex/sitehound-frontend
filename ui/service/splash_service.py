import json
from ui import Singleton

__author__ = 'tomas'
'''

def splash_publication(url, workspace, collection):
    message = {
        # "splash_url_path" : "/render.json?png=1&html=1&url=" + url,
        "splash_url_path": "/render.json?png=1&url=" + url,
        'url': url,
        'collection': collection,
        'workspace': workspace
    }
    print 'publishing to splash message: ' + str(message)
    Singleton.getInstance().broker_service.add_message_to_splash(message)
    return 56789

def register_splash_subscriber():

    print 'registering register_splash_subscriber'

    # Callback
    # def action1(args):
    #     print("splash callback run with: " + str(args))

    def save_urls(message):
        print("splash callback run with: " + str(message["url"]))

        print("from splash-output: " + "url:" + str(message["url"])
                                     + "workspace:" + str(message["workspace"])
                                     + "collection:" + str(message["collection"])
        )

        # persist the message
        dao_snapshot(message['url'], message)

    Singleton.getInstance().broker_service.read_topic_from_splash(callback=save_urls)


########## DAO ################
def dao_snapshot(url, obj):
    print "saving snapshot for splash_service: " + url

    update_object = {}

    if 'snapshot' in obj and obj['snapshot'] is not None:
        update_object['snapshot'] = json.loads(obj['snapshot'])

    else:
        print "WARNING: NO SNAPSHOT PROVIDED FOR: " + url
        return

    if 'collection' in obj and obj['collection'] is not None:
        collectionName = obj['collection']
        if collectionName == 'googlecrawler':
            if 'workspace' in obj and obj['workspace'] is not None:
                workspace = obj['workspace']
                collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection_for_workspace(workspace)
            else:
                print 'WARNING: splash_service: Workspace not provided! Using current as fallback..'
                print (str(obj))
                collection = Singleton.getInstance().mongo_instance.get_current_seed_urls_collection()
        elif collectionName == 'broadcrawler':
            if 'workspace' in obj and obj['workspace'] is not None:
                workspace = obj['workspace']
                collection = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection_for_workspace(workspace)
            else:
                print 'WARNING: splash_service: Workspace not provided! Using current as fallback..'
                print (str(obj))
                workspace = None
                collection = Singleton.getInstance().mongo_instance.get_broad_crawler_output_collection()
        else:
            print 'WARNING: Invalid collection provided: ' + collectionName

        collection.update({"url": obj['url']}, {'$set': update_object}, True)
        print "saved snapshot for: " + url + " in crawl-collection: " + collectionName + " in workspace: " + str(workspace)
'''