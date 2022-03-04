from rest_framework.views import APIView

from typing import Any

from commentary_api.serve import serve_commentaries

class AllCommentariesResponse(APIView):
    authentication_classes = []
    permission_classes = []
    def get(self, request):
        return serve_commentaries()
