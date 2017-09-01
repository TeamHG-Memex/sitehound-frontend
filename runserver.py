import logging
import optparse
import uuid
from flask_mongoengine import MongoEngine
from flask_security import Security, MongoEngineUserDatastore, UserMixin, RoleMixin, login_required, utils
from dao.mongo_instance import MongoInstance
from es_repository.ElasticsearchClient import ElasticsearchClient
from ui import app
from ui.singleton import Singleton

# controllers
from ui.controller import templates_handler
from ui.controller import workspace_handler
from ui.controller import seeds_handler
from ui.controller import seed_url_handler
from ui.controller import broad_crawl_handler
from ui.controller import broad_crawl_results_handler
from ui.controller import broad_crawl_results_summary_handler
from ui.controller import scraping_handler
from ui.controller import deepcrawl_handler
from ui.dao import mongo_instance
from ui.service import seed_url_service
from ui.controller import job_handler
from ui.controller import screenshot_handler
from ui.controller import user_handler
from ui.controller import event_handler
from ui.controller import progress_handler
from ui.controller import user_defined_categories_handler
from ui.controller import label_user_defined_categories_handler
from ui.controller import domain_handler

# services
from brokers.broker_service import BrokerService

# from flask import Flask
from ui.singleton import Singleton

LOGGING_LEVELS = {'critical': logging.CRITICAL,
                  'error': logging.ERROR,
                  'warning': logging.WARNING,
                  'info': logging.INFO,
                  'debug': logging.DEBUG}

if __name__ == "__main__":

    # usage: $ python runserver.py --logging-level=debug --logging-file=debug.log
    parser = optparse.OptionParser()
    parser.add_option('-l', '--logging-level', help='Logging level')
    parser.add_option('-f', '--logging-file', help='Logging file name')
    (options, args) = parser.parse_args()
    logging_level = LOGGING_LEVELS.get(options.logging_level, logging.INFO)
    logging.basicConfig(level=logging_level, filename=options.logging_file,
                        format='%(asctime)s %(levelname)s: %(message)s',
                        datefmt='%Y-%m-%d %H:%M:%S')

    app_instance = str(uuid.uuid1())
    instance = Singleton.getInstance()
    instance.app_instance = app_instance
    instance.mongo_instance = MongoInstance(app.config['MONGO_HOST_NAME'], app.config['MONGO_HOST_PORT'])
    instance.broker_service = BrokerService(app_instance, app.config['KAFKA_HOST_NAME'], app.config['KAFKA_HOST_PORT'])
    instance.es_client = ElasticsearchClient(app)
    instance.broker_service.init_subscribers()

    # Create database connection object
    app.config['MONGODB_HOST'] = app.config['MONGO_HOST_NAME']
    app.config['MONGODB_PORT'] = app.config['MONGO_HOST_PORT']
    app.config['MONGODB_DB'] = 'MemexHack'
    db = MongoEngine(app)


    class Role(db.Document, RoleMixin):
        name = db.StringField(max_length=80, unique=True)
        description = db.StringField(max_length=255)

    class User(db.Document, UserMixin):
        email = db.EmailField(max_length=255, unique=True)
        password = db.StringField(max_length=255)
        active = db.BooleanField(default=False)
        # confirmed_at = db.DateTimeField()
        roles = db.ListField(db.ReferenceField(Role), default=[])

        last_login_at = db.DateTimeField()
        current_login_at = db.DateTimeField()
        last_login_ip = db.StringField(max_length=36)
        current_login_ip = db.StringField(max_length=36)
        login_count = db.IntField(default=0)

    # Setup Flask-Security

    user_datastore = MongoEngineUserDatastore(db, User, Role)
    instance.user_datastore = user_datastore

    app.config['SECURITY_CONFIRMABLE'] = False
    app.config['SECURITY_REGISTERABLE'] = False
    app.config['SECURITY_RECOVERABLE'] = False
    app.config['SECURITY_TRACKABLE'] = True
    app.config['SECURITY_CHANGEABLE'] = True

    app.config['SECURITY_SEND_REGISTER_EMAIL'] = False
    app.config['SECURITY_SEND_PASSWORD_CHANGE_EMAIL'] = False
    app.config['SECURITY_SEND_PASSWORD_RESET_NOTICE_EMAIL'] = False
    app.config['SECURITY_TOKEN_AUTHENTICATION_HEADER'] = 'Authentication-Token'

    app.config['SECURITY_REGISTER_URL'] = '/adminregister'




    app.config['SECRET_KEY'] = 'super-secret'

    # Set config values for Flask-Security.
    # We're using PBKDF2 with salt.
    app.config['SECURITY_PASSWORD_HASH'] = 'pbkdf2_sha512'
    # Replace this with your own salt.
    app.config['SECURITY_PASSWORD_SALT'] = 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx'

    app.config['SECURITY_MSG_INVALID_PASSWORD'] = ('Your username and password do not match our records', 'error')

    security = Security(app, user_datastore)

    # Create a role to test with
    @app.before_first_request
    def set_up():
        try:
            user_datastore.create_role(name='admin', description='Site administrator')
            encrypted_password = utils.encrypt_password('changeme!')
            user_datastore.create_user(email='admin@hyperiongray.com', password=encrypted_password, roles=["admin"], active=True)
            logging.info("roles and user were added")
        except:
            logging.info("already set up")

        logging.info('instance : ' + app_instance + ' up & running.')
    if app.config['DEBUG']:
        app.debug = False

    logging.info("About to start!")
    app.run('0.0.0.0', port=5081, threaded=True)

