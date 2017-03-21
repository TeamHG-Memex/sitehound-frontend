import base64

from flask_login import login_required


from service.screenshot_service import get_screenshot
from ui import app
from flask import Response
__author__ = 'tomas'

# crawl_type = broadcrawl | keywords


@app.route("/api/workspace/<workspace_id>/<crawl_type>/screenshot/<id>", methods=["GET"])
@login_required
def get_screenshot_api(workspace_id, crawl_type, id):
    # res = get_screenshot(crawl_type, id)
    # screenshot = res[0]["snapshot"]["png"]
    screenshot = get_screenshot(crawl_type, id)

    return Response(base64.b64decode(screenshot), mimetype="image/png")

    # res = get_screenshot(crawl_type, id)
    #
    #
    # es_repo = ElasticsearchIndexRepository()
    #
    # es_repo.get_screenshoot()
    # res = get_screenshot(crawl_type, id)
    # screenshot = res[0]["snapshot"]["png"]
    #
    # return Response(base64.b64decode(screenshot), mimetype="image/png")

