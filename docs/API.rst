=============
Sitehound API
=============

This is the API for Kafka messages. It is used for communication between
Sitehound, hh-deep-deep and hh-page-classifier.

.. contents::


DD Modeler
==========

This is for page classifier training.

dd-modeler-input
----------------

Topic: ``dd-modeler-input``. Training page classifier model::

    {
        "id": "some id that will be returned in the answer message", // the workspace_id
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
        "quality": "[[\"Accuracy\", \"0.84\"], [\"some other metric\", \"0.89\"]]",
        "model": "b64-encoded page classifier model"
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
===================

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
