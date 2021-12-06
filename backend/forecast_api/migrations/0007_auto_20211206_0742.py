# Generated by Django 3.2.9 on 2021-12-06 07:42

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('forecast_api', '0006_alter_forecast_date'),
    ]

    operations = [
        migrations.AddField(
            model_name='forecast',
            name='mode',
            field=models.CharField(choices=[('FC', 'Regular Forecast'), ('NC', 'Nowcast'), ('LF', 'Live Forecast')], default='FC', max_length=2),
        ),
        migrations.AlterField(
            model_name='forecast',
            name='date',
            field=models.DateTimeField(),
        ),
    ]
