import urllib.parse

from requests import get


class Genesearch(object):
    """
    helper for genesearch api
    """
    def __init__(self, base_uri):
        self.base_uri = base_uri

    def _route(self, path):
        return urllib.parse.urljoin(self.base_uri, path)

    def namespaces(self):
        r = get(self._route("/namespace"))
        return r.json()