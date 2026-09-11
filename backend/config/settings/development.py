from .base import *

# Ensure debug mode is enabled in development
DEBUG = True

# Allow local hosts and Django test runner client
ALLOWED_HOSTS = list(set(ALLOWED_HOSTS + ['localhost', '127.0.0.1', '[::1]', 'testserver']))
