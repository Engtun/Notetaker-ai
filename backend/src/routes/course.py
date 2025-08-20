from flask import Blueprint, request, jsonify
from src.models import db, Course
from datetime import datetime

course_bp = Blueprint('course', __name__)

@course_bp.route('/courses', methods=['GET'])
def get_courses():
    """Get all courses"""
    try:
        courses = Course.query.order_by(Course.created_at.desc()).all()
        return jsonify([course.to_dict() for course in courses]), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@course_bp.route('/courses', methods=['POST'])
def create_course():
    """Create a new course"""
    try:
        data = request.get_json()
        
        if not data or not data.get('name'):
            return jsonify({'error': 'Course name is required'}), 400
        
        course = Course(
            name=data['name'],
            description=data.get('description', ''),
            color=data.get('color', '#3B82F6')
        )
        
        db.session.add(course)
        db.session.commit()
        
        return jsonify(course.to_dict()), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@course_bp.route('/courses/<int:course_id>', methods=['GET'])
def get_course(course_id):
    """Get a specific course"""
    try:
        course = Course.query.get_or_404(course_id)
        return jsonify(course.to_dict()), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@course_bp.route('/courses/<int:course_id>', methods=['PUT'])
def update_course(course_id):
    """Update a course"""
    try:
        course = Course.query.get_or_404(course_id)
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        if 'name' in data:
            course.name = data['name']
        if 'description' in data:
            course.description = data['description']
        if 'color' in data:
            course.color = data['color']
        
        course.updated_at = datetime.utcnow()
        db.session.commit()
        
        return jsonify(course.to_dict()), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

@course_bp.route('/courses/<int:course_id>', methods=['DELETE'])
def delete_course(course_id):
    """Delete a course"""
    try:
        course = Course.query.get_or_404(course_id)
        db.session.delete(course)
        db.session.commit()
        
        return jsonify({'message': 'Course deleted successfully'}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': str(e)}), 500

