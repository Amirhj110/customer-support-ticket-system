from django.contrib import admin
from .models import Ticket, TicketComment, AgentProfile


@admin.register(Ticket)
class TicketAdmin(admin.ModelAdmin):
    list_display = ['id', 'title', 'status', 'priority', 'category', 'created_by', 'assigned_to', 'created_at']
    list_filter = ['status', 'priority', 'ai_category', 'ai_sentiment', 'created_at']
    search_fields = ['title', 'description', 'created_by__username']
    raw_id_fields = ['created_by', 'assigned_to']
    readonly_fields = ['ai_category', 'ai_category_confidence', 'ai_priority', 'ai_sentiment', 
                      'ai_sentiment_score', 'ai_summary', 'ai_suggested_response', 'ai_entities', 
                      'ai_processed', 'created_at', 'updated_at']


@admin.register(TicketComment)
class TicketCommentAdmin(admin.ModelAdmin):
    list_display = ['id', 'ticket', 'author', 'is_ai_suggested', 'created_at']
    list_filter = ['is_ai_suggested', 'created_at']
    search_fields = ['content', 'author__username', 'ticket__title']
    raw_id_fields = ['ticket', 'author']


@admin.register(AgentProfile)
class AgentProfileAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'specialization', 'is_senior', 'is_available', 'max_concurrent_tickets']
    list_filter = ['specialization', 'is_senior', 'is_available']
    search_fields = ['user__username', 'user__email']
    raw_id_fields = ['user']
