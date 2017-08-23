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
        "id": "some crawl id",
        "page_limit": 10000000,
        "urls": [
            "https://example1.com",
            "https://example2.com",
            "https://example3.com"
        ]
    }

where:

- id: (String) The id of the job,
- urls: (List<String>) All URLs selected for deepcrawl,
- page_limit: (Integer) (optional) (defaulting to 10M items). The maximum number of pages to fetch


Progress
--------
Topic: ``dd-deepcrawler-progress``
Message: TBD

Output
------
TBD, but probably do not needed since results would be stored outside Sitehound








------------  **The protocol below needs REVIEW** --------------
================================================================






DD Modeler
==========

This is for page classifier training.

dd-modeler-input
----------------

Topic: ``dd-modeler-input``. Training page classifier model::

    {
        "id": "workspace id",
        "pages": [
            {
                "url": "http://example.com",
                "html": "<h1>hi</h1>",
                "relevant": true
            },
            {
                "url": "http://example.com/1",
                "html": "<h1>hi 1</h1>",
                "relevant": false
            },
            {
                "url": "http://example.com/2",
                "html": "<h1>hi 2</h1>",
                "relevant": null
            }
        ]
    }

dd-modeler-progress
-------------------

Topic: ``dd-modeler-progress``. Progress report when training the model::

    {
        "id": "the same id as in the input",
        "percentage_done": 98.123
    }

dd-modeler-output
-----------------

Topic: ``dd-modeler-output``. Result of training the model::

    {
        "id": "the same id as in the input",
        "quality": "json data",
        "model": "b64-encoded page classifier model"
    }

JSON data format::

    {
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

Start the crawl::

    {
        "id": "some crawl id",
        "workspace_id": "the workspace id",
        "page_model": "b64-encoded page classifier",
        "seeds": ["http://example.com", "http://example.com/2"],
        "page_limit": 100
    }

``page_limit`` field is optional (defaults to 10000).

Stop the crawl::

    {
        "id": "the same id",
        "stop": true
    }

dd-trainer-output-*
-------------------

Topic: ``dd-trainer-output-model``.
Update of the link model (to be saved and posted as ``link_model`` to ``dd-crawler-input`` later)::

    {
        "id": "some crawl id",
        "link_model": "b64-encoded link classifier"
    }

Topic ``dd-trainer-output-pages``. Sample of crawled pages::

    {
        "id": "some crawl id",
        "page_sample": [
            {"url": "http://example1.com", "score": 80},
            {"url": "http://example2.com", "score": 90}
        ]
    }

Topic ``dd-trainer-output-progress``.
Progress update (to be displayed in the UI, probably more fields will be added)::

    {
        "id": "some crawl id",
        "progress": "Crawled N pages and M domains, average reward is 0.122",
        "percentage_done": 98.123
    }


DD Crawler
==========

This is the main crawler.

dd-crawler-input
----------------

Topic ``dd-crawler-input``. Start the crawl::

    {
        "id": "some crawl id",
        "workspace_id": "the workspace_id",
        "page_model": "b64-encoded page classifier",
        "link_model": "b64-encoded deep-deep model",
        "seeds": ["http://example.com", "http://example.com/2"],
        "hints": ["http://example2.com", "http://example2.com/2"],
        "broadness": "DEEP" // Valid codes are ["DEEP", "N10", "N100", "N1000", "N10000", "BROAD"],
        "page_limit": 100
    }

``page_limit`` is optional (defaults to 10000000).

dd-crawler-output-*
-------------------

Crawler output.

Topic ``dd-crawler-output-pages``: exactly the same as ``dd-trainer-output-pages``.

Topic ``dd-crawler-output-progress``: exactly the same as ``dd-trainer-output-progress``.

dd-crawler-hints-input
----------------------

Topic ``dd-crawler-hints-input``.
DD Crawler also accepts hints, that makes the crawler fetch deeper on that domain::

    {
        "workspace_id": "id of the workspace",
        "url": "the pinned url",
        "pinned": true / false
    }

Using ``workspace_id`` instead of ``id`` because several deepcrawl request could come
from the same workspace almost simultaneously, but that doesn't imply the need to cancel
the current crawling because a new one has the same id.

Login workflow
==============

Assumptions for the first iteration:

1) The login feature will be implemented only on the broadcrawl results (i.e. not on the trainer, the seeds or seeds-url)
2) The login will be only on-(dd's)-demand. (i.e the user won't be able to load some url+usr+pwd as seeds or the like)

Basic Flow:

1) While DD is broadcrawling, it would be able to identify sites that requires logging in's for further crawling.
2) DD will report these sites to a ``dd-login-input`` topic.
3) Sitehound-backend will listen to the queue and it will:

    a) take a screenshot of the page (may be useful in case of catcha, so we don't waste time, etc.)
    b) store this message

4) A option will be added on Sitehound to show the users this snapshot, along with the fields to be completed,
   as label + inputs, where each label is one keys from dd-login-input
5) When the user fulfills one message from the step above, the data is stored(wo encryption by now),
   and sent to DD via the ``dd-login-output`` topic.
6) DD receives this message and performs the logging in and deeper crawl of that domain.

dd-login-input
--------------

Topic: ``dd-login-input``. New login form found::

    {
        "workspace_id":"57ea86a9d11ff300054a3519",
        "job_id":"57ea86a9d11ff300054a3519",
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
        "url": "http://example.com/login", // login page as provided
        "key_values": {"txtUser":"user1234", "txtPassword":"12345678"} // identifiers of the fields with the value entered by the user.
    }