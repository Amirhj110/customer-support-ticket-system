# Generated migration for new models and fields

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ('tickets', '0001_initial'),
    ]

    operations = [
        # Add new fields to Ticket model
        migrations.AddField(
            model_name='ticket',
            name='ai_category',
            field=models.CharField(blank=True, max_length=50, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_category_confidence',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_entities',
            field=models.JSONField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_processed',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_priority',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_sentiment',
            field=models.CharField(blank=True, max_length=20, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_sentiment_score',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_suggested_response',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='ai_summary',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name='ticket',
            name='category',
            field=models.CharField(
                blank=True,
                choices=[
                    ('TECHNICAL', 'Technical Issue'),
                    ('BILLING', 'Billing Inquiry'),
                    ('ACCOUNT', 'Account Related'),
                    ('FEATURE_REQUEST', 'Feature Request'),
                    ('GENERAL_INQUIRY', 'General Inquiry')
                ],
                max_length=20,
                null=True
            ),
        ),
        migrations.AddField(
            model_name='ticket',
            name='priority',
            field=models.CharField(
                choices=[
                    ('URGENT', 'Urgent'),
                    ('HIGH', 'High'),
                    ('MEDIUM', 'Medium'),
                    ('LOW', 'Low')
                ],
                default='MEDIUM',
                max_length=10
            ),
        ),
        # Create TicketComment model
        migrations.CreateModel(
            name='TicketComment',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField()),
                ('is_ai_suggested', models.BooleanField(default=False)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to=settings.AUTH_USER_MODEL)),
                ('ticket', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='comments', to='tickets.ticket')),
            ],
            options={
                'ordering': ['created_at'],
            },
        ),
        # Create AgentProfile model
        migrations.CreateModel(
            name='AgentProfile',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('specialization', models.CharField(
                    choices=[
                        ('technical', 'Technical Support'),
                        ('billing', 'Billing Support'),
                        ('account', 'Account Support'),
                        ('general', 'General Support')
                    ],
                    default='general',
                    max_length=20
                )),
                ('is_senior', models.BooleanField(default=False)),
                ('max_concurrent_tickets', models.IntegerField(default=10)),
                ('is_available', models.BooleanField(default=True)),
                ('user', models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, related_name='agent_profile', to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
