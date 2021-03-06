# Generated by Django 3.2.9 on 2022-03-27 09:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forecast_api', '0013_election_time_series'),
    ]

    operations = [
        migrations.RenameField(
            model_name='election',
            old_name='time_series',
            new_name='timeseries_fc',
        ),
        migrations.AddField(
            model_name='election',
            name='timeseries_fc_version',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='election',
            name='timeseries_lf',
            field=models.JSONField(default=str),
        ),
        migrations.AddField(
            model_name='election',
            name='timeseries_lf_version',
            field=models.IntegerField(default=0),
        ),
        migrations.AddField(
            model_name='election',
            name='timeseries_nc',
            field=models.JSONField(default=str),
        ),
        migrations.AddField(
            model_name='election',
            name='timeseries_nc_version',
            field=models.IntegerField(default=0),
        ),
    ]
