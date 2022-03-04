from django.urls import path

from . import views

app_name = 'commentary_api'
urlpatterns = [
    path('all-commentaries',
         views.AllCommentariesResponse.as_view(),  # type: ignore
         name='all-commentaries'),
]