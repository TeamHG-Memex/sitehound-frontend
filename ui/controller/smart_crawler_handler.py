import json

from flask import Response, request
from flask_login import login_required

from controller.InvalidException import InvalidUsage
from service.smart_crawler_service import start_smart_crawl_job, get_smart_crawler_results#, get_smart_crawler_progress
from ui import app
from utils.json_encoder import JSONEncoder

@app.route("/api/workspace/<workspace_id>/smart-crawler", methods=['POST'])
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


@app.route("/api/workspace/<workspace_id>/smart-crawler/<job_id>/results", methods=["GET"])
@login_required
def api_get_smart_crawler_results(workspace_id, job_id):
    search_query = {}
    if request.args.get('lastId') is not None:
        search_query["last_id"] = request.args.get('lastId')

    # if request.args.get('job-id') is not None:
    # search_query["job_id"] = request.args.get('jobId')

    search_query["job_id"] = job_id

    if request.args.get('search') is not None:
        search_query["search_text"] = request.args.get('search')

    page_size = 4
    docs = get_smart_crawler_results(workspace_id, page_size, search_query)
    return Response(JSONEncoder().encode(docs), mimetype="application/json")

