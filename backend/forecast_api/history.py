from datetime import datetime, timezone
from typing import Any, Dict, Iterable, List

from django.utils.dateparse import parse_datetime

from forecast_api.models import Election, Forecast


MODE_FIELDS = {
    Forecast.Mode.REGULAR_FORECAST: (
        'timeseries_fc',
        'timeseries_fc_version',
    ),
    Forecast.Mode.NOWCAST: (
        'timeseries_nc',
        'timeseries_nc_version',
    ),
    Forecast.Mode.LIVE_FORECAST: (
        'timeseries_lf',
        'timeseries_lf_version',
    ),
}


class HistoryCorruptionError(RuntimeError):
    pass


def history_model_fields(modes: Iterable[str]) -> List[str]:
    # `code` is cheap to include and keeps reconstruction helpers from causing
    # a deferred-field query if they need it for diagnostics or cache keys.
    fields = ['id', 'code']
    for mode in modes:
        fields.extend(MODE_FIELDS[mode])
    return fields


def canonical_history_date(value: Any) -> str:
    # The frontend currently reads fixed wall-clock fields from this string
    # rather than applying its timezone offset, so every writer must emit UTC.
    # Pin the representation explicitly instead of depending on isoformat().
    # Normal uploads use whole seconds, but preserve fractional seconds if an
    # out-of-band report has them: history replacement must use the same exact
    # timepoint identity as the Forecast uniqueness constraint.
    timestamp = _timestamp_key(value)
    formatted = timestamp.strftime('%Y-%m-%d %H:%M:%S')
    if timestamp.microsecond:
        formatted += f'.{timestamp.microsecond:06d}'
    return f'{formatted}+00:00'


def build_history_point(
    report: Dict[str, Any],
    report_date: datetime,
    label: str,
) -> Dict[str, Any]:
    # This compact, stable subset is the history API contract. Full reports
    # remain the authoritative source for explicit reconstruction.
    return {
        'date': canonical_history_date(report_date),
        'label': str(label),
        'majorityWinPc': report['majorityWinPc'],
        'minorityWinPc': report['minorityWinPc'],
        'mostSeatsWinPc': report['mostSeatsWinPc'],
        'overallWinPc': report['overallWinPc'],
        'tppFrequencies': report['tppFrequencies'],
        'fpFrequencies': report.get('fpFrequencies', []),
        'coalitionFpFrequencies': report.get(
            'coalitionFpFrequencies', []
        ),
        'seatCountFrequencies': report['seatCountFrequencies'],
        'coalitionSeatCountFrequencies': report.get(
            'coalitionSeatCountFrequencies', []
        ),
    }


def get_series_from_forecasts(
    forecasts: Iterable[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    return [
        build_history_point(
            forecast['report'],
            forecast['date'],
            forecast['label'],
        )
        for forecast in forecasts
    ]


def _timestamp_key(value: Any) -> datetime:
    if isinstance(value, datetime):
        parsed = value
    else:
        parsed = parse_datetime(str(value))
    if parsed is None:
        raise ValueError(f'Invalid forecast history timestamp: {value}')
    if parsed.tzinfo is None:
        # Older history entries were written as UTC even when their strings did
        # not carry an offset. Preserve that established interpretation.
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed.astimezone(timezone.utc)


def _current_series(election: Election, mode: str) -> List[Dict[str, Any]]:
    series_field, _ = MODE_FIELDS[mode]
    series = getattr(election, series_field)
    if isinstance(series, list):
        return list(series)
    # Empty strings are the legacy JSONField default for elections which have
    # never had this forecast mode; other shapes indicate stored corruption.
    if series in ('', None):
        return []
    raise HistoryCorruptionError(
        f'Stored {mode} history for {election.code} is not a list; '
        f'run a complete {mode} reconstruction.'
    )


def _point_timestamp(
    point: Dict[str, Any],
    election: Election,
    mode: str,
) -> datetime:
    try:
        return _timestamp_key(point['date'])
    except (KeyError, TypeError, ValueError) as exc:
        # This is damaged server state, not a bad upload request. RuntimeError
        # deliberately bypasses ApiErrorsMixin's HTTP-400 conversion.
        raise HistoryCorruptionError(
            f'Stored {mode} history for {election.code} has an invalid date; '
            f'run a complete {mode} reconstruction.'
        ) from exc


def _save_series(
    election: Election,
    mode: str,
    series: List[Dict[str, Any]],
) -> None:
    series_field, version_field = MODE_FIELDS[mode]
    setattr(election, series_field, series)
    setattr(election, version_field, getattr(election, version_field) + 1)
    election.save(update_fields=[series_field, version_field])


def upsert_history_point(
    election: Election,
    mode: str,
    report_date: datetime,
    label: str,
    report: Dict[str, Any],
) -> bool:
    target_timestamp = _timestamp_key(report_date)
    old_series = _current_series(election, mode)
    new_point = build_history_point(report, report_date, label)
    new_series = [
        point
        for point in old_series
        if _point_timestamp(point, election, mode) != target_timestamp
    ]
    # A report identity includes its full timestamp, not just its calendar day.
    # Multiple reports for one mode can legitimately be uploaded on the same day.
    new_series.append(new_point)
    new_series.sort(key=lambda point: _point_timestamp(point, election, mode))

    if new_series == old_series:
        return False
    _save_series(election, mode, new_series)
    return True


def remove_history_point(
    election: Election,
    mode: str,
    report_date: datetime,
) -> bool:
    target_timestamp = _timestamp_key(report_date)
    old_series = _current_series(election, mode)
    new_series = [
        point
        for point in old_series
        if _point_timestamp(point, election, mode) != target_timestamp
    ]
    if new_series == old_series:
        return False
    _save_series(election, mode, new_series)
    return True


def rebuild_history(
    election: Election,
    modes: Iterable[str],
) -> Dict[str, int]:
    # Rebuilds deliberately derive every point from Forecast records. This is
    # the repair path after a manual deletion or an interrupted past upload.
    rebuilt = {}
    update_fields = []
    for mode in modes:
        forecasts = (
            Forecast.objects
            .filter(election=election, mode=mode)
            .order_by('date')
            .values('date', 'label', 'report')
            .iterator(chunk_size=20)
        )
        series = get_series_from_forecasts(forecasts)
        series_field, version_field = MODE_FIELDS[mode]
        setattr(election, series_field, series)
        setattr(election, version_field, getattr(election, version_field) + 1)
        update_fields.extend([series_field, version_field])
        rebuilt[mode] = len(series)

    election.save(update_fields=update_fields)
    return rebuilt
