from urllib.parse import urlparse
import ipaddress


def get_hostname(url):
    if not url.startswith(("http://", "https://")):
        url = "http://" + url

    return urlparse(url).hostname


def is_ip_address(url):
    try:
        hostname = get_hostname(url)

        if hostname is None:
            return 0

        ipaddress.ip_address(hostname)
        return 1

    except:
        return 0


def count_subdomains(url):
    hostname = get_hostname(url)

    if hostname is None:
        return 0

    # Don't count IP address parts as subdomains
    try:
        ipaddress.ip_address(hostname)
        return 0
    except:
        pass

    parts = hostname.split(".")

    if len(parts) <= 2:
        return 0

    return len(parts) - 2


def has_suspicious_keywords(url):

    suspicious_words = [
        "login",
        "verify",
        "account",
        "secure",
        "update",
        "password",
        "bank",
        "signin",
        "confirm"
    ]

    url = url.lower()

    for word in suspicious_words:
        if word in url:
            return 1

    return 0


def domain_length(url):

    hostname = get_hostname(url)

    if hostname is None:
        return 0

    return len(hostname)


def is_url_shortener(url):

    shorteners = [
        "bit.ly",
        "tinyurl.com",
        "t.co",
        "goo.gl",
        "ow.ly",
        "is.gd",
        "buff.ly",
        "cutt.ly"
    ]

    hostname = get_hostname(url)

    if hostname is None:
        return 0

    hostname = hostname.lower()

    for shortener in shorteners:
        if hostname == shortener:
            return 1

    return 0


def extract_features(url):

    parsed_url = urlparse(url)

    features = {

        "url_length": len(url),

        "num_dots": url.count("."),

        "num_hyphens": url.count("-"),

        "num_slashes": url.count("/"),

        "num_digits": sum(char.isdigit() for char in url),

        "https": 1 if parsed_url.scheme == "https" else 0,

        "num_at": url.count("@"),

        "num_question": url.count("?"),

        "num_equal": url.count("="),

        "num_percent": url.count("%"),

        "num_underscore": url.count("_"),

        "num_special": sum(
            not char.isalnum()
            for char in url
        ),

        "uses_ip": is_ip_address(url),

        "num_subdomains": count_subdomains(url),

        "suspicious_keyword": has_suspicious_keywords(url),

        "domain_length": domain_length(url),

        "is_url_shortener": is_url_shortener(url)
    }

    return features