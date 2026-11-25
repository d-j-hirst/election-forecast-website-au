from commentary_api.models import Commentary, Tag

from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from django.core.paginator import Paginator

from typing import Any


def serve_commentaries(page, tag):
    ITEMS_PER_PAGE = 6
    try:
        page = int(page)
    except ValueError:
        raise Http404("Invalid page number")
    # Public reads need only the long-established article fields. This also
    # lets the current Commentary page stay available during the schema rollout.
    commentaries = Commentary.objects.defer('publication_key').prefetch_related('tags').order_by('-date', '-pk')
    if tag is not None:
        commentaries = commentaries.filter(tags__name=tag).distinct()
    all_tags = Tag.objects.order_by('name').values_list('name', flat=True).distinct()
    paginator = Paginator(commentaries, ITEMS_PER_PAGE)
    page_commentaries = paginator.get_page(page)
    if page_commentaries is None:
        raise Http404("No commentaries found at this page range")
    response = {"commentaries": [{"id": commentary.id, 
                                "title": commentary.title,
                                "date": commentary.date,
                                "text": commentary.text,
                                "tags": [a.name for a in commentary.tags.all()]
                               } for commentary in page_commentaries],
                "pageCount": paginator.num_pages,
                "allTags": list(all_tags)}
    return Response(response)


def serve_commentary(id):
    commentary: Any = get_object_or_404(Commentary.objects.defer('publication_key'), id=id)
    response = {"id": commentary.id, 
                "title": commentary.title,
                "date": commentary.date,
                "text": commentary.text,
                "tags": [a.name for a in commentary.tags.all()]
            }
    return Response(response)