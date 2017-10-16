from time import gmtime, strftime
import random


def build_metadata(workspace_id):

    metadata = {}
    metadata['workspace'] = workspace_id
    metadata['strTimestamp'] = strftime("%Y-%m-%d %H:%M:%S", gmtime())
    metadata['uow'] = random.randint(0, 1000000)
    return metadata
