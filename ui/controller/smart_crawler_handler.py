import json

from flask import Response, request
from flask_login import login_required

from controller.InvalidException import InvalidUsage
from service.smart_crawler_service import start_smart_crawl_job
from ui import app


# triggers the schedule_spider_searchengine
@app.route("/api/workspace/<workspace_id>/smart-crawl", methods=['POST'])
@login_required
@app.errorhandler(InvalidUsage)
def smart_crawl_publication_api(workspace_id):
    try:
        num_to_fetch = request.json['nResults']
        broadness = request.json['broadness']
        job_id = start_smart_crawl_job(workspace_id,
                                       num_to_fetch=int(num_to_fetch),
                                       broadness=broadness)

        if job_id is None:
            return Response(json.dumps("{errorMessage: Job Failed to start, error: 2002}"), mimetype="application/json")


        res = {}
        res['jobId'] = job_id
        return Response(json.dumps({"jobId": job_id}), mimetype="application/json")

    except NameError, e:
        raise InvalidUsage(str(e), status_code=409)

