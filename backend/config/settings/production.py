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
