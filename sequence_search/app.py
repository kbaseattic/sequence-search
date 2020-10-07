import os
from sanic import Sanic
from sanic.response import json
from .genesearch import Genesearch

app = Sanic("sequence_search")
app.static(file_or_directory='/app/react_app/build', uri='/')

genesearch = Genesearch(os.environ['GENESEARCH_URL'])


@app.route("/api/namespace")
async def namespaces(request):
    return json(genesearch.namespaces())