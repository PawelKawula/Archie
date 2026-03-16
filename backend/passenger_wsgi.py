import os
import sys

# OPTIONAL: add your project directory to sys.path
# Replace 'myproject' and the path with your actual project path
sys.path.insert(0, os.path.dirname(__file__) + "/backend")

# Set the Django settings module
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

from django.core.wsgi import get_wsgi_application

application = get_wsgi_application()
