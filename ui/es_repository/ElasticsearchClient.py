import logging
import json
import requests
from elasticsearch import Elasticsearch

from ui import app, Singleton
from datetime import datetime
import urllib


__author__ = 'tomas'


class ElasticsearchClient(object):

    def __init__(self, app):

        self.es = Elasticsearch([{"host": app.config['ES_HOST'], "port": str(app.config['ES_PORT'])}])
        self.index_name = app.config['ES_INDEX_NAME']
        self.doc_type = app.config['ES_DOC_TYPE']

    def get_open_crawled_index_results(self, url, _source_exclude=["result.crawlResultDto.image", "result.crawlResultDto.html"]):

        res = self.es.get(index=self.index_name, doc_type=self.doc_type, id=url,
                          _source=["result"],
                          _source_exclude=_source_exclude)

        return res['_source']['result']

    def get_screenshoot(self, url):
        try:
            res = self.es.get(index=self.index_name, doc_type=self.doc_type, id=url, _source=["result.crawlResultDto.image"])
            return res['_source']['result']['crawlResultDto']['image']['content']
        except:
            logging.info(url)

    def get_modeler_model(self, workspace_id):
        try:
            res = self.es.get(index="modeler", doc_type="model", id=workspace_id, _source=[])
            return res['_source']['model']
        except:
            logging.info(workspace_id)
