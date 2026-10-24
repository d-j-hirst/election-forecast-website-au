from django.db.models.signals import pre_delete
from django.dispatch import receiver

from forecast_api.history import MODE_FIELDS, remove_history_point
from forecast_api.models import Election, Forecast


@receiver(pre_delete, sender=Forecast)
def remove_deleted_forecast_from_history(sender, instance, **kwargs):
    if instance.election_id is None or instance.mode not in MODE_FIELDS:
        return

    origin = kwargs.get('origin')
    if (
        isinstance(origin, Election)
        or getattr(origin, 'model', None) is Election
    ):
        # Readers check election existence before using cached bodies, so a
        # parent cascade needs neither child revision updates nor cache deletes.
        # `origin` is available on current production Django;
        # older Django versions simply follow the safe, if slower, path below.
        return

    series_field, version_field = MODE_FIELDS[instance.mode]
    try:
        election = (
            Election.objects
            .select_for_update()
            .only('id', 'code', series_field, version_field)
            .get(pk=instance.election_id)
        )
    except Election.DoesNotExist:
        return

    # pre_delete keeps the normal lock order as Election then Forecast, matching
    # submission. The surrounding delete transaction rolls this back if the
    # actual deletion fails.
    remove_history_point(
        election,
        instance.mode,
        instance.date,
    )

    # A missing history point must not prevent publication of the report's
    # removal from latest/archive responses. This rolls back with the deletion.
    election.advance_report_revision()

    # This intentionally remains per-row: bulk forecast deletion and direct
    # admin edits are rare, and batching signals adds global/request state. Use
    # the explicit reconstruction endpoint after out-of-band or extensive edits.
