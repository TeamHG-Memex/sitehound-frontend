import logging

__author__ = 'tomas'
# from dao.mongo_instance import MongoInstance
from bson import ObjectId
from ui.singleton import Singleton
from zlib import adler32
# #################### Service #####################


def get_keywords(workspace_id):
    return dao_get_keywords(workspace_id)


def update_keyword(workspace_id, word, score):
    return dao_update_keywords(workspace_id, word, score)


def delete_keyword(workspace_id, hash):
    dao_delete_keywords(workspace_id, hash)

#####################  DAO  #####################


def dao_get_keywords(workspace_id):

    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    if ws is None \
            or "words" not in ws \
            or ws["words"] is None:
        return []
    else:
        return ws["words"]


def dao_get_keywords_by_relevance(workspace_id):

    keywords = {}
    included = []
    excluded = []
    related = []

    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    if ws is None \
            or "words" not in ws \
            or ws["words"] is None:
        logging.info("no keywords defined")
    else:
        for key, value in ws["words"].iteritems():
            if value['score'] > 3:
                included.append(value['word'])
            elif value['score'] < 3:
                excluded.append(value['word'])
            else:
                related.append(value['word'])

    if len(included) == 0:
        raise NameError('No keywords where defined.')

    keywords['included'] = included
    keywords['excluded'] = excluded
    keywords['related'] = related
    return keywords

def dao_update_keywords(workspace_id, word, score):

    # hash = hashlib.sha224(word.encode('utf_8')).hexdigest()
    hash = str(adler32(word.encode('utf_8')) & 0xffffffff)
    scoredWord = {"word": word, "score": score}
    operation = {'$set': {"words." + hash: scoredWord}}

    # ws = Singleton.getInstance().mongo_instance.get_current_workspace()
    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    if ws == None:
        Singleton.getInstance().mongo_instance.workspace_collection.upsert({"_id": "_default"}, operation)
    else:
        Singleton.getInstance().mongo_instance.workspace_collection.update({"_id": ObjectId(ws["_id"])}, operation)

    return hash


def dao_delete_keywords(workspace_id, hash):
    operation = {'$unset': {"words." + hash: ""}}
    # ws = Singleton.getInstance().mongo_instance.get_current_workspace()
    ws = Singleton.getInstance().mongo_instance.get_workspace_by_id(workspace_id)
    if ws == None:
        Singleton.getInstance().mongo_instance.workspace_collection.update({"_id": "_default"}, operation)
    else:
        Singleton.getInstance().mongo_instance.workspace_collection.update({"_id": ObjectId(ws["_id"])}, operation)
