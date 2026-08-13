from django.core.cache import cache


def clear_forecast_cache(code: str, mode: str) -> None:
    keys = [
        f'forecast_recent_id_{mode}_{code}',
        f'forecast_recent_resp_{mode}_{code}',
        f'forecast_archives_resp_{code}',
    ]
    cache.delete_many(keys)


def clear_timeseries_cache(code: str, mode: str) -> None:
    keys = [
        f'timeseries_recent_id_{mode}_{code}',
        f'timeseries_recent_resp_{mode}_{code}',
    ]
    cache.delete_many(keys)


def clear_results_cache(code: str) -> None:
    keys = [
        f'results_recent_id_{code}',
        f'results_recent_resp_{code}',
    ]
    cache.delete_many(keys)
