"""Authentication boundaries shared by the uploader and privileged APIs."""
import json
import os
from datetime import timedelta
from unittest.mock import patch

from django.conf import settings
from django.contrib.auth.models import Permission
from django.core.cache import cache
from django.test import Client, TestCase, override_settings
from django.urls import NoReverseMatch, reverse
from django.utils import timezone
from rest_framework.response import Response

from auth.jwt import generate_jwt_token, get_user_from_token
from forecast_api.models import Election, Forecast
from forecast_api.test_history import report_payload
from users.models import User
from users.services import user_change_secret_key


MUTATIONS = {
    'submit-report': 'submit_report',
    'submit-timeseries-update': 'submit_timeseries_update',
    'submit-results-update': 'submit_results_update',
    'submit-review': 'submit_review',
    'reset-cache': 'reset_cache',
}
LOGIN_URL = '/auth-api/v1/auth/login/'
LOGOUT_URL = '/auth-api/v1/auth/logout/'
ME_URL = '/auth-api/v1/users/me/'


class AuthenticationBoundaryTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        # Use real users and model permissions, not force_authenticate: bypassing
        # the custom authenticator would miss both retired-login and cookie bugs.
        cls.password = 'Synthetic-password-for-tests!'
        cls.publisher = User.objects.create_user(
            email='publisher@example.invalid', password=cls.password,
        )
        cls.publisher.user_permissions.add(Permission.objects.get(codename='submit_forecasts'))
        cls.ordinary = User.objects.create_user(
            email='ordinary@example.invalid', password=cls.password,
        )
        cls.admin = User.objects.create_superuser(
            email='admin@example.invalid', password=cls.password,
        )

    def setUp(self):
        self.client = Client(enforce_csrf_checks=True)
        self.token = generate_jwt_token(self.publisher)
        # No auth regression test may contact Google, scrape results or publish
        # externally. Authorized mutation handlers are stubbed except for the
        # explicitly isolated report-persistence and cache checks below.
        network = patch('requests.sessions.Session.request', side_effect=AssertionError('Unexpected network request'))
        network.start()
        self.addCleanup(network.stop)

    def test_retired_paths_cannot_issue_tokens_with_legacy_configuration(self):
        before = list(User.objects.values('pk', 'email', 'secret_key', 'last_login'))
        paths = ['/auth-api/v1/auth/login/google/', '/auth-api/v1/users/init/']
        # Both old production-switch values and populated legacy credentials must
        # leave direct callback/account-init requests inert, including old clients.
        with patch.dict(os.environ, {'GOOGLE_OAUTH_ID': 'legacy-id', 'GOOGLE_OAUTH_SECRET': 'legacy-secret'}), \
                patch('auth.services.generate_jwt_token') as issue_token:
            for production in (False, True):
                with override_settings(
                    PRODUCTION_SETTINGS=production,
                    GOOGLE_OAUTH2_CLIENT_ID='legacy-id',
                    GOOGLE_OAUTH2_CLIENT_SECRET='legacy-secret',
                ):
                    for path in paths:
                        for method in ('get', 'post'):
                            with self.subTest(path=path, method=method, production=production):
                                response = getattr(self.client, method)(
                                    path, {'code': 'legacy-code', 'email': self.publisher.email},
                                    secure=True, HTTP_AUTHORIZATION='legacy-google-token',
                                )
                                # Removed paths may resolve to the public SPA
                                # catchall; its 200 GET is not a login success.
                                self.assertIn(response.status_code, (200, 403, 404, 405))
                                self.assertNotIn('jwt_token', response.cookies)
                                self.assertNotIn('sessionid', response.cookies)
                    issue_token.assert_not_called()
        self.assertEqual(before, list(User.objects.values('pk', 'email', 'secret_key', 'last_login')))
        for name in ('auth-api:v1:auth:login-with-google', 'auth-api:v1:users:init'):
            with self.subTest(name=name), self.assertRaises(NoReverseMatch):
                reverse(name)

    def test_password_login_preserves_uploader_cookie_and_json_contract(self):
        for identity_field in ('email', 'username'):
            with self.subTest(identity_field=identity_field):
                response = self.client.post(LOGIN_URL, {
                    identity_field: self.publisher.email, 'password': self.password,
                }, secure=True)
                self.assertEqual(response.status_code, 200)
                cookie = response.cookies['jwt_token']
                self.assertEqual(response.json()['token'], cookie.value)
                self.assertEqual(get_user_from_token(cookie.value).pk, self.publisher.pk)
                self.assertTrue(cookie['httponly'])
                self.assertTrue(cookie['secure'])
        response = self.client.post(LOGIN_URL, {
            'email': self.publisher.email, 'password': 'incorrect',
        }, secure=True)
        self.assertEqual(response.status_code, 400)
        self.assertNotIn('jwt_token', response.cookies)

    def test_cookie_only_mutations_are_rejected_on_any_origin(self):
        self.client.cookies['jwt_token'] = self.token
        for origin in ('https://testserver', 'https://untrusted.example'):
            for route, handler in MUTATIONS.items():
                with self.subTest(route=route, origin=origin), \
                        patch('forecast_api.views.' + handler, return_value=Response({})) as mutation:
                    response = self.client.post(
                        '/forecast-api/' + route, data='{}', content_type='text/plain',
                        secure=True, HTTP_ORIGIN=origin,
                    )
                    self.assertEqual(response.status_code, 403)
                    mutation.assert_not_called()

    def test_cookie_only_request_cannot_clear_cache(self):
        cache.set('authentication-test-sentinel', 'present')
        self.addCleanup(cache.delete, 'authentication-test-sentinel')
        self.client.cookies['jwt_token'] = self.token
        response = self.client.post(
            '/forecast-api/reset-cache', secure=True,
            HTTP_ORIGIN='https://untrusted.example',
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(cache.get('authentication-test-sentinel'), 'present')

    def test_cookie_only_requests_cannot_read_identity_or_revoke_tokens(self):
        self.client.cookies['jwt_token'] = self.token
        self.assertEqual(self.client.get(ME_URL, secure=True).status_code, 403)
        response = self.client.post(LOGOUT_URL, secure=True, HTTP_ORIGIN='https://untrusted.example')
        self.assertEqual(response.status_code, 403)
        self.assertNotIn('jwt_token', response.cookies)
        self.assertEqual(get_user_from_token(self.token).pk, self.publisher.pk)

    def test_explicit_headers_authorize_mutations_without_csrf_cookie(self):
        # An invalid ambient cookie must not interfere with either supported
        # header scheme, and the uploader does not need a browser CSRF token.
        self.client.cookies['jwt_token'] = 'invalid-cookie'
        for prefix in ('JWT', 'Bearer'):
            for route, handler in MUTATIONS.items():
                with self.subTest(route=route, prefix=prefix), \
                        patch('forecast_api.views.' + handler, return_value=Response({})) as mutation:
                    response = self.client.post(
                        '/forecast-api/' + route, data='{}', content_type='application/json',
                        secure=True, HTTP_AUTHORIZATION=f'{prefix} {self.token}',
                    )
                    self.assertEqual(response.status_code, 200)
                    mutation.assert_called_once()

    def test_invalid_credentials_never_fall_back_to_privileged_cookie(self):
        disabled = User.objects.create_user(email='disabled@example.invalid', is_active=False)
        revoked = generate_jwt_token(self.admin)
        user_change_secret_key(user=self.admin)
        with patch('auth.jwt.timezone.now', return_value=timezone.now() - settings.JWT_AUTH['JWT_EXPIRATION_DELTA'] - timedelta(seconds=60)):
            expired = generate_jwt_token(self.publisher)
        credentials = {
            'anonymous': '',
            'ordinary': 'JWT ' + generate_jwt_token(self.ordinary),
            'disabled': 'JWT ' + generate_jwt_token(disabled),
            'expired': 'JWT ' + expired,
            'revoked': 'JWT ' + revoked,
            'invalid-token': 'JWT invalid',
            'invalid-header': 'JWT',
            'basic': 'Basic Zm9vOmJhcg==',
        }
        self.client.cookies['jwt_token'] = self.token
        for label, header in credentials.items():
            for route, handler in MUTATIONS.items():
                with self.subTest(label=label, route=route), \
                        patch('forecast_api.views.' + handler, return_value=Response({})) as mutation:
                    response = self.client.post('/forecast-api/' + route, secure=True, HTTP_AUTHORIZATION=header)
                    self.assertEqual(response.status_code, 403)
                    mutation.assert_not_called()

    def test_removed_permission_blocks_an_existing_token(self):
        self.publisher.user_permissions.clear()
        with patch('forecast_api.views.reset_cache', return_value=Response({})) as mutation:
            response = self.client.post('/forecast-api/reset-cache', secure=True, HTTP_AUTHORIZATION='JWT ' + self.token)
        self.assertEqual(response.status_code, 403)
        mutation.assert_not_called()

    def test_uploader_cookie_to_header_handoff_persists_report(self):
        login = self.client.post(LOGIN_URL, {
            'email': self.publisher.email, 'password': self.password,
        }, secure=True)
        self.assertEqual(login.status_code, 200)
        # Match upload_manager.py: extract the response cookie, then use a fresh
        # request carrying its token as a header. All persisted data is synthetic.
        token = login.cookies['jwt_token'].value
        response = Client(enforce_csrf_checks=True).post(
            '/forecast-api/submit-report',
            data=json.dumps(report_payload('2026-10-25T00:00:00Z')),
            content_type='application/json; charset=utf-8', secure=True,
            HTTP_AUTHORIZATION='JWT ' + token,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(Forecast.objects.count(), 1)
        self.assertEqual(Election.objects.get().code, 'testfed')

    def test_header_logout_revokes_api_tokens(self):
        second_token = generate_jwt_token(self.publisher)
        response = self.client.post(LOGOUT_URL, secure=True, HTTP_AUTHORIZATION='JWT ' + self.token)
        self.assertEqual(response.status_code, 202)
        self.assertEqual(response.cookies['jwt_token']['max-age'], 0)
        for token in (self.token, second_token):
            with self.subTest(token_number=(token == self.token)):
                self.assertEqual(self.client.get(ME_URL, secure=True, HTTP_AUTHORIZATION='JWT ' + token).status_code, 403)

    def test_django_admin_keeps_its_session_and_csrf_boundary(self):
        self.client.get('/admin/login/', secure=True)
        csrf = self.client.cookies['csrftoken'].value
        response = self.client.post('/admin/login/?next=/admin/', {
            'username': self.admin.email, 'password': self.password,
            'next': '/admin/', 'csrfmiddlewaretoken': csrf,
        }, secure=True, HTTP_ORIGIN='https://testserver')
        self.assertEqual(response.status_code, 302)
        self.assertEqual(self.client.get('/admin/', secure=True).status_code, 200)
        self.assertEqual(self.client.post('/admin/logout/', secure=True, HTTP_ORIGIN='https://untrusted.example').status_code, 403)
        with patch('forecast_api.views.reset_cache', return_value=Response({})) as mutation:
            self.assertEqual(self.client.post('/forecast-api/reset-cache', secure=True).status_code, 403)
            mutation.assert_not_called()
        jwt_only = Client(enforce_csrf_checks=True)
        jwt_only.cookies['jwt_token'] = generate_jwt_token(self.admin)
        self.assertEqual(jwt_only.get('/admin/', secure=True).status_code, 302)
