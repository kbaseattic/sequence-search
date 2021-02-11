from urllib.parse import urlparse


def valid_url(url):
    """Checks that a URL has a valid scheme and netloc(IP/domain)"""
    try:
        result = urlparse(url)
        return all([result.scheme in ('http', 'https'), result.netloc])
    except ValueError:
        return False