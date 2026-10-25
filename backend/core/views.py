from django.conf import settings
from django.http import HttpResponsePermanentRedirect, JsonResponse
from django.urls import resolve
from django.views.decorators.csrf import csrf_exempt
from django.views.generic import TemplateView

# Public deep links load the shell; React presents a not-found page where needed.
catchall = TemplateView.as_view(template_name='index.html')


@csrf_exempt
def api_not_found(request):
    """Return a stateless API error without reading credentials or request data."""
    # This explicit fallback also runs in DEBUG mode. Since it prevents Django's
    # CommonMiddleware from seeing a missing route, retain the existing slash
    # redirect only when adding the slash reaches a registered API endpoint.
    if settings.APPEND_SLASH and not request.path_info.endswith('/'):
        match = resolve(request.path_info + '/')
        if match.func is not api_not_found and getattr(match.func, 'should_append_slash', True):
            return HttpResponsePermanentRedirect(request.get_full_path(force_append_slash=True))

    # Exemption is safe for this terminal response: no view, session or mutation
    # is dispatched, and unknown POSTs receive the same JSON contract as GETs.
    return JsonResponse({'detail': 'API endpoint not found.'}, status=404)
