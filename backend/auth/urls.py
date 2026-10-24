from django.urls import path

from auth.apis import LoginApi, LogoutApi


# Password login is retained for the uploader. Retired Google authentication has
# no route or configuration switch; browser administration uses Django's admin.
urlpatterns = [
    path('login/', LoginApi.as_view(), name='login'),  # type: ignore
    path('logout/', LogoutApi.as_view(), name='logout'),  # type: ignore
]
