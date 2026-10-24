"""Isolated regression settings: no local credentials, persistent DB or cache."""
import os
from unittest.mock import patch


# Import the real application policy with synthetic values and no .env loading.
# All storage overrides are in place before Django initializes its applications.
with patch.dict(os.environ, {
    'DJANGO_SECRET_KEY': 'isolated-regression-tests-only',
    'DEBUG': '0',
    'DJANGO_BASE_BACKEND_URL': 'https://testserver',
    'DJANGO_BASE_FRONTEND_URL': 'https://testserver',
    'DJANGO_ALLOWED_HOSTS': 'testserver,localhost',
    'DJANGO_CORS_ORIGIN_WHITELIST': 'https://testserver',
    'DJANGO_JWT_EXPIRATION_DELTA': '3600',
    'DJANGO_PRODUCTION_SETTINGS': '0',
}), patch('environ.Env.read_env'):
    from .settings import *  # noqa: F403


DATABASES = {
    'default': {'ENGINE': 'django.db.backends.sqlite3', 'NAME': ':memory:'},
}
CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
        'LOCATION': 'isolated-regression-tests',
    },
}
# Fixture passwords are synthetic; keep the suite fast without changing JWT
# signing/verification or the real authentication and permission classes.
PASSWORD_HASHERS = ['django.contrib.auth.hashers.MD5PasswordHasher']

# Exercise admin templates and the public catchall without a frontend build or
# collected static assets. Session, security and CSRF middleware remain enabled.
MIDDLEWARE = [item for item in MIDDLEWARE if 'whitenoise' not in item]  # noqa: F405
STATICFILES_DIRS = []
STORAGES = {
    'default': {'BACKEND': 'django.core.files.storage.FileSystemStorage'},
    'staticfiles': {'BACKEND': 'django.contrib.staticfiles.storage.StaticFilesStorage'},
}
TEMPLATES = [{
    **TEMPLATES[0],  # noqa: F405
    'DIRS': [],
    'APP_DIRS': False,
    'OPTIONS': {
        **TEMPLATES[0]['OPTIONS'],  # noqa: F405
        'loaders': [
            ('django.template.loaders.locmem.Loader', {'index.html': 'Public application shell'}),
            'django.template.loaders.app_directories.Loader',
        ],
    },
}]
