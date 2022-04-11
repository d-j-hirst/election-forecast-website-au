from commentary_api.models import Commentary, Tag

from django.http import Http404
from django.shortcuts import get_list_or_404, get_object_or_404
from rest_framework.response import Response
from django.core.paginator import Paginator

from typing import Any


def serve_commentaries(page, tag):
    ITEMS_PER_PAGE = 6
    try:
        page = int(page)
    except ValueError:
        raise Http404("Invalid page number")
    if tag is not None:
        commentaries: Any = get_list_or_404(Commentary.objects.filter(tags__name=tag).order_by('-date'))
    else:
        commentaries: Any = get_list_or_404(Commentary.objects.order_by('-date'))
    all_tags: Any = get_list_or_404(Tag.objects.all())
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
                "allTags": [a.name for a in all_tags]}
    return Response(response)


def serve_commentary(id):
    commentary: Any = get_object_or_404(Commentary, id=id)
    response = {"id": commentary.id, 
                "title": commentary.title,
                "date": commentary.date,
                "text": commentary.text,
                "tags": [a.name for a in commentary.tags.all()]
            }
    return Response(response)