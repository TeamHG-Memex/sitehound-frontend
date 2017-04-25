import pymongo
from bson import ObjectId

from ui.singleton import Singleton



def get_seeds_urls_by_workspace_dao(workspace_id, sources, relevances, categories, udcs, last_id):

    # collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    # return list(collection.find({'workspaceId': workspace_id}))

# def get_seeds_urls_by_source_dao(workspace_id, source, relevances, categories, udcs, last_id):

    and_condition_list = []

    #sources
    if len(sources) > 0:
        source_search_conditions = []
        for source in sources:
            if source == "searchengine":
                source_search_conditions.append({'crawlEntityType': "BING"})
                source_search_conditions.append({'crawlEntityType': "GOOGLE"})
            elif source == "twitter":
                source_search_conditions.append({'crawlEntityType': "TWITTER"})
            elif source == "tor":
                source_search_conditions.append({'crawlEntityType': "TOR"})
            elif source == "imported":
                source_search_conditions.append({'crawlEntityType': "MANUAL"})
            elif source == "deepdeep":
                source_search_conditions.append({'crawlEntityType': "DD"})
            else:
                print("no valid source was provided:" + source)

        source_search_object = {'$or': source_search_conditions}
        and_condition_list.append(source_search_object)


    #relevances
    if len(relevances) > 0:
        relevances_search_conditions = []
        for relevance in relevances:
            relevances_search_conditions.append({'relevant': relevance})

        relevances_search_object = {'$or': relevances_search_conditions}
        and_condition_list.append(relevances_search_object)


    #page_types
    if len(categories) > 0:
        categories_search_conditions = []
        for category in categories:
            categories_search_conditions.append({'categories': category})

        categories_search_object = {'$or': categories_search_conditions}
        and_condition_list.append(categories_search_object)

    #udcs
    if len(udcs) > 0:
        udcs_search_conditions = []
        for udc in udcs:
            udcs_search_conditions.append({'udc': udc.lower()})

        udcs_search_object = {'$or': udcs_search_conditions}
        and_condition_list.append(udcs_search_object)

    page_search_object = {}
    if last_id is not None:
        # page_search_object = {'_id' > input_search_query['last_id']}
        page_search_object = {"_id": {"$gt": ObjectId(last_id)}}
        and_condition_list.append(page_search_object)

    deleted_search_object = {'deleted': None}
    and_condition_list.append(deleted_search_object)

    workspace_search_object = {'workspaceId': workspace_id}
    and_condition_list.append(workspace_search_object)

    # field_names_to_include = ['_id', 'host', 'desc', 'crawlEntityType', 'url', 'words', 'urlDesc', 'categories', 'language', 'relevant']
    # field_names_to_include = ['_id', 'crawlEntityType', 'url', 'relevant', 'words']
    # field_names_to_include = ['_id', 'crawlEntityType', 'url', 'relevant']
    field_names_to_include = ['_id', 'host', 'desc', 'crawlEntityType', 'url', 'words', 'title', 'language', 'relevant', 'categories', 'udc']

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    res = collection\
        .find({'$and': and_condition_list}, field_names_to_include)\
        .sort('_id', pymongo.ASCENDING)\
        .limit(21)

    docs = list(res)
    return docs


def get_seeds_udcs_by_source_dao(workspace_id, source):

    and_condition_list = []

    source_search_conditions = []
    if source == "searchengine":
        source_search_conditions.append({'crawlEntityType': "BING"})
        source_search_conditions.append({'crawlEntityType': "GOOGLE"})
    elif source == "twitter":
        source_search_conditions.append({'crawlEntityType': "TWITTER"})
    elif source == "tor":
        source_search_conditions.append({'crawlEntityType': "TOR"})
    elif source == "imported":
        source_search_conditions.append({'crawlEntityType': "MANUAL"})
    elif source == "deepdeep":
        source_search_conditions.append({'crawlEntityType': "DD"})
    else:
        print("no valid source was provided:" + source)
    source_search_object = {'$or': source_search_conditions}
    and_condition_list.append(source_search_object)

    deleted_search_object = {'deleted': None}
    and_condition_list.append(deleted_search_object)

    workspace_search_object = {'workspaceId': workspace_id}
    and_condition_list.append(workspace_search_object)

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    res = collection\
        .find({'$and': and_condition_list})\
        .distinct("udc")

    docs = list(res)
    return sorted(docs)


