from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ('forecast_api', '0016_forecast_unique_timepoint'),
    ]

    operations = [
        # Existing elections start in a new cache namespace at revision zero.
        # Reports and history retain their existing contents and public IDs.
        migrations.AddField(
            model_name='election',
            name='report_revision',
            field=models.PositiveBigIntegerField(default=0, editable=False),
        ),
    ]
