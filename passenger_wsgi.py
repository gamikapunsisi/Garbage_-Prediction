import sys, os

# Add app directory to Python path
sys.path.insert(0, os.path.dirname(__file__))

# Import Flask app from app.py and expose as 'application'
from app import app as application
