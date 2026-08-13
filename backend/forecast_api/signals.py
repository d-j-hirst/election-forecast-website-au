from django.db import transaction
from django.db.models.signals import pre_delete
from django.dispatch import receiver

from forecast_api.cache_utils import (
    clear_forecast_cache,
    clear_results_cache,
    clear_timeseries_cache,
)
from forecast_api.history import MODE_FIELDS, remove_history_point
from forecast_api.models import Election, Forecast


@receiver(pre_delete, sender=Election)
def clear_deleted_election_caches(sender, instance, **kwargs):
    code = instance.code

    def clear_caches():
        # Cache entries do not expire in production. Election deletion is rare,
        # but leaving these entries behind could keep serving a deleted election
        # or contaminate a replacement created with the same code.
        for mode in MODE_FIELDS:
            clear_forecast_cache(code, mode)
            clear_timeseries_cache(code, mode)
        clear_results_cache(code)

    # Do not hide the election from readers until its database deletion commits.
    transaction.on_commit(clear_caches)


@receiver(pre_delete, sender=Forecast)
def remove_deleted_forecast_from_history(sender, instance, **kwargs):
    if instance.election_id is None or instance.mode not in MODE_FIELDS:
        return

    origin = kwargs.get('origin')
    if (
        isinstance(origin, Election)
        or getattr(origin, 'model', None) is Election
    ):
        # Rewriting a child series while its parent Election is cascading away
        # is pure overhead. `origin` is available on current production Django;
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
    history_changed = remove_history_point(
        election,
        instance.mode,
        instance.date,
    )

    def clear_caches():
        clear_forecast_cache(election.code, instance.mode)
        if history_changed:
            clear_timeseries_cache(election.code, instance.mode)

    transaction.on_commit(clear_caches)

    # This intentionally remains per-row: bulk forecast deletion and direct
    # admin edits are rare, and batching signals adds global/request state. Use
    # the explicit reconstruction endpoint after out-of-band or extensive edits.