def get_seeds_udcs_by_workspace_dao(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    return list(collection.find({'workspaceId': workspace_id}))


' retrieves only the field url from the docs '


def get_seeds_urls_url(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    res = collection.find({'workspaceId': workspace_id}, {'_id': 0, 'url': 1})
    docs = list(res)
    return docs


def get_seeds_urls_categorized(workspace_id):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    relevant_urls_result = collection.find({'workspaceId': workspace_id, 'relevant': True, 'deleted': {'$exists': False}}, {'_id': 0, 'url': 1})
    relevant_urls = []
    for url_doc in relevant_urls_result:
        if 'url' in url_doc:
            relevant_urls.append(url_doc['url'])

    irrelevant_urls_result = collection.find({'relevant': False, 'deleted': {'$exists': False}}, {'_id': 0, 'url': 1})
    irrelevant_urls = []
    for url_doc in irrelevant_urls_result:
        if 'url' in url_doc:
            irrelevant_urls.append(url_doc['url'])

    return {'relevant': list(relevant_urls), 'irrelevant': list(irrelevant_urls)}






################ SAVE_CUSTOMIZE_SEEDS #########################

# def dao_insert_url(url, is_relevant):
#     extracted = extract_tld(url)
#     host = extracted.domain + '.' + extracted.suffix
#     update_object = {"host": host, "relevant": is_relevant}
#
#     collection = Singleton.getInstance().mongo_instance.get_current_seed_urls_collection()
#     collection.update({"url": url}, {'$set': update_object}, True)


def dao_update_relevance(url, obj):
    update_object = {}
    update_object['relevant'] = obj['relevant']
    collection = Singleton.getInstance().mongo_instance.get_current_seed_urls_collection()
    print "setting url %s to %s in collection %s" % (url, str(obj['relevant']), collection)
    collection.update({"url": url}, {'$set': update_object}, True)


def dao_update_relevanceByid(workspace_id, id, relevance, categories, udc):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    update_object= {}
    update_object['relevant'] = relevance
    update_object['categories'] = categories
    update_object['udc'] = udc
    collection.update({"_id": ObjectId(id)}, {'$set': update_object}, True)


def dao_delete_seed_url(workspace_id, id):
    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    update_object= {}
    update_object['deleted'] = True
    collection.update({"_id": ObjectId(id)}, {'$set': update_object}, True)


def dao_reset_results(workspace_id, source):

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()

    source_search_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}

    if source == "searchengine":
        source_search_conditions.append({'crawlEntityType': "BING"})
        source_search_conditions.append({'crawlEntityType': "GOOGLE"})
    elif source == "twitter":
        source_search_conditions.append({'crawlEntityType': "TWITTER"})
    elif source == "tor":
        source_search_conditions.append({'crawlEntityType': "TOR"})
    elif source == "imported":
        source_search_conditions.append({'crawlEntityType': "MANUAL"})
    elif source == "deepdeep":
        source_search_conditions.append({'crawlEntityType': "DD"})
    else:
        print("no valid source was provided:" + source)
        return
    source_search_object = {'$or': source_search_conditions}

    collection.remove({'$and': [workspace_search_object, source_search_object]})


def dao_aggregate_urls(workspace_id):

    collection = Singleton.getInstance().mongo_instance.get_seed_urls_collection()
    source_search_conditions = []
    workspace_search_object = {'workspaceId': workspace_id}
    delete_search_object = {'deleted': {'$exists': False}}
    # 'deleted': {'$exists': False}}
    source_search_conditions.append(workspace_search_object)
    source_search_conditions.append(delete_search_object)

    source_search_object = {'$and': source_search_conditions}

    try:
        res = collection.aggregate([

            # '$group': {'_id': '$crawlEntityType', "count": {"$sum": 1}}
            {'$match': source_search_object},
            {'$group': {'_id': {'crawlEntityType': '$crawlEntityType', 'relevant': '$relevant'}, "count": {"$sum": 1}}}
        ])
    except Exception as e:
        print e

    return res["result"]


