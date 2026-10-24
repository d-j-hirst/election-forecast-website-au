from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response

from django.conf import settings
from django.contrib.auth import authenticate

from auth_api.mixins import ApiErrorsMixin, PublicApiMixin, ApiAuthMixin

from users.services import user_change_secret_key

from auth.services import jwt_login
from users.selectors import user_get_me

from typing import Any


class LoginApi(PublicApiMixin, ApiErrorsMixin, APIView):
    """Exchange uploader credentials for a JWT sent explicitly on later requests."""

    class InputSerializer(serializers.Serializer):
        email = serializers.EmailField(required=False)
        username = serializers.EmailField(required=False)
        password = serializers.CharField(write_only=True)

    def post(self, request: Any, *args: Any, **kwargs: Any):
        serializer = self.InputSerializer(data=request.data)

        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data.get('email') or serializer.validated_data.get('username')

        if not email:
            raise serializers.ValidationError({'email': 'This field is required.'})

        user = authenticate(request, username=email, password=serializer.validated_data['password'])

        if user is None:
            raise serializers.ValidationError('Unable to log in with provided credentials.')

        response = Response(data={'me': user_get_me(user=user)})
        return jwt_login(response=response, user=user)


class LogoutApi(ApiAuthMixin, ApiErrorsMixin, APIView):
    def post(self, request: Any):
        """Revoke all of this user's API JWTs; Django admin sessions are separate."""
        user_change_secret_key(user=request.user)

        response = Response(status=status.HTTP_202_ACCEPTED)
        response.delete_cookie(settings.JWT_AUTH['JWT_AUTH_COOKIE'])

        return response
