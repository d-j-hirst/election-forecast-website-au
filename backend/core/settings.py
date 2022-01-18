"""
Django settings for core project.

Generated by 'django-admin startproject' using Django 3.2.9.

For more information on this file, see
https://docs.djangoproject.com/en/3.2/topics/settings/

For the full list of settings and their values, see
https://docs.djangoproject.com/en/3.2/ref/settings/
"""

from pathlib import Path

import datetime
import environ
import os

from typing import List

env = environ.Env(
    DEBUG=(int, 0)
)

# reading .env file
environ.Env.read_env('.env')

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = BASE_DIR
FRONTEND_DIR = BASE_DIR.parent / 'frontend'

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = os.environ['DJANGO_SECRET_KEY']

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG: bool = bool(env.bool('DEBUG', default=True))

BASE_BACKEND_URL: str = str(env.str('DJANGO_BASE_BACKEND_URL', default='http://localhost:8000'))
BASE_FRONTEND_URL: str = str(env.str('DJANGO_BASE_FRONTEND_URL', default='http://localhost:3000'))

CSRF_COOKIE_SECURE = not DEBUG
SESSION_COOKIE_SECURE = not DEBUG
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 1
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True

DATA_UPLOAD_MAX_MEMORY_SIZE = 10485760 # 10 MB for now

SECURE_SSL_REDIRECT: bool = os.environ['DEBUG'] == '0'

ALLOWED_HOSTS: List[str] = env.list('DJANGO_ALLOWED_HOSTS', default=[   # type: ignore
    "dendrite.pythonanywhere.com", "localhost", "127.0.0.1"]
)

# Application definition

INSTALLED_APPS = [
    'forecast_api.apps.ForecastApiConfig',
    'corsheaders',
    'accounts.apps.AccountsConfig',
    'whitenoise.runserver_nostatic',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_jwt',
    'rest_framework_jwt.blacklist',
    'users'
]

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            FRONTEND_DIR / 'build',
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

REST_FRAMEWORK = {
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_jwt.authentication.JSONWebTokenAuthentication',
        'rest_framework.authentication.SessionAuthentication',
        'rest_framework.authentication.BasicAuthentication',
    ),
}

WSGI_APPLICATION = 'core.wsgi.application'


# Database
# https://docs.djangoproject.com/en/3.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BACKEND_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/3.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/3.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_L10N = True

USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/3.2/howto/static-files/

STATIC_URL = '/static/'

STATICFILES_DIRS = [FRONTEND_DIR / 'build' / 'static']

STATICFILES_STORAGE = (
    'whitenoise.storage.CompressedManifestStaticFilesStorage')

STATIC_ROOT = BACKEND_DIR / 'static'

WHITENOISE_ROOT = FRONTEND_DIR / 'build' / 'root'

# Default primary key field type
# https://docs.djangoproject.com/en/3.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

LOGIN_REDIRECT_URL = 'index'
LOGOUT_REDIRECT_URL = 'admin/login'

ACCOUNT_USER_MODEL_USERNAME_FIELD = None
ACCOUNT_EMAIL_REQUIRED = True
ACCOUNT_USERNAME_REQUIRED = False
ACCOUNT_AUTHENTICATION_METHOD = 'email'

AUTH_USER_MODEL = 'users.User'

PRODUCTION_SETTINGS: bool = bool(env.bool('DJANGO_PRODUCTION_SETTINGS', default=False))

JWT_EXPIRATION_DELTA_DEFAULT = 2.628e+6
JWT_AUTH = {
    'JWT_EXPIRATION_DELTA': datetime.timedelta(
        seconds=env.int(  # type: ignore
            'DJANGO_JWT_EXPIRATION_DELTA',
            default=JWT_EXPIRATION_DELTA_DEFAULT
        )
    ),
    'JWT_AUTH_HEADER_PREFIX': 'JWT',
    'JWT_GET_USER_SECRET_KEY': lambda user: user.secret_key,
    'JWT_RESPONSE_PAYLOAD_HANDLER': 'users.selectors.jwt_response_payload_handler',
    'JWT_AUTH_COOKIE': 'jwt_token',
    'JWT_AUTH_COOKIE_SAMESITE': 'None'
}

CORS_ALLOW_CREDENTIALS = True
CORS_ORIGIN_WHITELIST: List[str] = env.list(  # type: ignore
    'DJANGO_CORS_ORIGIN_WHITELIST',
    default=[BASE_FRONTEND_URL]
)

# Google OAuth2 settings
GOOGLE_OAUTH2_CLIENT_ID: str = str(env.str('GOOGLE_OAUTH_ID'))
GOOGLE_OAUTH2_CLIENT_SECRET: str = str(env.str('GOOGLE_OAUTH_SECRET'))