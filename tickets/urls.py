from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import (
    TicketViewSet, TicketCommentViewSet, 
    analyze_ticket, detect_duplicates, agents_list, health_check, register
)

router = DefaultRouter()
router.register(r"tickets", TicketViewSet, basename="ticket")

urlpatterns = [
    path("", include(router.urls)),
    # Comments (nested under tickets in view)
    path("tickets/<int:ticket_pk>/comments/", TicketCommentViewSet.as_view({
        'get': 'list',
        'post': 'create'
    }), name="ticket-comments-list"),
    path("tickets/<int:ticket_pk>/comments/<int:pk>/", TicketCommentViewSet.as_view({
        'get': 'retrieve',
        'put': 'update',
        'delete': 'destroy'
    }), name="ticket-comments-detail"),
    # AI endpoints
    path("ai/analyze/", analyze_ticket, name="ai-analyze"),
    path("ai/detect-duplicates/", detect_duplicates, name="ai-detect-duplicates"),
    path("ai/agents/", agents_list, name="ai-agents"),
    # Health check
    path("health/", health_check, name="health-check"),
    # User registration
    path("register/", register, name="user-register"),
]
