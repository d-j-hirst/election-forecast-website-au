from django.db import migrations, models
from django.db.models import Count


INDEX_NAME = 'forecast_unique_election_mode_date'


def ensure_unique_timepoints(apps, schema_editor):
    Forecast = apps.get_model('forecast_api', 'Forecast')
    duplicate = (
        Forecast.objects
        .values('election_id', 'mode', 'date')
        .annotate(total=Count('id'))
        .filter(total__gt=1)
        # Django 5 rejects first() on an unordered aggregate queryset rather
        # than implicitly ordering by a primary key which is not grouped here.
        .order_by('election_id', 'mode', 'date')
        .first()
    )
    if duplicate is not None:
        # Never guess which large report is authoritative. An operator should
        # inspect and resolve duplicates before retrying this atomic migration.
        raise RuntimeError(
            'Cannot add the forecast timepoint constraint because duplicate '
            f'reports exist: {duplicate}'
        )


class Migration(migrations.Migration):

    dependencies = [
        ('forecast_api', '0015_auto_20220621_0319'),
    ]

    operations = [
        migrations.RunPython(
            ensure_unique_timepoints,
            migrations.RunPython.noop,
        ),
        migrations.SeparateDatabaseAndState(
            database_operations=[
                # SQLite can add an index without rebuilding the large table;
                # the preflight above avoids silently selecting a duplicate.
                # Django runs this migration transactionally, so interruption
                # leaves both the index and migration record applied or neither.
                migrations.RunSQL(
                    sql=(
                        f'CREATE UNIQUE INDEX {INDEX_NAME} '
                        'ON forecast_api_forecast '
                        '(election_id, mode, date)'
                    ),
                    reverse_sql=f'DROP INDEX {INDEX_NAME}',
                ),
            ],
            state_operations=[
                migrations.AddConstraint(
                    model_name='forecast',
                    constraint=models.UniqueConstraint(
                        fields=('election', 'mode', 'date'),
                        name=INDEX_NAME,
                    ),
                ),
            ],
        ),
    ]
