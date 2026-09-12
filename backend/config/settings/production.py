import os
from .base import *

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = False

# Comma-separated list of allowed hosts in production environment
ALLOWED_HOSTS = [
    host.strip()
    for host in os.getenv('ALLOWED_HOSTS', '').split(',')
    if host.strip()
]

# Database configuration can be customized via environment variables or database URL
# DATABASES = { ... }

# Production security settings
CSRF_COOKIE_SECURE = True
SESSION_COOKIE_SECURE = True
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True

# The Capacitor Android app's WebView origin (https://localhost) differs from
# this backend's origin (the onrender.com domain), making every API call
# cross-site. Cookies default to SameSite=Lax, which browsers/WebViews don't
# send on cross-site XHR/fetch — that's why "Authentication credentials were
# not provided" showed up after a successful login. SameSite=None (paired
# with Secure=True above) allows the cookie on cross-site requests.
CSRF_COOKIE_SAMESITE = 'None'
SESSION_COOKIE_SAMESITE = 'None'

# Render (and most PaaS hosts) terminate TLS at their edge proxy and forward
# plain HTTP internally — without these, Django can't tell a request was
# actually HTTPS, which breaks secure-cookie logic and CSRF checks.
SECURE_SSL_REDIRECT = True
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
