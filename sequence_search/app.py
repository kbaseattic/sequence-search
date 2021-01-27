import os
from sanic import Sanic
from sanic.response import json, file as fileResponse
import urllib.parse
from requests import get, post

app = Sanic("sequence_search")


@app.route('/api/v1/<api_path:path>', methods=["GET", "POST"])
async def api_proxy(request, api_path):
    api_url = urllib.parse.urljoin(os.environ['GENESEARCH_URL'], api_path)
    if request.method == "GET":
        r = get(api_url)
    else:
        r = post(api_url, json=request.json)
    return json(r.json(), status=r.status_code)


build_directory = '/app/react_app/build'
app.static('/', build_directory)


@app.route("/")
async def index(request):
    return await fileResponse(build_directory + "/index.html")