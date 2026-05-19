from typing import Any, Optional

import jwt
from django.conf import settings
from django.contrib.auth import get_user_model
from django.utils import timezone
from rest_framework import authentication, exceptions


class JSONWebTokenAuthentication(authentication.BaseAuthentication):
    def authenticate(self, request: Any):
        token = get_token_from_request(request)

        if not token:
            return None

        user = get_user_from_token(token)
        return user, token


def generate_jwt_token(user: Any) -> str:
    now = timezone.now()
    expires_at = now + settings.JWT_AUTH['JWT_EXPIRATION_DELTA']
    payload = {
        'user_id': user.pk,
        'email': user.email,
        'iat': int(now.timestamp()),
        'exp': int(expires_at.timestamp()),
    }

    return jwt.encode(payload, user.secret_key, algorithm='HS256')


def get_token_from_request(request: Any) -> Optional[str]:
    auth_header = authentication.get_authorization_header(request).decode('utf-8')

    if auth_header:
        parts = auth_header.split()

        if len(parts) == 2 and parts[0].lower() in ('jwt', 'bearer'):
            return parts[1]

        raise exceptions.AuthenticationFailed('Invalid authorization header.')

    cookie_name = settings.JWT_AUTH.get('JWT_AUTH_COOKIE')

    if cookie_name:
        return request.COOKIES.get(cookie_name)

    return None


def get_user_from_token(token: str) -> Any:
    try:
        unverified_payload = jwt.decode(token, options={'verify_signature': False})
    except jwt.PyJWTError:
        raise exceptions.AuthenticationFailed('Invalid token.')

    user_id = unverified_payload.get('user_id')

    if user_id is None:
        raise exceptions.AuthenticationFailed('Invalid token payload.')

    User = get_user_model()

    try:
        user = User.objects.get(pk=user_id)
    except User.DoesNotExist:
        raise exceptions.AuthenticationFailed('User not found.')

    try:
        jwt.decode(token, user.secret_key, algorithms=['HS256'])
    except jwt.ExpiredSignatureError:
        raise exceptions.AuthenticationFailed('Token has expired.')
    except jwt.PyJWTError:
        raise exceptions.AuthenticationFailed('Invalid token.')

    if not user.is_active:
        raise exceptions.AuthenticationFailed('User account is disabled.')

    return user
