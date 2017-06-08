import json

from flask_login import login_required

from controller.InvalidException import InvalidUsage
from service.broadcrawler_service import start_broad_crawl_job, queue_crawl_hints
from ui import app
from flask import Response, request
import logging
__author__ = 'tomas'


@app.route("/api/workspace/<workspace_id>/broad-crawl", methods=['POST'])
@login_required
@app.errorhandler(InvalidUsage)
def broad_crawl_publication_api(workspace_id):
    try:
        num_to_fetch = request.json['nResults']
        broad_crawler_provider = request.json['crawlProvider']
        broad_crawler_sources = request.json['crawlSources']

        logging.info("Going to fetch %s urls with broad crawl" % str(num_to_fetch))
        job_id = start_broad_crawl_job(workspace_id,
                                       num_to_fetch=int(num_to_fetch),
                                       broad_crawler_provider=broad_crawler_provider,
                                       broad_crawler_sources=broad_crawler_sources,
                                       crawl_type="BROADCRAWL")

        if job_id is None:
            return Response(json.dumps("{errorMessage: No keywords provided, error: 2002}"), mimetype="application/json")

        res = {}
        res['jobId'] = job_id
        return Response(json.dumps({"jobId": job_id}), mimetype="application/json")

    except NameError, e:
        raise InvalidUsage(str(e), status_code=409)


@app.route("/api/workspace/<workspace_id>/broad-crawl-hints", methods=["POST"])
@login_required
def broad_crawler_hint(workspace_id):

    url = request.json["url"]
    queue_crawl_hints(workspace_id, url)
    return Response(json.dumps({}), mimetype="application/json")