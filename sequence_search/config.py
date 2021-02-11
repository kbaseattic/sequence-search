import os
from .util import valid_url


def genesearch_url():
    val = os.environ['GENESEARCH_URL']
    if not valid_url(val):
        raise ValueError(
            f'GENESEARCH_URL enviromental varialbe is invalid, "{val}" is not a valid URL'
        )
    return val


GENESEARCH_URL = genesearch_url()