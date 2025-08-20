from flask import Blueprint, request, jsonify
from src.models import db, Note, Course
from datetime import datetime
import json
import re

note_bp = Blueprint('note', __name__)

def extract_plain_text(html_content):
    """Extract plain text from HTML content for search and AI processing"""
    if not html_content:
        return ""
    # Remove HTML tags
    clean = re.compile('<.*?>')
    return re.sub(clean, '', html_content)

@note_bp.route('/courses/<int:course_id>/notes', methods=['GET'])
def get_notes_by_course(course_id):
    """Get all notes for a specific course"""
    try:
        # Verify course exists
        course = Course.query.get_or_404(course_id)
        
        notes = Note.query.filter_by(course_id=course_id).order_by(Note.position.asc(), Note.created_at.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes', methods=['GET'])
def get_all_notes():
    """Get all notes with optional filtering"""
    try:
        # Get query parameters
        course_id = request.args.get('course_id', type=int)
        search = request.args.get('search', '')
        
        query = Note.query
        
        if course_id:
            query = query.filter_by(course_id=course_id)
        
        if search:
            query = query.filter(Note.plain_content.contains(search) | Note.title.contains(search))
        
        notes = query.order_by(Note.updated_at.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes', methods=['POST'])
def create_note():
    """Create a new note"""
    try:
        data = request.get_json()
        
        if not data or not data.get('title') or not data.get('course_id'):
            return jsonify({'error': 'Title and course_id are required'}), 400
        
        # Verify course exists
        course = Course.query.get_or_404(data['course_id'])
        
        # Extract plain text from content
        content = data.get('content', '')
        plain_content = extract_plain_text(content)
        
        # Parse review_date if provided
        review_date = None
        if data.get('review_date'):
            try:
                review_date = datetime.fromisoformat(data['review_date'].replace('Z', '+00:00'))
            except ValueError:
                return jsonify({'error': 'Invalid review_date format'}), 400
        
        note = Note(
            title=data['title'],
            content=content,
            plain_content=plain_content,
            course_id=data['course_id'],
            review_date=review_date,
            note_type=data.get('note_type', 'manual'),
            source_file=data.get('source_file'),
            position=data.get('position', 0),
            tags=data.get('tags')
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify(note.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes/<int:note_id>', methods=['GET'])
def get_note(note_id):
    """Get a specific note"""
    try:
        note = Note.query.get_or_404(note_id)
        return jsonify(note.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes/<int:note_id>', methods=['PUT'])
def update_note(note_id):
    """Update a note"""
    try:
        note = Note.query.get_or_404(note_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'title' in data:
            note.title = data['title']
        if 'content' in data:
            note.content = data['content']
            note.plain_content = extract_plain_text(data['content'])
        if 'review_date' in data:
            if data['review_date']:
                try:
                    note.review_date = datetime.fromisoformat(data['review_date'].replace('Z', '+00:00'))
                except ValueError:
                    return jsonify({'error': 'Invalid review_date format'}), 400
            else:
                note.review_date = None
        if 'position' in data:
            note.position = data['position']
        if 'tags' in data:
            note.tags = data['tags']
        
        note.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(note.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes/<int:note_id>', methods=['DELETE'])
def delete_note(note_id):
    """Delete a note"""
    try:
        note = Note.query.get_or_404(note_id)
        db.session.delete(note)
        db.session.commit()
        
        return jsonify({'message': 'Note deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes/with-review-dates', methods=['GET'])
def get_notes_with_review_dates():
    """Get all notes that have review dates set (for calendar view)"""
    try:
        notes = Note.query.filter(Note.review_date.isnot(None)).order_by(Note.review_date.asc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@note_bp.route('/notes/reorder', methods=['POST'])
def reorder_notes():
    """Reorder notes within a course"""
    try:
        data = request.get_json()
        
        if not data or 'note_ids' not in data:
            return jsonify({'error': 'note_ids array is required'}), 400
        
        note_ids = data['note_ids']
        
        # Update positions
        for index, note_id in enumerate(note_ids):
            note = Note.query.get(note_id)
            if note:
                note.position = index
                note.updated_at = datetime.utcnow()
        
        db.session.commit()
        
        return jsonify({'message': 'Notes reordered successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

