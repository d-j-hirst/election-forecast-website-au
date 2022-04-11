from rest_framework.views import APIView

from typing import Any

from commentary_api.serve import serve_commentaries, serve_commentary

class AllCommentariesResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request):
        page = request.query_params.get('page', 1)
        tag = request.query_params.get('tag', None)
        return serve_commentaries(page=page, tag=tag)


class CommentaryResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request, id):
        return serve_commentary(id)
