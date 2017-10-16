from bson import ObjectId

from ui.singleton import Singleton


def get_trainer_progress(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_workspace_collection()
    cursor = collection.find({'_id': ObjectId(workspace_id)}, {"dd_trainer.progress": 1, "dd_trainer.percentage_done": 1})
    docs = list(cursor)
    status = {}
    for doc in docs:
        if "dd_trainer" in doc:
            if "progress" in doc["dd_trainer"]:
                status["progress"]= doc["dd_trainer"]["progress"]
            if "percentage_done" in doc["dd_trainer"]:
                status["percentage_done"] = doc["dd_trainer"]["percentage_done"]
    return status
