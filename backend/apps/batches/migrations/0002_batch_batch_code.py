from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('batches', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='batch',
            name='batch_code',
            field=models.CharField(default='', max_length=20, unique=True),
            preserve_default=False,
        ),
    ]
