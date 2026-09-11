import os
from .base import *

# Select settings module based on DJANGO_ENV ('development' by default)
DJANGO_ENV = os.getenv('DJANGO_ENV', 'development').lower()

if DJANGO_ENV == 'production':
    from .production import *
else:
    from .development import *
