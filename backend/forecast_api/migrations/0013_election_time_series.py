# Generated by Django 3.2.9 on 2022-03-26 10:56

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forecast_api', '0012_alter_forecast_flags'),
    ]

    operations = [
        migrations.AddField(
            model_name='election',
            name='time_series',
            field=models.JSONField(default=str),
        ),
    ]
