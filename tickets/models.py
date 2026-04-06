from django.db import models
from django.contrib.auth.models import User


class Ticket(models.Model):
    class Status(models.TextChoices):
        OPEN = "OPEN", "Open"
        IN_PROGRESS = "IN_PROGRESS", "In Progress"
        RESOLVED = "RESOLVED", "Resolved"
        CLOSED = "CLOSED", "Closed"

    class Priority(models.TextChoices):
        URGENT = "URGENT", "Urgent"
        HIGH = "HIGH", "High"
        MEDIUM = "MEDIUM", "Medium"
        LOW = "LOW", "Low"

    class Category(models.TextChoices):
        TECHNICAL = "TECHNICAL", "Technical Issue"
        BILLING = "BILLING", "Billing Inquiry"
        ACCOUNT = "ACCOUNT", "Account Related"
        FEATURE_REQUEST = "FEATURE_REQUEST", "Feature Request"
        GENERAL_INQUIRY = "GENERAL_INQUIRY", "General Inquiry"

    title = models.CharField(max_length=200)
    description = models.TextField()
    status = models.CharField(max_length=20, choices=Status.choices, default=Status.OPEN)
    priority = models.CharField(max_length=10, choices=Priority.choices, default=Priority.MEDIUM)
    category = models.CharField(max_length=20, choices=Category.choices, null=True, blank=True)
    
    # AI Analysis fields
    ai_category = models.CharField(max_length=50, null=True, blank=True)
    ai_category_confidence = models.FloatField(null=True, blank=True)
    ai_priority = models.CharField(max_length=20, null=True, blank=True)
    ai_sentiment = models.CharField(max_length=20, null=True, blank=True)
    ai_sentiment_score = models.FloatField(null=True, blank=True)
    ai_summary = models.TextField(null=True, blank=True)
    ai_suggested_response = models.TextField(null=True, blank=True)
    ai_entities = models.JSONField(null=True, blank=True)
    ai_processed = models.BooleanField(default=False)
    
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name="tickets_created")
    assigned_to = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        related_name="tickets_assigned",
        null=True,
        blank=True,
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"#{self.id} - {self.title} ({self.status})"


class TicketComment(models.Model):
    """Comments/responses on tickets"""
    ticket = models.ForeignKey(Ticket, on_delete=models.CASCADE, related_name="comments")
    author = models.ForeignKey(User, on_delete=models.CASCADE, related_name="comments")
    content = models.TextField()
    is_ai_suggested = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ["created_at"]
    
    def __str__(self):
        return f"Comment on #{self.ticket.id} by {self.author.username}"


class AgentProfile(models.Model):
    """Extended profile for support agents"""
    class Specialization(models.TextChoices):
        TECHNICAL = "technical", "Technical Support"
        BILLING = "billing", "Billing Support"
        ACCOUNT = "account", "Account Support"
        GENERAL = "general", "General Support"
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="agent_profile")
    specialization = models.CharField(max_length=20, choices=Specialization.choices, default=Specialization.GENERAL)
    is_senior = models.BooleanField(default=False)
    max_concurrent_tickets = models.IntegerField(default=10)
    is_available = models.BooleanField(default=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.get_specialization_display()}"
