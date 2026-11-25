from django.contrib import admin

from django.db import transaction
from django.utils import timezone
from forecast_api.models import Election, Forecast, LiveRun

admin.site.register(Election)
admin.site.register(Forecast)


@admin.register(LiveRun)
class LiveRunAdmin(admin.ModelAdmin):
    list_display = ('run_id', 'election', 'official', 'revision', 'replay_completed_at')
    actions = ('select_official', 'clear_official', 'complete_replays')
    readonly_fields = ('run_id', 'election', 'registration', 'official', 'revision', 'latest')

    def has_add_permission(self, request):
        return False

    def has_delete_permission(self, request, obj=None):
        return False

    @admin.action(permissions=['change'], description='Mark selected replays as complete')
    def complete_replays(self, request, queryset):
        count = queryset.filter(registration__kind='replay', latest__isnull=False,
                                replay_completed_at__isnull=True).update(replay_completed_at=timezone.now())
        self.message_user(request, f'Marked {count} replay(s) complete.')

    @admin.action(permissions=['change'], description='Select one public live run as official')
    @transaction.atomic
    def select_official(self, request, queryset):
        run = queryset.first()
        if queryset.count() != 1 or run.registration['kind'] != 'live' or run.registration['visibility'] != 'public':
            self.message_user(request, 'Select exactly one public live run.', level='error')
            return
        LiveRun.objects.filter(election=run.election, official=True).update(official=False)
        queryset.update(official=True)

    @admin.action(permissions=['change'], description='Return selected elections to legacy live reports')
    def clear_official(self, request, queryset):
        queryset.update(official=False)
