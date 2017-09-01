from flask import Response, request
from flask_login import login_required
from ui import app
from utils.json_encoder import JSONEncoder
from service.domain_service import get_deepcrawl_progress, get_deep_crawl_domains_by_domain_name


@app.route("/api/workspace/<workspace_id>/deepcrawl-domains/<job_id>", methods=["GET"])
@login_required
def api_get_deep_crawl_domains(workspace_id, job_id):
    docs = get_deepcrawl_progress(workspace_id, job_id)
    return Response(JSONEncoder().encode(docs), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/deepcrawl-domains/<job_id>/domain-name/<domain_name>", methods=["GET"])
@login_required
def api_get_deep_crawl_domains_by_domain_name(workspace_id, job_id, domain_name):
    limit = 4
    last_id = request.args.get('lastId')
    docs = get_deep_crawl_domains_by_domain_name(workspace_id, job_id, domain_name, limit, last_id)
    return Response(JSONEncoder().encode(docs), mimetype="application/json")
