from django.conf import settings
from django.http import HttpResponse

from auth.jwt import generate_jwt_token
from users.models import User
from users.services import user_record_login


def jwt_login(*, response: HttpResponse, user: User) -> HttpResponse:
    token = generate_jwt_token(user)

    # The Python uploader extracts this response cookie and forwards the token in
    # an Authorization header. Incoming cookies never authenticate API requests.
    if settings.JWT_AUTH['JWT_AUTH_COOKIE']:
        response.set_cookie(
            settings.JWT_AUTH['JWT_AUTH_COOKIE'],
            token,
            max_age=int(settings.JWT_AUTH['JWT_EXPIRATION_DELTA'].total_seconds()),
            secure=settings.SESSION_COOKIE_SECURE,
            httponly=True,
            samesite=settings.JWT_AUTH.get('JWT_AUTH_COOKIE_SAMESITE', 'Lax'),
        )

    if hasattr(response, 'data') and isinstance(response.data, dict):
        response.data['token'] = token

    user_record_login(user=user)

    return response
