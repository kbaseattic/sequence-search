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


@app.route("/api/search_result", methods=['GET'])
async def search_result(request):
    return json(genesearch.search_result(request.args['id'][0]))


@app.route("/api/search", methods=['POST'])
async def search(request):
    return json(
        genesearch.search(namespace=request.json['namespace'],
                          fasta_content=request.json['sequence']))


@app.route("/api/search_status", methods=['POST'])
async def search_status(request):
    return json(genesearch.search_status(ticketIds=request.json))