from urllib.parse import urlencode

from rest_framework import status, serializers
from rest_framework.views import APIView
from rest_framework.response import Response

from django.urls import reverse
from django.conf import settings
from django.contrib.auth import authenticate
from django.shortcuts import redirect

from auth_api.mixins import ApiErrorsMixin, PublicApiMixin, ApiAuthMixin

from users.services import user_record_login, user_change_secret_key, user_get_or_create

from auth.services import jwt_login, google_get_access_token, google_get_user_info
from users.selectors import user_get_me

from typing import Any


class LoginApi(PublicApiMixin, ApiErrorsMixin, APIView):
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


class GoogleLoginApi(PublicApiMixin, ApiErrorsMixin, APIView):
    class InputSerializer(serializers.Serializer):
        code = serializers.CharField(required=False)
        error = serializers.CharField(required=False)

    def get(self, request: Any, *args: Any, **kwargs: Any):
        input_serializer = self.InputSerializer(data=request.GET)
        input_serializer.is_valid(raise_exception=True)

        validated_data = input_serializer.validated_data

        code = validated_data.get('code')
        error = validated_data.get('error')

        login_url = f'{settings.BASE_FRONTEND_URL}/login'

        if error or not code:
            params = urlencode({'error': error})
            return redirect(f'{login_url}?{params}')

        domain = settings.BASE_BACKEND_URL
        api_uri = reverse('auth-api:v1:auth:login-with-google')
        redirect_uri = f'{domain}{api_uri}'

        access_token = google_get_access_token(code=code, redirect_uri=redirect_uri)

        user_data = google_get_user_info(access_token=access_token)

        profile_data = {
            'email': user_data['email'],
            'first_name': user_data.get('givenName', ''),
            'last_name': user_data.get('familyName', ''),
        }

        # We use get-or-create logic here for the sake of the example.
        # We don't have a sign-up flow.
        user, _ = user_get_or_create(**profile_data)

        response = redirect(settings.BASE_FRONTEND_URL)
        response = jwt_login(response=response, user=user)

        return response


class LogoutApi(ApiAuthMixin, ApiErrorsMixin, APIView):
    def post(self, request: Any):
        """
        Logs out user by removing JWT cookie header.
        """
        user_change_secret_key(user=request.user)

        response = Response(status=status.HTTP_202_ACCEPTED)
        response.delete_cookie(settings.JWT_AUTH['JWT_AUTH_COOKIE'])

        return response
