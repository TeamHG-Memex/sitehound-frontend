=============
Sitehound API
=============

This is the API for Kafka messages. It is used for communication between
Sitehound, hh-deep-deep and hh-page-classifier.

.. contents::


DD Deepcrawler
==============

This is for deep crawling.

Input
-----

Topic: ``dd-deepcrawler-input``::

    {
        "id": "crawl id",
        "workspace_id": "workspace id",
        "page_limit": 10000000,
        "urls": [
            "https://example1.com",
            "https://example2.com",
            "https://example3.com"
        ],
        "login_credentials": [
            {
                "id":"75ea86a9d11ff300022f", // the id of the credentials
                "domain":"example1.com",
                "url": "http://example1.com/login", // login page as provided
                "key_values": {"txtUser":"user1234", "txtPassword":"12345678"} // identifiers of the fields with the value entered by the user.
            }
        ]
    }

where:

- id: (String) The id of the job,
- workspace_id: (String) The id of the workspace,
- urls: (List<String>) All URLs selected for deepcrawl,
- page_limit: (Integer) (optional) (defaulting to 10M items). The maximum number of pages to fetch
- login_credentials: (List) (optional) Login credentials already existing in this workspace.


Progress
--------

Topic: ``dd-deepcrawler-output-progress``::

    {
        "id": "some crawl id",
        "progress": {
            "status": "running",
            "pages_fetched": 1468,
            "rpm": 24000,
            "domains": [
                {
                    "url": "http://example1.com",
                    "domain": "example1.com",
                    "status": "running",
                    "pages_fetched": 1234,
                    "rpm": 12000
                },
                {
                    "url": "http://example2.com",
                    "domain": "example2.com",
                    "status": "finished",
                    "pages_fetched": 234,
                    "rpm": 12000
                },
                {
                    "url": "http://example3.com",
                    "domain": "example3.com",
                    "status": "failed",
                    "pages_fetched": 0,
                    "rpm": 0
                },
                {
                    "url": "http://example4.com",
                    "domain": "example4.com",
                    "status": "running",
                    "pages_fetched": 0,
                    "rpm": 0
                },
             ]
        }
    }

Output
------

Topic: ``dd-deepcrawler-output-pages``::

    {
        "id": "some crawl id",
        "page_samples": [
            {"url": "http://example.com/pag1", "domain": "example.com"},
            {"url": "http://example.com/pag2", "domain": "example.com"}
        ]
    }


Login workflow
==============

Assumptions for the first iteration:

1) The login feature will be implemented only on the deep and broad crawl results (i.e. not on the trainer, the seeds or seeds-url)
2) The login will be only on-(dd's)-demand. (i.e the user won't be able to load some url+usr+pwd as seeds or the like)

Basic Flow:

1) While DD is crawling, it would be able to identify sites that requires logging in's for further crawling.
2) DD will report these sites to a ``dd-login-input`` topic.
3) Sitehound-backend will listen to the queue and it will:

    a) take a screenshot of the page (may be useful in case of catcha, so we don't waste time, etc.)
    b) store this message

4) A option will be added on Sitehound to show the users this snapshot, along with the fields to be completed,
   as label + inputs, where each label is one keys from dd-login-input
5) When the user fulfills one message from the step above, the data is stored(wo encryption by now),
   and sent to DD via the ``dd-login-output`` topic.
6) DD receives this message and performs the logging in for that domain.
7) DD will send a notification once the login was successfull or failed to ``dd-login-result``.

dd-login-input
--------------

Topic: ``dd-login-input``. New login form found::

    {
        "workspace_id":"57ea86a9d11ff300054a3519",
        "job_id":"57ea86a9d11ff300054a3519",
        "domain":"example.com",
        "url": "http://example.com/login", // login page
        "keys": ["txtUser", "txtPassword"], // identifiers of the fields required to be completed by the user, whatever it makes sense to use them back by dd
        "screenshot":"57ea86a9d11ff300054a351.....afazzz9" // b64 representation of the bytes of the image. (PNG format)
    }

