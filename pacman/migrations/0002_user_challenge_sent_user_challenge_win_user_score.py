# Generated by Django 4.1.6 on 2023-12-22 04:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('pacman', '0001_initial'),
    ]

    operations = [
        migrations.AddField(
            model_name='user',
            name='challenge_sent',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='user',
            name='challenge_win',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='user',
            name='score',
            field=models.IntegerField(default=0),
            preserve_default=False,
        ),
    ]
