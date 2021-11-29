from django.urls import path, include

from auth.apis import LoginApi, GoogleLoginApi, LogoutApi

# Note: type checking ignored here because these are
# dependent on drf-jwt which doesn't have available typing information

login_patterns = [
    path('', LoginApi.as_view(), name='login'),  # type: ignore
    path('google/', GoogleLoginApi.as_view(), name='login-with-google'),  # type: ignore
]

urlpatterns = [
    path('login/', include(login_patterns)),
    path('logout/', LogoutApi.as_view(), name='logout'),  # type: ignore
]