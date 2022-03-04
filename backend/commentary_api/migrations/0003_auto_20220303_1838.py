# Generated by Django 3.2.9 on 2022-03-03 18:38

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('commentary_api', '0002_rename_election_tag_commentary'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='tag',
            name='commentary',
        ),
        migrations.AddField(
            model_name='commentary',
            name='tags',
            field=models.ManyToManyField(to='commentary_api.Tag'),
        ),
    ]
