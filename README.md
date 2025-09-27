AI-Powered Course Notes App

HERE IS A DEMO VIDEO :https://www.dropbox.com/scl/fi/fza3b1uyhbi6o9pe9c8yk/Untitled-video-Made-with-Clipchamp.mp4?rlkey=q2v0xn1ryrikuwl3u03dgzz8m&st=bkh3kslb&dl=0

A comprehensive full-stack web application for efficient course note-taking and management, featuring AI assistance and a modern UI/UX design.

🚀 Features

Course Management – Create, organize, and delete multiple courses with color-coded themes and note counts.

Rich Text Editor – Full-featured editor (headings, lists, colors, images, links) powered by TipTap
.

PDF Processing – Upload PDF files with automatic text extraction and note generation.

AI Assistant (Gemini)

Summarize notes

Generate practice questions

Interactive Q&A chat about course content

Intelligent content analysis

Smart Scheduling – Calendar view for review dates and study planning.

Responsive UI – Clean, modern interface with React, Tailwind CSS, and Radix UI.

Database Integration – SQLite with SQLAlchemy for reliable persistence and relationships.

🛠️ Tech Stack

Backend

Flask (Python) – RESTful APIs

SQLAlchemy ORM – Database handling

CORS support

Frontend

React 19 + Vite

React Router, Lucide Icons

Radix UI + Tailwind CSS

AI Integration

Google Gemini API (Generative AI for NLP tasks)

File Handling

PDF text extraction and processing

⚡ Getting Started
1. Clone & Setup
git clone <repository-url>
cd course-notes-app

2. Backend Setup
cd backend
pip install -r requirements.txt

# Add GEMINI_API_KEY to a .env file (from Google AI Studio)
python src/main.py


Runs at: http://localhost:5000

3. Frontend Setup
cd frontend
pnpm install
pnpm run dev


Runs at: http://localhost:5173

4. Access the App

Open http://localhost:5173
 in your browser.
The frontend automatically proxies API calls to the backend.

✨ Recent Enhancements

Added delete functionality for courses and notes with confirmation dialogs

Implemented cascade delete (removing a course also deletes its notes)

Enhanced UI with delete buttons and improved state management

Better error handling and user feedback

📚 About the Project

This project showcases expertise in:

Full-stack development with Flask + React

AI integration with Google Gemini

Modern React patterns and UI/UX design

Building user-centric educational tools

It bridges traditional note-taking with AI-powered learning, helping students study more effectively.
