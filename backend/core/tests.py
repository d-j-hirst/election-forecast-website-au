"""Public shell and API dispatch use synthetic templates and isolated settings."""
from django.test import Client, SimpleTestCase, override_settings
from django.urls import resolve


class PublicRoutingTests(SimpleTestCase):
    def test_public_deep_links_and_unknown_public_paths_load_the_shell(self):
        for path in ['/', '/forecast/2026vic/regular/', '/forecast/2026vic/archives/',
                     '/seat/2026vic/regular/alpha/', '/archive/2026vic/42/',
                     '/archive/2026vic/42/seat/alpha/', '/guide/', '/glossary/',
                     '/methods/', '/methodology/', '/commentary/', '/commentary/42/',
                     '/about/', '/support/', '/unknown-page/', '/forecast-api-extra/']:
            with self.subTest(path=path):
                response = self.client.get(path, secure=True)
                self.assertContains(response, 'Public application shell')

    def test_public_missing_slash_keeps_query_string(self):
        response = self.client.get('/guide?source=example', secure=True)
        self.assertEqual(response.status_code, 301)
        self.assertEqual(response['Location'], '/guide/?source=example')

    def test_unknown_api_paths_are_json_404_in_both_debug_modes(self):
        client = Client(enforce_csrf_checks=True)
        for debug in [False, True]:
            with override_settings(DEBUG=debug):
                for path in ['/forecast-api', '/forecast-api/', '/forecast-api/unknown',
                             '/forecast-api/unknown/', '/commentary-api/unknown/',
                             '/forecast-api/election-archive/2026vic/NaN/',
                             '/forecast-api/election-archive/2026vic/-1/',
                             '/forecast-api/election-summary/2026vic/regular/',
                             '/auth-api/v1/auth/login/google/', '/auth-api/v1/users/init/']:
                    for method in ['get', 'post', 'put', 'delete']:
                        with self.subTest(debug=debug, path=path, method=method):
                            response = getattr(client, method)(path, secure=True)
                            self.assertEqual(response.status_code, 404)
                            self.assertEqual(response.json(), {'detail': 'API endpoint not found.'})
                            self.assertFalse(response.cookies)

    def test_registered_missing_slash_redirects_preserve_queries(self):
        for path in ['/auth-api/v1/auth/login', '/forecast-api/election-results/2026vic',
                     '/forecast-api/election-archive/2026vic/42',
                     '/forecast-api/election-timeseries/2026vic/regular']:
            with self.subTest(path=path):
                response = self.client.get(path + '?source=example', secure=True)
                self.assertEqual(response.status_code, 301)
                self.assertEqual(response['Location'], path + '/?source=example')

    @override_settings(APPEND_SLASH=False)
    def test_disabled_slash_redirects_return_json_404(self):
        response = self.client.get('/forecast-api/election-results/2026vic', secure=True)
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {'detail': 'API endpoint not found.'})

    def test_registered_endpoints_keep_their_handlers(self):
        expected = {
            '/forecast-api/election-summary/2026vic/regular': 'election-summary',
            '/forecast-api/election-summary/2026vic/regular/42': 'election-summary',
            '/forecast-api/submit-report': 'submit-report',
            '/forecast-api/submit-timeseries-update': 'submit-timeseries-update',
            '/forecast-api/submit-results-update': 'submit-results-update',
            '/forecast-api/reset-cache': 'reset-cache',
            '/auth-api/v1/auth/login/': 'login',
            '/auth-api/v1/auth/logout/': 'logout',
            '/admin/login/': 'login',
        }
        for path, name in expected.items():
            with self.subTest(path=path):
                self.assertEqual(resolve(path).url_name, name)
