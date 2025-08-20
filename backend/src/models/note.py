from . import db
from datetime import datetime

class Note(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    content = db.Column(db.Text)  # Rich text content (HTML)
    plain_content = db.Column(db.Text)  # Plain text for search and AI processing
    
    # Metadata
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    review_date = db.Column(db.DateTime)  # Optional review date for calendar
    
    # Note type and source
    note_type = db.Column(db.String(50), default='manual')  # 'manual', 'pdf_summary'
    source_file = db.Column(db.String(500))  # Original PDF filename if from PDF
    
    # Course relationship
    course_id = db.Column(db.Integer, db.ForeignKey('course.id'), nullable=False)
    
    # Position for ordering within course
    position = db.Column(db.Integer, default=0)
    
    # Tags for organization
    tags = db.Column(db.Text)  # JSON string of tags array

    def __repr__(self):
        return f'<Note {self.title}>'

    def to_dict(self):
        return {
            'id': self.id,
            'title': self.title,
            'content': self.content,
            'plain_content': self.plain_content,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'review_date': self.review_date.isoformat() if self.review_date else None,
            'note_type': self.note_type,
            'source_file': self.source_file,
            'course_id': self.course_id,
            'position': self.position,
            'tags': self.tags
        }

