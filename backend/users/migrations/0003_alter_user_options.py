# Generated by Django 3.2.9 on 2021-12-03 10:45

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0002_alter_user_options'),
    ]

    operations = [
        migrations.AlterModelOptions(
            name='user',
            options={'permissions': (('view_forecasts', 'View forecasts'), ('submit_forecasts', 'Submit forecasts'))},
        ),
    ]
