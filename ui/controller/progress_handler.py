from flask_login import login_required
from service.progress_service import get_crawler_progress, get_all_progress

import json
from ui import app
from flask import Response


@app.route("/api/workspace/<workspace_id>/dd-crawler/progress", methods=["GET"])
@login_required
def get_crawler_progress_api(workspace_id):
    # phase = "dd-trainer"
    in_doc = get_crawler_progress(workspace_id)
    # out_doc = JSONEncoder().encode(in_doc)
    # return Response(json.dumps(out_doc), mimetype="application/json")
    return Response(json.dumps(in_doc), mimetype="application/json")


@app.route("/api/workspace/<workspace_id>/progress", methods=["GET"])
@login_required
def get_all_progress_api(workspace_id):
    # phase = "dd-trainer"
    in_doc = get_all_progress(workspace_id)
    # out_doc = JSONEncoder().encode(in_doc)
    # return Response(json.dumps(out_doc), mimetype="application/json")
    return Response(json.dumps(in_doc), mimetype="application/json")

#
# jsonVar = {'advice': [{'kind': 'Warning',
#              'text': 'The quality of the classifier is not very good, ROC AUC '
#                      'is just 0.67. Consider labeling more pages, or '
#                      're-labeling them using different criteria.'}],
#  'description': [{'heading': 'Dataset',
#                   'text': '183 documents, 183 with labels (100%) across 129 '
#                           'domains.'},
#                  {'heading': 'Class balance',
#                   'text': '40% relevant, 60% not relevant.'},
#                  {'heading': 'Metrics', 'text': ''},
#                  {'heading': 'Accuracy', 'text': '0.628 +/- 0.087'},
#                  {'heading': 'F1', 'text': '0.435 +/- 0.140'},
#                  {'heading': 'ROC AUC', 'text': '0.666 +/- 0.127'}],
#  'tooltips': {'Accuracy': 'Accuracy is the ratio of pages classified correctly '
#                           'as relevant or not relevant. This metric is easy to '
#                           'interpret but not very good for unbalanced '
#                           'datasets.',
#               'F1': 'F1 score is a combination of recall and precision for '
#                     'detecting relevant pages. It shows how good is a '
#                     'classifier at detecting relevant pages at default '
#                     'threshold.Worst value is 0.0 and perfect value is 1.0.',
#               'ROC AUC': 'Area under ROC (receiver operating characteristic) '
#                          'curve shows how good is the classifier at telling '
#                          'relevant pages from non-relevant at different '
#                          'thresholds. Random classifier has '
#                          'ROC&nbsp;AUC&nbsp;=&nbsp;0.5, and a perfect '
#                          'classifier has ROC&nbsp;AUC&nbsp;=&nbsp;1.0.'},
#  'weights': {'neg': [{'feature': 'guns',
#                       'hsl_color': 'hsl(0, 100.00%, 84.90%)',
#                       'weight': -2.428889982096285}],
#              'neg_remaining': 4010,
#              'pos': [{'feature': '2015',
#                       'hsl_color': 'hsl(120, 100.00%, 80.00%)',
#                       'weight': 3.6302748160783169},
#                      {'feature': 'ddos',
#                       'hsl_color': 'hsl(120, 100.00%, 81.01%)',
#                       'weight': 3.3705389894546043},
#                      {'feature': 'cyber',
#                       'hsl_color': 'hsl(120, 100.00%, 82.15%)',
#                       'weight': 3.0853239779770192},
#                      {'feature': 'categories',
#                       'hsl_color': 'hsl(120, 100.00%, 82.52%)',
#                       'weight': 2.9957854750166892},
#                      {'feature': 'post',
#                       'hsl_color': 'hsl(120, 100.00%, 82.68%)',
#                       'weight': 2.9559694264712681},
#                      {'feature': '2009',
#                       'hsl_color': 'hsl(120, 100.00%, 84.55%)',
#                       'weight': 2.5114085075362511},
#                      {'feature': 'blog',
#                       'hsl_color': 'hsl(120, 100.00%, 84.60%)',
#                       'weight': 2.498547950234312},
#                      {'feature': 'usa',
#                       'hsl_color': 'hsl(120, 100.00%, 84.71%)',
#                       'weight': 2.4739101971451967},
#                      {'feature': 'pm',
#                       'hsl_color': 'hsl(120, 100.00%, 85.15%)',
#                       'weight': 2.3721177604103914}],
#              'pos_remaining': 4529}
#            }
#
# var2 = {
#         "tooltips":
#             {"F1": "F1 score is a combination of recall and precision for detecting relevant pages. It shows how good is a classifier at detecting relevant pages at default threshold."
#                    "Worst value is 0.0 and perfect value is 1.0.",
#              "ROC AUC": "Area under ROC (receiver operating characteristic) curve shows how good is the classifier at telling relevant pages from non-relevant at different thresholds. "
#                         "Random classifier has ROC&nbsp;AUC&nbsp;=&nbsp;0.5, and a perfect classifier has ROC&nbsp;AUC&nbsp;=&nbsp;1.0.",
#              "Accuracy": "Accuracy is the ratio of pages classified correctly as relevant or not relevant. This metric is easy to interpret but not very good for unbalanced datasets."},
#         "advice": [
#             {"text": "Number of labeled documents is just 31, consider having at least 100 labeled.", "kind": "Warning"},
#             {"text": "The quality of the classifier is not bad, ROC AUC is nan. Still, consider fixing warnings shown above.", "kind": "Notice"},
#             {"text": "The quality of the Accuracy is not bad, ROC AUC is nan. Still, consider fixing warnings shown F1.", "kind": "Notice"}
#
#         ],
#             # {"text": "The quality of the classifier is not bad, ROC AUC <span data-toggle=\"tooltip\" data-placement=\"bottom\" title=\"Area under ROC (receiver operating characteristic) curve " +
#             #          "shows how good is the classifier at telling relevant pages from non-relevant at different thresholds. " +
#             #          "Random classifier has ROC&nbsp;AUC&nbsp;=&nbsp;0.5, and a perfect classifier has ROC&nbsp;AUC&nbsp;=&nbsp;1.0.\"><span class=\"question glyphicon glyphicon-question-sign\"></span></span>" +
#             #          "is nan. Still, consider fixing warnings shown above.", "kind": "Notice"}],
#         "weights": {
#             "neg": [
#                 {"hsl_color": "hsl(0, 100.00%, 80.00%)", "feature": "de", "weight": -7.428916491590784},
#                 {"hsl_color": "hsl(0, 100.00%, 84.50%)", "feature": "page", "weight": -5.161427040099774},
#                 {"hsl_color": "hsl(0, 100.00%, 85.34%)", "feature": "el", "weight": -4.767600381000345},
#                 {"hsl_color": "hsl(0, 100.00%, 87.49%)", "feature": "amazon", "weight": -3.802431430016503},
#                 {"hsl_color": "hsl(0, 100.00%, 87.93%)", "feature": "you", "weight": -3.6096740368347526},
#                 {"hsl_color": "hsl(0, 100.00%, 88.10%)", "feature": "que", "weight": -3.5369637739660575},
#                 {"hsl_color": "hsl(0, 100.00%, 89.44%)", "feature": "remove", "weight": -2.9841397952064583},
#                 {"hsl_color": "hsl(0, 100.00%, 89.67%)", "feature": "previous", "weight": -2.888982947096933},
#                 {"hsl_color": "hsl(0, 100.00%, 89.67%)", "feature": "invalid", "weight": -2.888982947096933},
#                 {"hsl_color": "hsl(0, 100.00%, 89.67%)", "feature": "url", "weight": -2.888982947096933},
#                 {"hsl_color": "hsl(0, 100.00%, 89.67%)", "feature": "redirect", "weight": -2.888982947096933},
#                 {"hsl_color": "hsl(0, 100.00%, 89.67%)", "feature": "notice", "weight": -2.888982947096933},
#                 {"hsl_color": "hsl(0, 100.00%, 89.77%)", "feature": "prime", "weight": -2.8518235725123797},
#                 {"hsl_color": "hsl(0, 100.00%, 89.87%)", "feature": "do", "weight": -2.8117182983335454},
#                 {"hsl_color": "hsl(0, 100.00%, 90.24%)", "feature": "no", "weight": -2.6645881713756703},
#                 {"hsl_color": "hsl(0, 100.00%, 90.33%)", "feature": "se", "weight": -2.6306154901166576},
#                 {"hsl_color": "hsl(0, 100.00%, 90.45%)", "feature": "em", "weight": -2.5845538637592185},
#                 {"hsl_color": "hsl(0, 100.00%, 90.48%)", "feature": "del", "weight": -2.5742038864398267},
#                 {"hsl_color": "hsl(0, 100.00%, 90.58%)", "feature": "music", "weight": -2.534954286677671},
#                 {"hsl_color": "hsl(0, 100.00%, 90.73%)", "feature": "visit", "weight": -2.4746893081076697},
#                 {"hsl_color": "hsl(0, 100.00%, 90.83%)", "feature": "sending", "weight": -2.440132975185781},
#                 {"hsl_color": "hsl(0, 100.00%, 90.92%)", "feature": "por", "weight": -2.402699648303708},
#                 {"hsl_color": "hsl(0, 100.00%, 91.06%)", "feature": "if", "weight": -2.352277654240203},
#                 {"hsl_color": "hsl(0, 100.00%, 91.30%)", "feature": "un", "weight": -2.2635882351343644},
#                 {"hsl_color": "hsl(0, 100.00%, 91.42%)", "feature": "kindle", "weight": -2.218085000842961}
#             ],
#             "neg_remaining": 612,
#             "pos": [
#                 {"hsl_color": "hsl(120, 100.00%, 86.27%)", "feature": "<BIAS>", "weight": 4.340263486231816},
#                 {"hsl_color": "hsl(120, 100.00%, 89.24%)", "feature": "the", "weight": 3.0645860512323644},
#                 {"hsl_color": "hsl(120, 100.00%, 89.82%)", "feature": "con", "weight": 2.8318771300742718},
#                 {"hsl_color": "hsl(120, 100.00%, 90.27%)", "feature": "presidente", "weight": 2.654627361263062},
#                 {"hsl_color": "hsl(120, 100.00%, 91.34%)", "feature": "p\u00e9rez", "weight": 2.2483447184159795}
#             ],
#             "pos_remaining": 773
#         },
#         "description": [
#             {"text": "311 documents, 31 with labels (10%) across 26 domains.", "heading": "Dataset"},
#             {"text": "71% relevant, 29% not relevant.", "heading": "Class balance"},
#             {"text": "", "heading": "Metrics"}, {"text": "0.804 \u00b1 0.413", "heading": "Accuracy"},
#             {"text": "0.833 \u00b1 0.327", "heading": "F1"},
#             {"text": "nan \u00b1 nan", "heading": "ROC AUC"}
#         ]
#     }
