import os

from flask import Flask
from ui.singleton import Singleton

app = Flask(__name__)
app.config.from_object('settings')
