# Dockerfile for Django Backend
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy project
COPY . .

# Collect static files
RUN python manage.py collectstatic --noinput

# Expose port
EXPOSE 8000

# Run with gunicorn using PORT env var (defaults to 8000)
CMD sh -c "gunicorn --bind 0.0.0.0:${PORT:-8000} --workers 4 support_system.wsgi:application"
