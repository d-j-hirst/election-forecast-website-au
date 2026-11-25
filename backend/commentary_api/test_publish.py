"""Regression checks for article links, permissions and plain-text publication."""
from django.contrib.auth import get_user_model
from django.contrib.auth.models import Permission
from django.test import TestCase, override_settings
from django.utils import timezone
from rest_framework.test import APIClient

from .models import Commentary


@override_settings(SECURE_SSL_REDIRECT=False)
class ArticleTests(TestCase):
    url = '/commentary-api/publish/vic-count/'

    def setUp(self):
        self.client = APIClient()
        self.writer = get_user_model().objects.create_user('editor@example.test')

    def grant(self, *permissions):
        self.writer.user_permissions.set(Permission.objects.filter(
            content_type__app_label='commentary_api', codename__in=permissions))
        self.client.force_authenticate(get_user_model().objects.get(pk=self.writer.pk))

    def send(self, **data):
        return self.client.put(self.url, data, format='json')

    def test_create_retry_edit_and_preserve_links_and_formatting(self):
        self.grant('add_commentary', 'change_commentary')
        body = dict(title='Election night', text='One & two\nnext line\n\n<em>literal</em>', tags=['A & B'])
        receipt = self.send(**body)
        self.assertEqual(receipt.status_code, 201)
        article = Commentary.objects.get()
        self.assertEqual(receipt.data, {'publication_key': 'vic-count', 'id': article.pk, 'created': True})
        self.assertEqual(article.text, '<p>One &amp; two<br>next line</p>\n\n<p>&lt;em&gt;literal&lt;/em&gt;</p>')
        self.assertEqual(self.send(**body).data['id'], article.pk)
        self.assertEqual(self.send(text='New text').status_code, 200)
        detail = self.client.get(f'/commentary-api/commentary/{article.pk}/').data
        self.assertEqual((detail['text'], detail['tags'], detail['title'], detail['date']),
                         ('<p>New text</p>', ['A & B'], 'Election night', article.date))
        self.assertEqual(self.send(text='Another edit', tags=[]).status_code, 200)
        self.assertFalse(article.tags.exists())
        self.assertEqual(Commentary.objects.count(), 1)

    def test_permissions_and_legacy_adoption(self):
        body = dict(text='Published', title='New', existing_title='Old')
        old = Commentary.objects.create(title='Old', text='<p>Old</p>', date=timezone.now())
        self.assertIn(self.send(**body).status_code, (401, 403))
        self.grant('add_commentary')
        self.assertEqual(self.send(**body).status_code, 403)
        self.grant('change_commentary')
        self.assertEqual(self.send(text='No record').status_code, 403)
        self.assertEqual(self.send(**dict(body, existing_title='Absent')).status_code, 409)
        duplicate = Commentary.objects.create(title='Old', text='Other', date=timezone.now())
        self.assertEqual(self.send(**body).status_code, 409)
        duplicate.delete()
        self.assertEqual(self.send(**body).data['id'], old.pk)
        self.assertEqual(self.send(**body).data['id'], old.pk)
        self.assertEqual(self.send(text='   ').status_code, 400)
        self.assertEqual(self.send(text='Changed', tags='bad').status_code, 400)
        old.refresh_from_db()
        self.assertEqual((old.title, old.text), ('New', '<p>Published</p>'))

    def test_first_article_and_empty_list_work_without_tags(self):
        url = '/commentary-api/all-commentaries'
        self.assertEqual(self.client.get(url).data['commentaries'], [])
        self.grant('add_commentary')
        self.assertEqual(self.send(title='First', text='Hello').status_code, 201)
        self.assertEqual(self.send(text='Hello').status_code, 200)
        self.assertEqual(self.send(text='Changed').status_code, 403)
        self.assertEqual(self.client.get(url).data['allTags'], [])
        self.assertEqual(len(self.client.get(url).data['commentaries']), 1)
        self.assertEqual(self.client.get(url, {'tag': 'unpublished'}).data['commentaries'], [])
