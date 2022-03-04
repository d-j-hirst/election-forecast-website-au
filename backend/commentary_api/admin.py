from django.contrib import admin

from commentary_api.models import Commentary, Tag

admin.site.register(Commentary)
admin.site.register(Tag)