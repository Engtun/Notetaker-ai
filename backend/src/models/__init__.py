from flask_sqlalchemy import SQLAlchemy

# Shared database instance
db = SQLAlchemy()

# Import all models to ensure they are registered
from .user import User
from .course import Course
from .note import Note

