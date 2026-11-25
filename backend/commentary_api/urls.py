from django.urls import path

from . import views
from .publish import PublishCommentary

app_name = 'commentary_api'
urlpatterns = [
    path('publish/<slug:key>/', PublishCommentary.as_view(), name='publish'),
    path('all-commentaries',
         views.AllCommentariesResponse.as_view(),  # type: ignore
         name='all-commentaries'),
    path('commentary/<int:id>/',
         views.CommentaryResponse.as_view(),  # type: ignore
         name='commentary'),
]