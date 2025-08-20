from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
import os
import PyPDF2
import google.generativeai as genai
from src.models import db, Note, Course
import json
from datetime import datetime

pdf_bp = Blueprint('pdf', __name__)

# Configure upload folder
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    """Extract text from PDF file"""
    text = ""
    try:
        with open(file_path, 'rb') as file:
            pdf_reader = PyPDF2.PdfReader(file)
            for page in pdf_reader.pages:
                text += page.extract_text() + "\n"
    except Exception as e:
        print(f"Error extracting text from PDF: {e}")
    return text

def get_gemini_client():
    """Get Gemini client"""
    api_key = os.getenv('GOOGLE_API_KEY') or os.getenv('GEMINI_API_KEY')
    if not api_key:
        raise ValueError("No API key found. Please set GOOGLE_API_KEY or GEMINI_API_KEY environment variable.")
    genai.configure(api_key=api_key)
    return genai.GenerativeModel('gemini-1.5-flash')

def summarize_text_with_gemini(text, filename):
    """Generate summary using Gemini"""
    try:
        model = get_gemini_client()
        
        prompt = f"""
        Please create a comprehensive summary of the following document "{filename}" in bullet point format. 
        The summary should be suitable for student note-taking and include:
        
        1. Main topics and key concepts
        2. Important definitions
        3. Key formulas or principles (if any)
        4. Examples or case studies mentioned
        5. Conclusions or takeaways
        
        Format the response as markdown with clear headings and bullet points.
        
        Document content:
        {text[:4000]}  # Limit to first 4000 characters to avoid token limits
        """
        
        response = model.generate_content(prompt)
        return response.text
        
    except Exception as e:
        print(f"Error generating summary: {e}")
        return f"# Summary of {filename}\n\n*Error generating AI summary. Please review the document manually.*\n\n## Extracted Content\n\n{text[:1000]}..."

@pdf_bp.route('/upload', methods=['POST'])
def upload_pdf():
    """Upload and process PDF file"""
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        try:
            # Create upload directory if it doesn't exist
            os.makedirs(UPLOAD_FOLDER, exist_ok=True)
            
            # Save file
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            
            # Extract text
            extracted_text = extract_text_from_pdf(file_path)
            
            if not extracted_text.strip():
                return jsonify({'error': 'Could not extract text from PDF'}), 400
            
            # Generate summary using Gemini
            summary = summarize_text_with_gemini(extracted_text, filename)
            
            # Clean up uploaded file
            os.remove(file_path)
            
            # Create note data
            note_data = {
                'title': f"Summary: {filename.rsplit('.', 1)[0]}",
                'content': summary,
                'plain_content': summary,  # For search functionality
                'note_type': 'pdf_summary',
                'source_file': filename,
                'created_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
            
            return jsonify({
                'success': True,
                'note': note_data,
                'message': f'PDF "{filename}" processed successfully'
            })
            
        except Exception as e:
            return jsonify({'error': f'Error processing PDF: {str(e)}'}), 500
    
    return jsonify({'error': 'Invalid file type. Only PDF files are allowed.'}), 400

@pdf_bp.route('/create-note', methods=['POST'])
def create_note_from_pdf():
    """Create a note from processed PDF data"""
    data = request.get_json()
    
    if not data or 'course_id' not in data or 'note_data' not in data:
        return jsonify({'error': 'Missing required data'}), 400
    
    try:
        note_data = data['note_data']
        
        # Create new note
        note = Note(
            title=note_data['title'],
            content=note_data['content'],
            plain_content=note_data.get('plain_content', note_data['content']),
            course_id=data['course_id'],
            tags=json.dumps(['pdf-generated', 'summary']),
            note_type=note_data.get('note_type', 'pdf_summary'),
            source_file=note_data.get('source_file', ''),
            created_at=datetime.utcnow(),
            updated_at=datetime.utcnow()
        )
        
        db.session.add(note)
        db.session.commit()
        
        return jsonify({
            'id': note.id,
            'title': note.title,
            'content': note.content,
            'plain_content': note.plain_content,
            'course_id': note.course_id,
            'tags': note.tags,
            'note_type': note.note_type,
            'source_file': note.source_file,
            'created_at': note.created_at.isoformat(),
            'updated_at': note.updated_at.isoformat()
        })
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': f'Error creating note: {str(e)}'}), 500
