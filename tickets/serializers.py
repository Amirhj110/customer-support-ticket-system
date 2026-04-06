from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Ticket, TicketComment, AgentProfile


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'is_staff']


class AgentProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialization_display = serializers.CharField(source='get_specialization_display', read_only=True)
    
    class Meta:
        model = AgentProfile
        fields = ['id', 'user', 'specialization', 'specialization_display', 
                  'is_senior', 'max_concurrent_tickets', 'is_available']


class TicketCommentSerializer(serializers.ModelSerializer):
    author_username = serializers.CharField(source='author.username', read_only=True)
    
    class Meta:
        model = TicketComment
        fields = ['id', 'ticket', 'author', 'author_username', 'content', 
                  'is_ai_suggested', 'created_at']
        read_only_fields = ['id', 'author', 'author_username', 'created_at']


class TicketSerializer(serializers.ModelSerializer):
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    comments = TicketCommentSerializer(many=True, read_only=True)
    
    # AI fields
    ai_priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    ai_category_display = serializers.CharField(source='get_category_display', read_only=True)
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'ai_priority_display',
            'category',
            'ai_category_display',
            # AI Analysis fields
            'ai_category',
            'ai_category_confidence',
            'ai_priority',
            'ai_sentiment',
            'ai_sentiment_score',
            'ai_summary',
            'ai_suggested_response',
            'ai_entities',
            'ai_processed',
            # User fields
            'created_by',
            'created_by_username',
            'assigned_to',
            'assigned_to_username',
            # Timestamps
            'created_at',
            'updated_at',
            # Comments
            'comments',
        ]
        read_only_fields = ['id', 'created_by', 'created_by_username', 'created_at', 
                           'updated_at', 'ai_category', 'ai_category_confidence',
                           'ai_priority', 'ai_sentiment', 'ai_sentiment_score',
                           'ai_summary', 'ai_suggested_response', 'ai_entities', 'ai_processed']


class TicketListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for list views"""
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)
    comment_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Ticket
        fields = [
            'id',
            'title',
            'status',
            'priority',
            'category',
            'ai_category',
            'ai_priority',
            'ai_sentiment',
            'ai_processed',
            'created_by_username',
            'assigned_to_username',
            'comment_count',
            'created_at',
            'updated_at',
        ]
    
    def get_comment_count(self, obj):
        return obj.comments.count()


class AIAnalysisRequestSerializer(serializers.Serializer):
    """Serializer for AI analysis request"""
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    ticket_id = serializers.IntegerField(required=False)


class AIAnalysisResponseSerializer(serializers.Serializer):
    """Serializer for AI analysis response"""
    category = serializers.CharField()
    category_confidence = serializers.FloatField()
    priority = serializers.CharField()
    priority_score = serializers.IntegerField()
    sentiment = serializers.CharField()
    sentiment_score = serializers.FloatField()
    entities = serializers.DictField()
    summary = serializers.CharField()
    suggested_response = serializers.CharField()


class DuplicateDetectionRequestSerializer(serializers.Serializer):
    """Serializer for duplicate detection request"""
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
