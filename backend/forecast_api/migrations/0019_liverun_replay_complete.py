from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('forecast_api', '0018_live_publication')]
    operations = [
        migrations.AddField(model_name='liverun', name='replay_completed_at',
                            field=models.DateTimeField(null=True, editable=False)),
    ]
