# Generated by Django 4.2.1 on 2023-06-03 06:36

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('posts', '0012_remove_post_comments_count_remove_post_likes_count'),
    ]

    operations = [
        migrations.AlterField(
            model_name='post',
            name='ticker',
            field=models.CharField(default=None, max_length=10),
            preserve_default=False,
        ),
    ]
