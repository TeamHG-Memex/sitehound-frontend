import json

from flask_login import login_required
from ui import app, Singleton
from flask import render_template, Response, request
from service.scraping_service import scraping_publication


@app.route("/scraping", methods = ["GET"])
@login_required
def get_scraping_page():
    return render_template('scraping.html')


# triggers the scraping
@app.route("/api/scraping", methods=['POST'])
@login_required
def scraping_publication_api():
    post = request.json
    job_id = scraping_publication(post['url'])
    if job_id is None:
        return Response(json.dumps("{errorMessage: Not url were provided, error: 2002}"), mimetype="application/json")
    else:
        return Response(json.dumps("{jobId: " + str(job_id) + "}"), mimetype="application/json")