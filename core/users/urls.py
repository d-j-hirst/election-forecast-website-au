from django.urls import path

from users.apis import UserMeApi, UserInitApi, GenericAuthApi


urlpatterns = [
    path('me/', UserMeApi.as_view(), name='me'),
    path('generic/', GenericAuthApi.as_view(), name='generic'),
    path('init/', UserInitApi.as_view(), name='init'),
]