dd-login-output
---------------

Topic: ``dd-login-output``. Credentials provided by the user and sent for crawling::

    {
        "workspace_id":"57ea86a9d11ff300054a3519",
        "job_id":"57ea86a9d11ff300054a",
        "id":"75ea86a9d11ff300022f", // the id of the credentials
        "domain":"example.com",
        "url": "http://example.com/login", // login page as provided
        "key_values": {"txtUser":"user1234", "txtPassword":"12345678"} // identifiers of the fields with the value entered by the user.
    }


dd-login-result
---------------

Topic: ``dd-login-result``. Credentials result after trying to log in sent from the crawling::

    {
        "id":"75ea86a9d11ff300022f", // the id of the credentials
        "result": "success" | "failed"
    }



DD Modeler
==========

This is for page classifier training.

dd-modeler-input
----------------

Topic: ``dd-modeler-input``. Training page classifier model. All workspace annotations are sent,
html is fetched based on ``html_location`` field::

    {
        "workspace_id": "workspace id",
        "pages": [
            {
                "url": "http://example.com",
                "html_location": "specifies-where-to-get-html",
                "relevant": true
            },
            {
                "url": "http://example.com/1",
                "html_location": "specifies-where-to-get-html",
                "relevant": false
            },
            {
                "url": "http://example.com/2",
                "html_location": "specifies-where-to-get-html",
                "relevant": null
            }
        ]
    }

dd-modeler-progress
-------------------

Topic: ``dd-modeler-progress``. Progress report when training the model::

    {
        "workspace_id": "workspace id",
        "percentage_done": 98.123
    }

dd-modeler-output
-----------------

Topic: ``dd-modeler-output``. Result of training the model::

    {
        "workspace_id": "workspace id",
        "quality": "json data",
        "model": "b64-encoded page classifier model"
    }

JSON data format for the ``quality`` field::

    {
        "main_score": 89.2,
        "n_labeled": 20,
        "n_positive": 10,
        "advice": "advice for improving the model",
        "description": ["item1", "item2"],
        "weights": {"pos": ..., "neg": ..., "pos_remaining": 0, "neg_remaining": 0},
        "tooltips": {"ROC AUC": "some description"}
    }



DD Trainer
==========

This is for training deep-deep link classifier model by crawling.

dd-trainer-input
----------------

Topic: ``dd-trainer-input``.

This message is sent by the page classifier (DD Modeller).
Start the crawl::

    {
        "workspace_id": "workspace id",
        "page_model": "b64-encoded page classifier",
        "urls": ["http://example.com", "http://example.com/2"],
    }

dd-trainer-output-pages
-----------------------

Topic ``dd-trainer-output-pages``.

Sample of crawled pages::

    {
        "workspace_id": "workspace id",
        "page_sample": [
            {"url": "http://example1.com", "domain": example1.com", "score": 80},
            {"url": "http://example2.com", "domain": example2.com", "score": 90}
        ]
    }



DD Crawler
==========

This is the smart crawler.


dd-crawler-input
----------------

Topic ``dd-crawler-input``. Start the crawl::

    {
        "id": "crawl id",
        "workspace_id": "workspace id",
        "page_model": "b64-encoded page classifier",
        "urls": ["http://example.com", "http://example.com/2"],
        "broadness": "BROAD" // Valid codes are ["N10", "N100", "N1000", "N10000", "BROAD"],
        "page_limit": 100
    }

``page_limit`` is optional (defaults to 10000000).

dd-crawler-output-*
-------------------

Crawler output.

Topic ``dd-crawler-output-pages``: exactly the same as ``dd-trainer-output-pages``.

Topic: ``dd-trainer-output-progress``.

Progress update (to be displayed in the UI, probably more fields will be added)::

    {
        "id": "crawl id",
        "workspace_id": "workspace id",
        "progress": "Crawled N pages and M domains, average reward is 0.122",
        "percentage_done": 98.123
    }
