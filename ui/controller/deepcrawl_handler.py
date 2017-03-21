import logging
from flask_login import login_required

from flask import render_template, Response, request
import json
import requests
from ui import app, Singleton

__author__ = 'punk'



@app.route("/api/deep-crawl/config", methods=["GET"])
@login_required
def deep_get_config():
    return Response(json.dumps({'ARACHNADO_HOST_NAME': app.config['ARACHNADO_HOST_NAME'], 'ARACHNADO_HOST_PORT': app.config['ARACHNADO_HOST_PORT']}), mimetype="application/json")




@app.route("/api/deep-crawl", methods=["POST"])
@login_required
def deep_crawl_url():

    # url_arachnado = 'http://localhost:8888/crawler/start'
    url_arachnado = 'http://' + app.config['ARACHNADO_HOST_NAME'] + ":" + app.config['ARACHNADO_HOST_PORT'] + '/crawler/start'
    to_deepcrawl = request.json["domain"]
    logging.info("sending to arachnado... %s" % to_deepcrawl)

    data = {"domain": to_deepcrawl}
    headers = {'Content-type': 'application/json'}

    r = requests.post(url_arachnado, data = json.dumps(data), headers= headers)
    return Response(json.dumps({"requests_response": r.text , 'ARACHNADO_HOST_NAME': app.config['ARACHNADO_HOST_NAME'] , 'ARACHNADO_HOST_PORT': app.config['ARACHNADO_HOST_PORT']}), mimetype="application/json")
