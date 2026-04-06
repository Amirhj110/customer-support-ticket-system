# AI-Powered Customer Support Ticket System

A modern, production-ready customer support ticket system with built-in AI capabilities for automatic ticket classification, sentiment analysis, priority detection, and smart response suggestions.

## 🎯 Features

### AI Features
- **Automatic Ticket Classification**: Categorizes tickets into Technical, Billing, Account, Feature Request, or General Inquiry
- **Sentiment Analysis**: Detects customer sentiment (positive, neutral, negative) to prioritize urgent cases
- **Priority Detection**: Automatically identifies urgent and high-priority issues
- **Smart Response Suggestions**: AI generates suggested responses for agents
- **Entity Extraction**: Extracts emails, URLs, phone numbers, and IDs from tickets
- **Duplicate Detection**: Identifies potential duplicate tickets
- **Auto Assignment**: Routes tickets to the best available agent based on specialization

### Core Features
- JWT-based authentication
- Role-based access control (Admin, Agent, Customer)
- Real-time ticket tracking
- Comment/response system
- Dashboard with analytics
- Agent workload management

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- Docker (optional, for deployment)

### Local Development

#### Backend Setup

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create superuser (for admin access)
python manage.py createsuperuser

# Start development server
python manage.py runserver
```

#### Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:8000`

### Using Docker

```bash
# Build and run all services
docker-compose up -d

# View logs
docker-compose logs -f
```

## 📁 Project Structure

```
customer-support-ticket-system/
├── ai/                          # AI services
│   ├── __init__.py
│   └── services.py              # AI processing logic
├── support_system/              # Django project settings
│   ├── __init__.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
├── tickets/                     # Main tickets app
│   ├── models.py                # Ticket, Comment, AgentProfile models
│   ├── views.py                 # API endpoints
│   ├── serializers.py           # DRF serializers
│   ├── urls.py
│   └── admin.py                # Admin panel configuration
├── frontend/                    # React frontend
│   ├── src/
│   │   ├── pages/              # Page components
│   │   ├── components/         # Reusable components
│   │   ├── services/           # API services
│   │   └── context/            # React contexts
│   └── ...
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── README.md
```

## 🔌 API Endpoints

### Authentication
- `POST /api/token/` - Login and get JWT tokens
- `POST /api/token/refresh/` - Refresh access token

### Tickets
- `GET /api/tickets/` - List tickets (with filters)
- `POST /api/tickets/` - Create new ticket
- `GET /api/tickets/{id}/` - Get ticket details
- `PATCH /api/tickets/{id}/` - Update ticket
- `DELETE /api/tickets/{id}/` - Delete ticket
- `POST /api/tickets/{id}/analyze/` - Re-run AI analysis
- `POST /api/tickets/{id}/assign_agent/` - Auto-assign agent
- `POST /api/tickets/{id}/detect_duplicates/` - Find duplicate tickets
- `POST /api/tickets/{id}/apply_suggested_response/` - Apply AI response
- `GET /api/tickets/dashboard_stats/` - Get dashboard statistics

### Comments
- `GET /api/tickets/{id}/comments/` - List comments
- `POST /api/tickets/{id}/comments/` - Add comment

### AI Endpoints
- `POST /api/ai/analyze/` - Analyze ticket content
- `POST /api/ai/detect-duplicates/` - Detect duplicate tickets
- `GET /api/ai/agents/` - List agents with workload

### Health
- `GET /api/health/` - Health check endpoint

## 🤖 AI Architecture

### Text Analysis Pipeline

1. **Preprocessing**: Text normalization and cleaning
2. **Classification**: Keyword-based category detection with confidence scoring
3. **Sentiment Analysis**: Word-level sentiment scoring
4. **Priority Detection**: Multi-level priority classification
5. **Entity Extraction**: Regex-based entity recognition
6. **Summarization**: Extractive summarization for long tickets

### Agent Assignment Algorithm

The system matches tickets to agents based on:
- Agent specialization matching ticket category
- Current workload vs. capacity
- Seniority level for urgent tickets

## 🚀 Deployment

### Docker Deployment (Recommended)

1. Clone the repository
2. Update `SECRET_KEY` in production
3. Run `docker-compose up -d`

### Manual Deployment

#### Backend
```bash
pip install -r requirements.txt
python manage.py migrate
python manage.py collectstatic
gunicorn --bind 0.0.0.0:8000 support_system.wsgi:application
```

#### Frontend
```bash
cd frontend
npm install
npm run build
# Serve the dist folder with nginx
```

## 🔐 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `SECRET_KEY` | Django secret key | (development key) |
| `DEBUG` | Debug mode | True |
| `ALLOWED_HOSTS` | Allowed hosts | localhost,127.0.0.1 |
| `VITE_API_URL` | Backend API URL | http://localhost:8000 |

## 📊 Dashboard Analytics

The dashboard provides:
- Total, open, in-progress, and resolved ticket counts
- Priority distribution visualization
- Customer sentiment overview
- Category breakdown
- Quick actions for common workflows

## 🔮 Future Enhancements

- Integration with external LLM APIs (OpenAI, Anthropic) for advanced AI
- Real-time notifications with WebSockets
- Email integration for ticket creation
- Knowledge base with auto-suggestions
- SLA monitoring and alerts
- Customer satisfaction surveys
- Advanced reporting and export

## 📄 License

MIT License
