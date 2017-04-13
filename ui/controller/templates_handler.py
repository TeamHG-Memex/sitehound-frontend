import flask_security
from flask_login import login_required

__author__ = 'tomas'

from ui import app
from flask import render_template


@app.route("/", methods=["GET"])
@login_required
def get_home():
    return render_template("index.html",
                           current_user=flask_security.core.current_user._data.email,
                           is_admin=len(flask_security.core.current_user._data.roles)==1)


@app.route("/index", methods=['GET'])
@login_required
# @requires_auth
def get_index_view():
    return render_template("index.html")


@app.route("/partials", methods=["GET"])
def get_partials_relative_path(real_path):
    try:
        return real_path + '/partials'
    except IndexError:
        return None


@app.route("/images", methods=["GET"])
def get_screenshot_relative_path(real_path):
    try:
        return real_path + '/images'
    except IndexError:
        return None
