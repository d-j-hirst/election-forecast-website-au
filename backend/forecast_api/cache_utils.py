import logging

from django.core.cache import cache
from django.db import connection


logger = logging.getLogger(__name__)
RESPONSE_CACHE_TTL = 60 * 60


def response_cache_key(code, election_id, scope, revision):
    # Callers obtain identity/revision from the database on every request. The
    # public code is included because history/results responses echo that code.
    return f'forecast:v2:{code}:e{election_id}:{scope}:r{revision}'


def get_cached_response(key):
    # A caller inside a transaction may see unpublished data or a snapshot that
    # later rolls back. Keep those reads out of the shared response cache.
    if connection.in_atomic_block:
        return None
    try:
        return cache.get(key)
    except Exception as exc:
        # Cache availability must not hide authoritative database responses.
        # Log scope/type only: exception messages may contain serialized data.
        logger.warning('Response cache get failed for %s (%s)', key, type(exc).__name__)
        return None


def set_cached_response(key, body):
    if connection.in_atomic_block:
        return
    try:
        # Expiry bounds storage retention; the revision, not expiry, establishes
        # freshness. Some backends return False instead of raising on failure.
        stored = cache.set(key, body, timeout=RESPONSE_CACHE_TTL)
        if stored is False:
            logger.warning('Response cache set declined for %s', key)
    except Exception as exc:
        logger.warning('Response cache set failed for %s (%s)', key, type(exc).__name__)
