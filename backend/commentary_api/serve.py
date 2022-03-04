from commentary_api.models import Commentary, Tag

from django.shortcuts import get_list_or_404
from rest_framework.response import Response

from typing import Any


def serve_commentaries():
    commentaries: Any = get_list_or_404(Commentary)
    if commentaries is None:
        raise Exception('Could not find any commentaries!')
    responses = [{"id": commentary.id, 
                  "title": commentary.title,
                  "date": commentary.date,
                  "text": commentary.text,
                  "tags": [a.name for a in commentary.tags.all()]
                 } for commentary in commentaries]
    print("Serving commentaries")
    return Response(responses)