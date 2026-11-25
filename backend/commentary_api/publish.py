"""Publish human-written articles while preserving their public links and dates."""
from django.db import IntegrityError, transaction
from django.utils import timezone
from django.utils.html import linebreaks
from rest_framework.exceptions import PermissionDenied, ValidationError
from rest_framework.response import Response
from rest_framework.views import APIView

from auth_api.mixins import ApiAuthMixin
from commentary_api.models import Commentary, Tag


def article_fields(data):
    """Accept plain text. Existing articles authored in Django can still contain HTML."""
    if not isinstance(data, dict) or set(data) - {'text', 'title', 'tags', 'existing_title'}:
        raise ValidationError('Expected text with optional title, tags or existing_title.')
    for field in ('text', 'title', 'existing_title'):
        if field == 'text' or field in data:
            value = data.get(field)
            if not isinstance(value, str) or not value.strip() or '\x00' in value:
                raise ValidationError(f'{field} must be non-empty text.')
    tags = data.get('tags')
    if 'tags' in data and (not isinstance(tags, list) or any(
        not isinstance(tag, str) or not tag.strip() or len(tag.strip()) > 64 or '\x00' in tag for tag in tags
    )):
        raise ValidationError('Tags must be a list of names of 1 to 64 characters.')
    return (linebreaks(data['text'].strip(), autoescape=True),
            sorted({tag.strip() for tag in tags}) if tags is not None else None)


class PublishCommentary(ApiAuthMixin, APIView):
    def put(self, request, key):
        if len(key) > 100:
            raise ValidationError('Article keys can contain up to 100 characters.')
        can_add = request.user.has_perm('commentary_api.add_commentary')
        can_edit = request.user.has_perm('commentary_api.change_commentary')
        if not (can_add or can_edit):
            raise PermissionDenied()
        data = request.data
        html, tags = article_fields(data)
        title = data.get('title', '').strip()
        existing_title = data.get('existing_title', '').strip()
        try:
            with transaction.atomic():
                articles = Commentary.objects.select_for_update()
                article = articles.filter(publication_key=key).first()
                created = False
                if existing_title:
                    if not can_edit:
                        raise PermissionDenied()
                    # Adoption is explicit. Different servers can have different
                    # numeric IDs for the same older article. A missing or
                    # ambiguous title must never turn a replacement into a new post.
                    matches = list(articles.filter(title=existing_title).order_by('pk')[:2])
                    if article is None:
                        if len(matches) != 1 or matches[0].publication_key:
                            return Response({'detail': 'Expected one unassigned article with that title.'}, status=409)
                        article = matches[0]
                        article.publication_key = key
                        article.save(update_fields=['publication_key'])
                    elif matches and (len(matches) != 1 or matches[0].pk != article.pk):
                        return Response({'detail': 'The key and existing title refer to different articles.'}, status=409)
                elif article is None:
                    if not can_add:
                        raise PermissionDenied()
                    if not title:
                        raise ValidationError('A new article needs a title.')
                    article, created = articles.get_or_create(publication_key=key, defaults={
                        'title': title, 'text': html, 'date': timezone.now()})

                fields = []
                if article.text != html:
                    article.text = html
                    fields.append('text')
                if title and article.title != title:
                    article.title = title
                    fields.append('title')
                replace_tags = tags is not None and tags != sorted(article.tags.values_list('name', flat=True))
                if not created and (fields or replace_tags) and not can_edit:
                    raise PermissionDenied()
                if fields:
                    article.save(update_fields=fields)
                if replace_tags:
                    # The original admin allowed duplicate tag names. Reuse an
                    # existing row rather than requiring old tags to be migrated.
                    article.tags.set([Tag.objects.filter(name=name).order_by('pk').first()
                                      or Tag.objects.create(name=name) for name in tags])
                receipt = {'publication_key': key, 'id': article.pk, 'created': created}
        except IntegrityError:
            return Response({'detail': 'Article identity changed concurrently. Retry with the same key.'}, status=409)
        return Response(receipt, status=201 if created else 200)
