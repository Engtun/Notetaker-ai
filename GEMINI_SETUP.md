# Switching from OpenAI to Gemini

## Changes Made

1. **Updated Dependencies**: Replaced `openai` with `google-generativeai==0.8.4`
2. **Updated AI Routes**: Modified `backend/src/routes/ai.py` to use Gemini API
3. **Environment Variables**: Added `GEMINI_API_KEY` to environment configuration

## Setup Instructions

### 1. Get Your Gemini API Key
- Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
- Create a new API key
- Copy the key for the next step

### 2. Set Up Environment Variables
```bash
# Create .env file from example
cp .env.example .env

# Edit .env and add your Gemini API key
GEMINI_API_KEY=your-actual-key-here
```

### 3. Install New Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 4. Restart Your Backend
```bash
# Stop your current Flask server
# Start it again to load new dependencies
python src/main.py
```

## API Changes

The following endpoints now use Gemini instead of OpenAI:
- `POST /api/ai/summarize-note`
- `POST /api/ai/generate-questions`
- `POST /api/ai/ask-question`
- `POST /api/ai/chat`

## No Frontend Changes Required

The frontend components (`AIAssistant.jsx`, `AIAssistantDialog.jsx`) will continue to work as-is since they only communicate with the backend API endpoints.

## Testing

You can test the integration by:
1. Creating a new note
2. Using the AI features (summarize, generate questions, chat)
3. Verifying responses are coming from Gemini
