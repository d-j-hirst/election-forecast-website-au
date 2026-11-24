"""Reconstruct one run's compressed chart blocks from its retained reports."""
from django.core.management.base import BaseCommand, CommandError
from django.db import transaction
from django.db.models import F

from forecast_api.live_data import election_history_point, unpack, write_seat_points
from forecast_api.models import LiveRun, SeatHistoryBlock


class Command(BaseCommand):
    help = 'Rebuild seat chart blocks and statewide history points, including preference flows, for one run.'

    def add_arguments(self, parser):
        parser.add_argument('run_id')

    @transaction.atomic
    def handle(self, run_id, **options):
        if not LiveRun.objects.filter(pk=run_id).update(revision=F('revision') + 1):
            raise CommandError('Unknown run.')
        run = LiveRun.objects.get(pk=run_id)
        SeatHistoryBlock.objects.filter(run=run).delete()
        reports = run.livepublication_set.exclude(source_time=None).order_by('forecast_id')
        for record in reports.only('forecast_id', 'report', 'history_point').iterator(chunk_size=8):
            report = unpack(record.report)
            write_seat_points(run, record.forecast_id, report)
            # Reuse estimates already in the frozen publication if its chart
            # index was built before preference histories were supported.
            point = election_history_point(report)
            if point != record.history_point:
                record.history_point = point
                record.save(update_fields=['history_point'])

