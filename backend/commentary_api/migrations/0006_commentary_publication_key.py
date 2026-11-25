from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [('commentary_api', '0005_delete_image')]
    operations = [
        migrations.AddField(
            model_name='commentary',
            name='publication_key',
            field=models.SlugField(blank=True, max_length=100, null=True, unique=True),
        ),
    ]
