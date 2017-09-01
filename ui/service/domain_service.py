from ui import Singleton
from bson import ObjectId
import pymongo
import tldextract
from sets import Set


def get_domains_by_job_id(workspace_id, job_id):

    collection = Singleton.getInstance().mongo_instance.get_deep_crawler_domains_collection()

    and_source_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}
    and_source_conditions.append(workspace_search_object)

    job_search_object = {'jobId': job_id}
    and_source_conditions.append(job_search_object)

    query = {'$and': and_source_conditions}
    cursor = collection.find(query)
    docs = list(cursor)
    return docs


def get_deepcrawl_progress(workspace_id, job_id):
    job_doc = get_job_by_id(job_id)
    domains_detail_docs = get_domains_by_job_id(workspace_id, job_id)

    if "progress" in job_doc:
        progress = job_doc["progress"]
        for domain in progress["domains"]:
            domain_detail = __find_domain_detail_by_domain(domain["domain"], domains_detail_docs)
            domain["domain_detail"] = domain_detail

    return job_doc


def get_deep_crawl_domains_by_domain_name(workspace_id, job_id, domain_name, limit, last_id):

    collection = Singleton.getInstance().mongo_instance.get_deep_crawler_collection()

    and_source_conditions = []

    workspace_search_object = {'workspaceId': workspace_id}
    and_source_conditions.append(workspace_search_object)

    job_search_object = {'jobId': job_id}
    and_source_conditions.append(job_search_object)

    domain_name_search_object = {'domain': domain_name}
    and_source_conditions.append(domain_name_search_object)

    page_search_object = {}
    if last_id is not None:
        page_search_object = {"_id": {"$gt": ObjectId(last_id)}}
    and_source_conditions.append(page_search_object)

    query = {'$and': and_source_conditions}
    cursor = collection.find(query) \
            .sort('_id', pymongo.ASCENDING) \
            .limit(limit)

    docs = list(cursor)
    return docs


def get_job_by_id(job_id):
    collection = Singleton.getInstance().mongo_instance.get_crawl_job_collection()

    and_source_conditions = []

    job_search_object = {'_id': ObjectId(job_id)}
    and_source_conditions.append(job_search_object)

    query = {'$and': and_source_conditions}
    cursor = collection.find(query)
    docs = list(cursor)
    return docs[0]


def __find_domain_detail_by_domain(domain, domains_detail_docs):
    for domain_detail in domains_detail_docs:
        if domain_detail["domain"] == domain:
            return domain_detail

    return None


def extract_domains_from_urls(urls):
    set = Set()
    for url in urls:
        set.add(get_domain(url))

    domains = []
    for e in set:
        domains.append(e)

    return domains


def get_domain(url):
    parsed = tldextract.extract(url)
    domain = parsed.registered_domain
    if not domain:  # e.g. localhost which is used in tests
        domain = '.'.join(filter(None, [parsed.domain, parsed.suffix]))
    return domain.lower()