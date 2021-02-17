from sanic import Sanic
from sanic.response import json, file as fileResponse
from sanic.exceptions import abort
from sanic.log import logger
from urllib.parse import urljoin
from requests import get, post

from .config import GENESEARCH_URL
from .util import valid_url

app = Sanic("sequence_search")


@app.route('/api/v1/<api_path:path>', methods=["GET", "POST"])
async def api_proxy(request, api_path):
    """
    Proxies GET & POST requests (only) through to `GENESEARCH_URL`. Query
    params are passed through. Body (for POST) is assumed to be in JSON
    format, and is passed through. *Headers are not forwarded. Forwarding
    headers without efforts to sanitize them should likely be avoided for
    security reasons.*
    """
    api_url = urljoin(GENESEARCH_URL, api_path)
    if not (valid_url(api_url) and api_url.startswith(GENESEARCH_URL)):
        abort("400", f"Invalid API Path {api_path}")

    if (request.query_string):
        api_url = f'{api_url}?{request.query_string}'

    raw_url = request.raw_url.decode('UTF-8')
    logger.info(f'Proxying request from {raw_url} to {api_url}')

    verifyHttps = api_url.startswith("https")

    if request.method == "GET":
        r = get(api_url, verify=verifyHttps)
    else:
        r = post(api_url, json=request.json, verify=verifyHttps)

    return json(r.json(), status=r.status_code)


build_directory = '/app/react_app/build'
app.static('/', build_directory)


@app.route("/")
async def index(request):
    return await fileResponse(build_directory + "/index.html")