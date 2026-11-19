"""Reconstruct one run's compressed chart blocks from its retained reports."""
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import F

from forecast_api.live_data import unpack, write_seat_points
from forecast_api.models import LiveRun, SeatHistoryBlock


class Command(BaseCommand):
    help = 'Rebuild seat win probability, first preference and TCP chart blocks for one run.'

    def add_arguments(self, parser):
        parser.add_argument('run_id')

    @transaction.atomic
    def handle(self, run_id, **options):
        if not LiveRun.objects.filter(pk=run_id).update(revision=F('revision') + 1):
            raise CommandError('Unknown run.')
        run = LiveRun.objects.get(pk=run_id)
        SeatHistoryBlock.objects.filter(run=run).delete()
        reports = run.livepublication_set.exclude(source_time=None).order_by('forecast_id')
        for identity, blob in reports.values_list('forecast_id', 'report').iterator(chunk_size=8):
            write_seat_points(run, identity, unpack(blob))

