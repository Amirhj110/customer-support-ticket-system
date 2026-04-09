"""
WSGI configuration for PythonAnywhere deployment.

This file should be placed in your PythonAnywhere web app configuration.
The path to this file in PythonAnywhere should be:
/var/www/amirhj110_pythonanywhere_com_wsgi.py

Make sure to:
1. Update the path to your project below
2. Set your PythonAnywhere username
3. Configure your virtualenv in the PythonAnywhere web tab
"""

import sys
import os

# Add your project directory to the sys.path
# Replace 'amirhj110' with your PythonAnywhere username
path = '/home/amirhj110/customer-support-ticket-system'
if path not in sys.path:
    sys.path.insert(0, path)

# Set environment variables for production
os.environ['DJANGO_SETTINGS_MODULE'] = 'support_system.settings'
os.environ['SECRET_KEY'] = 'your-production-secret-key-here-change-this'
os.environ['DEBUG'] = 'False'
os.environ['ALLOWED_HOSTS'] = 'amirhj110.pythonanywhere.com,localhost,127.0.0.1'

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
