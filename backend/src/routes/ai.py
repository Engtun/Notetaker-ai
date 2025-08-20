from flask import Blueprint, request, jsonify, current_app
import google.generativeai as genai
from src.models import db, Note, Course
import json
import os

ai_bp = Blueprint('ai', __name__)

def get_gemini_client():
    """Get Gemini client"""
    api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("No API key found. Please set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')

@ai_bp.route('/summarize-note', methods=['POST'])
def summarize_note():
    """Summarize a specific note"""
    data = request.get_json()
    
    if not data or 'note_id' not in data:
        return jsonify({'error': 'Note ID is required'}), 400
    
    try:
        note = Note.query.get(data['note_id'])
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        model = get_gemini_client()
        
        prompt = f"""
        Please provide a concise summary of the following note titled "{note.title}":
        
        {note.content}
        
        Focus on:
        1. Key concepts and main ideas
        2. Important definitions
        3. Critical points to remember
        4. Any formulas or examples mentioned
        
        Keep the summary clear and suitable for quick review.
        """
        
        response = model.generate_content(prompt)
        
        summary = response.text
        
        return jsonify({
            'summary': summary,
            'note_title': note.title
        })
        
    except Exception as e:
        return jsonify({'error': f'Error generating summary: {str(e)}'}), 500

@ai_bp.route('/generate-questions', methods=['POST'])
def generate_questions():
    """Generate study questions based on note content"""
    data = request.get_json()
    
    if not data or 'note_id' not in data:
        return jsonify({'error': 'Note ID is required'}), 400
    
    try:
        note = Note.query.get(data['note_id'])
        if not note:
            return jsonify({'error': 'Note not found'}), 404
        
        model = get_gemini_client()
        
        prompt = f"""
        Based on the following note titled "{note.title}", generate 5-7 study questions that would help a student review and understand the material:
        
        {note.content}
        
        Create a mix of:
        1. Factual recall questions
        2. Conceptual understanding questions
        3. Application questions
        4. Analysis questions
        
        Format as a numbered list. Make questions clear and specific.
        """
        
        response = model.generate_content(prompt)
        
        questions = response.text
        
        return jsonify({
            'questions': questions,
            'note_title': note.title
        })
        
    except Exception as e:
        return jsonify({'error': f'Error generating questions: {str(e)}'}), 500

@ai_bp.route('/ask-question', methods=['POST'])
def ask_question():
    """Answer a question about notes"""
    data = request.get_json()
    
    if not data or 'question' not in data:
        return jsonify({'error': 'Question is required'}), 400
    
    try:
        question = data['question']
        note_id = data.get('note_id')
        course_id = data.get('course_id')
        
        # Get context based on what's provided
        context = ""
        if note_id:
            note = Note.query.get(note_id)
            if note:
                context = f"Note: {note.title}\n\n{note.content}"
        elif course_id:
            course = Course.query.get(course_id)
            if course:
                notes = Note.query.filter_by(course_id=course_id).all()
                context = f"Course: {course.name}\n\n"
                for note in notes[:5]:  # Limit to first 5 notes to avoid token limits
                    context += f"Note: {note.title}\n{note.content[:500]}...\n\n"
        
        if not context:
            return jsonify({'error': 'No context found for the question'}), 400
        
        model = get_gemini_client()
        
        prompt = f"""
        Based on the following study material, please answer this question: "{question}"
        
        Study Material:
        {context}
        
        Provide a clear, helpful answer that:
        1. Directly addresses the question
        2. References relevant information from the notes
        3. Explains concepts clearly
        4. Includes examples if helpful
        
        If the question cannot be answered from the provided material, say so clearly.
        """
        
        response = model.generate_content(prompt)
        
        answer = response.text
        
        return jsonify({
            'answer': answer,
            'question': question
        })
        
    except Exception as e:
        return jsonify({'error': f'Error answering question: {str(e)}'}), 500

@ai_bp.route('/chat', methods=['POST'])
def chat():
    """General chat with AI assistant about ALL notes and courses"""
    data = request.get_json()
    
    if not data or 'message' not in data:
        return jsonify({'error': 'Message is required'}), 400
    
    try:
        message = data['message']

        # Gather ALL courses and notes
        courses = Course.query.all()
        notes = Note.query.all()
        context = ""
        for course in courses:
            context += f"Course: {course.name}\nDescription: {course.description}\n\n"
            course_notes = [note for note in notes if getattr(note, 'course_id', None) == course.id]
            for note in course_notes:
                context += f"Note: {note.title}\n{note.content[:500]}...\n\n"

        # Add notes not linked to a course
        uncategorized_notes = [note for note in notes if not getattr(note, 'course_id', None)]
        for note in uncategorized_notes:
            context += f"Note: {note.title}\n{note.content[:500]}...\n\n"

        model = get_gemini_client()
        
        system_prompt = "You are a helpful AI study assistant. You help students with their coursework, answer questions about their notes, and provide study guidance."
        system_prompt += f"\n\nHere's ALL the student's course material for context:\n{context}"
        
        response = model.generate_content(system_prompt + "\n\nUser: " + message)
        
        reply = response.text
        
        return jsonify({
            'reply': reply,
            'message': message
        })
        
    except Exception as e:
        return jsonify({'error': f'Error in chat: {str(e)}'}), 500