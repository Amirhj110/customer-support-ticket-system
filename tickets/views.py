from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.utils import timezone
from django.db.models import Count, Q

from .models import Ticket, TicketComment, AgentProfile
from .serializers import (
    TicketSerializer, TicketListSerializer, TicketCommentSerializer,
    AgentProfileSerializer, AIAnalysisResponseSerializer, DuplicateDetectionRequestSerializer
)
from ai.services import TicketAIProcessor


class TicketViewSet(viewsets.ModelViewSet):
    serializer_class = TicketSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TicketListSerializer
        return TicketSerializer

    def get_queryset(self):
        user = self.request.user
        queryset = Ticket.objects.all().prefetch_related('comments')
        
        if user.is_staff:
            # Staff can see all tickets with filtering
            queryset = queryset
        else:
            # Regular users see only their tickets
            queryset = queryset.filter(created_by=user) | queryset.filter(assigned_to=user)
        
        # Apply filters
        status_filter = self.request.query_params.get('status')
        priority_filter = self.request.query_params.get('priority')
        category_filter = self.request.query_params.get('category')
        ai_processed = self.request.query_params.get('ai_processed')
        
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        if priority_filter:
            queryset = queryset.filter(priority=priority_filter)
        if category_filter:
            queryset = queryset.filter(ai_category=category_filter)
        if ai_processed is not None:
            queryset = queryset.filter(ai_processed=ai_processed.lower() == 'true')
        
        return queryset.distinct()

    def perform_create(self, serializer):
        ticket = serializer.save(created_by=self.request.user)
        # Auto-process with AI
        self._process_with_ai(ticket)

    def perform_update(self, serializer):
        ticket = self.get_object()
        user = self.request.user
        if not (user.is_staff or ticket.created_by == user or ticket.assigned_to == user):
            raise PermissionDenied("You are not allowed to update this ticket.")
        
        ticket = serializer.save()
        # Re-process with AI if title or description changed
        if ticket.ai_processed:
            # Only re-process if explicitly requested
            pass

    def perform_destroy(self, instance):
        user = self.request.user
        if not (user.is_staff or instance.created_by == user):
            raise PermissionDenied("You are not allowed to delete this ticket.")
        instance.delete()
    
    def _process_with_ai(self, ticket):
        """Process ticket with AI"""
        try:
            processor = TicketAIProcessor()
            analysis = processor.process_ticket(ticket.title, ticket.description)
            analysis['processing_timestamp'] = timezone.now().isoformat()
            
            # Update ticket with AI analysis
            ticket.ai_category = analysis['category']
            ticket.ai_category_confidence = analysis['category_confidence']
            ticket.ai_priority = analysis['priority']
            ticket.ai_sentiment = analysis['sentiment']
            ticket.ai_sentiment_score = analysis['sentiment_score']
            ticket.ai_summary = analysis['summary']
            ticket.ai_suggested_response = analysis['suggested_response']
            ticket.ai_entities = analysis['entities']
            ticket.ai_processed = True
            
            # Auto-set priority based on AI analysis if not manually set
            if ticket.priority == Ticket.Priority.MEDIUM:
                priority_map = {'urgent': Ticket.Priority.URGENT, 'high': Ticket.Priority.HIGH, 
                               'medium': Ticket.Priority.MEDIUM, 'low': Ticket.Priority.LOW}
                ticket.priority = priority_map.get(analysis['priority'], Ticket.Priority.MEDIUM)
            
            ticket.save()
            return analysis
        except Exception as e:
            print(f"AI processing error: {e}")
            return None
    
    @action(detail=True, methods=['post'])
    def analyze(self, request, pk=None):
        """Re-analyze a ticket with AI"""
        ticket = self.get_object()
        analysis = self._process_with_ai(ticket)
        
        if analysis:
            return Response({
                'success': True,
                'analysis': analysis,
                'ticket': TicketSerializer(ticket).data
            })
        return Response({'success': False, 'message': 'AI processing failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    @action(detail=True, methods=['post'])
    def assign_agent(self, request, pk=None):
        """Auto-assign an agent based on ticket category"""
        ticket = self.get_object()
        
        if not request.user.is_staff:
            raise PermissionDenied("Only staff can assign agents")
        
        # Get available agents
        available_agents = AgentProfile.objects.filter(is_available=True)
        agents_data = []
        for agent in available_agents:
            current_tickets = Ticket.objects.filter(
                assigned_to=agent.user, 
                status__in=[Ticket.Status.OPEN, Ticket.Status.IN_PROGRESS]
            ).count()
            if current_tickets < agent.max_concurrent_tickets:
                agents_data.append({
                    'id': agent.id,
                    'user_id': agent.user_id,
                    'username': agent.user.username,
                    'specialization': agent.specialization,
                    'is_senior': agent.is_senior,
                    'current_tickets': current_tickets
                })
        
        # Get ticket analysis data
        ticket_data = {
            'category': ticket.ai_category,
            'priority': ticket.ai_priority
        }
        
        processor = TicketAIProcessor()
        suggested_agent = processor.suggest_assignee(ticket_data, agents_data)
        
        if suggested_agent:
            from django.contrib.auth.models import User
            agent_user = User.objects.get(id=suggested_agent['user_id'])
            ticket.assigned_to = agent_user
            ticket.save()
            
            return Response({
                'success': True,
                'assigned_to': {
                    'id': agent_user.id,
                    'username': agent_user.username
                },
                'suggestion_confidence': 'high' if suggested_agent.get('specialization') == ticket.ai_category else 'medium'
            })
        
        return Response({'success': False, 'message': 'No suitable agent available'}, status=status.HTTP_404_NOT_FOUND)
    
    @action(detail=True, methods=['post'])
    def detect_duplicates(self, request, pk=None):
        """Detect potential duplicate tickets"""
        ticket = self.get_object()
        
        # Get existing tickets (excluding current)
        existing_tickets = Ticket.objects.exclude(id=ticket.id).values(
            'id', 'title', 'description', 'status'
        )
        
        processor = TicketAIProcessor()
        duplicates = processor.detect_duplicates(
            {'title': ticket.title, 'description': ticket.description},
            list(existing_tickets)
        )
        
        return Response({
            'current_ticket': ticket.id,
            'potential_duplicates': duplicates
        })
    
    @action(detail=True, methods=['post'])
    def apply_suggested_response(self, request, pk=None):
        """Apply AI suggested response as a comment"""
        ticket = self.get_object()
        
        if not ticket.ai_suggested_response:
            return Response({'success': False, 'message': 'No suggested response available'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        comment = TicketComment.objects.create(
            ticket=ticket,
            author=request.user,
            content=ticket.ai_suggested_response,
            is_ai_suggested=True
        )
        
        return Response({
            'success': True,
            'comment': TicketCommentSerializer(comment).data
        })
    
    @action(detail=False, methods=['get'])
    def dashboard_stats(self, request):
        """Get dashboard statistics"""
        user = request.user
        
        if user.is_staff:
            base_queryset = Ticket.objects.all()
        else:
            base_queryset = Ticket.objects.filter(created_by=user) | Ticket.objects.filter(assigned_to=user)
        
        stats = {
            'total': base_queryset.count(),
            'by_status': dict(base_queryset.values('status').annotate(count=Count('id')).values_list('status', 'count')),
            'by_priority': dict(base_queryset.values('priority').annotate(count=Count('id')).values_list('priority', 'count')),
            'by_category': dict(base_queryset.filter(ai_category__isnull=False)
                               .values('ai_category').annotate(count=Count('id'))
                               .values_list('ai_category', 'count')),
            'sentiment_distribution': {
                'positive': base_queryset.filter(ai_sentiment='positive').count(),
                'neutral': base_queryset.filter(ai_sentiment='neutral').count(),
                'negative': base_queryset.filter(ai_sentiment='negative').count(),
            },
            'unprocessed_count': base_queryset.filter(ai_processed=False).count(),
            'avg_resolution_time': None,  # Would need historical data
        }
        
        return Response(stats)


class TicketCommentViewSet(viewsets.ModelViewSet):
    serializer_class = TicketCommentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        ticket_id = self.kwargs.get('ticket_pk')
        if ticket_id:
            return TicketComment.objects.filter(ticket_id=ticket_id)
        return TicketComment.objects.all()
    
    def perform_create(self, serializer):
        ticket_id = self.kwargs.get('ticket_pk')
        serializer.save(
            ticket_id=ticket_id,
            author=self.request.user
        )


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def analyze_ticket(request):
    """Public endpoint to analyze a ticket (for preview before submission)"""
    from .serializers import AIAnalysisRequestSerializer
    
    serializer = AIAnalysisRequestSerializer(data=request.data)
    if serializer.is_valid():
        processor = TicketAIProcessor()
        analysis = processor.process_ticket(
            serializer.validated_data['title'],
            serializer.validated_data['description']
        )
        analysis['processing_timestamp'] = timezone.now().isoformat()
        
        return Response({
            'success': True,
            'analysis': analysis
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def detect_duplicates(request):
    """Detect potential duplicate tickets"""
    serializer = DuplicateDetectionRequestSerializer(data=request.data)
    if serializer.is_valid():
        # Get existing tickets
        existing_tickets = Ticket.objects.values('id', 'title', 'description', 'status')
        
        processor = TicketAIProcessor()
        duplicates = processor.detect_duplicates(
            {
                'title': serializer.validated_data['title'],
                'description': serializer.validated_data['description']
            },
            list(existing_tickets)
        )
        
        return Response({
            'success': True,
            'potential_duplicates': duplicates
        })
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def agents_list(request):
    """List all agents with their current workload"""
    agents = AgentProfile.objects.select_related('user').all()
    data = []
    
    for agent in agents:
        current_tickets = Ticket.objects.filter(
            assigned_to=agent.user,
            status__in=[Ticket.Status.OPEN, Ticket.Status.IN_PROGRESS]
        ).count()
        
        data.append({
            'id': agent.id,
            'user_id': agent.user_id,
            'username': agent.user.username,
            'email': agent.user.email,
            'specialization': agent.specialization,
            'specialization_display': agent.get_specialization_display(),
            'is_senior': agent.is_senior,
            'is_available': agent.is_available,
            'max_tickets': agent.max_concurrent_tickets,
            'current_tickets': current_tickets,
            'workload_percentage': int((current_tickets / agent.max_concurrent_tickets) * 100) if agent.max_concurrent_tickets > 0 else 0
        })
    
    return Response(data)


@api_view(['GET'])
@permission_classes([permissions.AllowAny])
def health_check(request):
    """Health check endpoint"""
    return Response({
        'status': 'healthy',
        'timestamp': timezone.now().isoformat(),
        'version': '1.0.0'
    })


@api_view(['POST'])
@permission_classes([permissions.AllowAny])
def register(request):
    """User registration endpoint"""
    from django.contrib.auth.models import User
    from django.contrib.auth.password_validation import validate_password
    from django.core.exceptions import ValidationError
    
    username = request.data.get('username')
    email = request.data.get('email')
    password = request.data.get('password')
    
    # Validate required fields
    if not username or not email or not password:
        return Response(
            {'error': 'Username, email, and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if username already exists
    if User.objects.filter(username=username).exists():
        return Response(
            {'error': 'Username already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Check if email already exists
    if User.objects.filter(email=email).exists():
        return Response(
            {'error': 'Email already exists'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Validate password
    try:
        validate_password(password)
    except ValidationError as e:
        return Response(
            {'error': list(e.messages)},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create user
    user = User.objects.create_user(
        username=username,
        email=email,
        password=password
    )
    
    return Response({
        'success': True,
        'user': {
            'id': user.id,
            'username': user.username,
            'email': user.email
        }
    }, status=status.HTTP_201_CREATED)
