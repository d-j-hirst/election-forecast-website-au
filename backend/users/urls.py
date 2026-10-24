from django.urls import path

from users.apis import UserMeApi, GenericAuthApi


urlpatterns = [
    path('me/', UserMeApi.as_view(), name='me'),  # type: ignore
    path('generic/', GenericAuthApi.as_view(), name='generic'),  # type: ignore
]
