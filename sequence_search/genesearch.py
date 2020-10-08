import urllib.parse

from requests import get, post


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

    def search(self, namespace, fasta_content):
        r = post(self._route(f"/namespace/{namespace}/batch"),
                 {"sequence": fasta_content})
        return r.json()

    def search_status(self, ticketIds):
        r = get(self._route("/tickets"))
        ticketStatus = r.json()
        return {tId: ticketStatus[tId] for tId in ticketIds}

    def search_result(self, ticketId):
        r = get(self._route(f"/ticket/{ticketId}"))
        return r.json()
