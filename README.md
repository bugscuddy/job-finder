# Job Finder - AI-Powered Job Search

An intelligent job search platform that analyzes your resume and finds matching job opportunities. Simply upload your resume, and the AI will extract your skills and experience, search for relevant jobs, and rank them by how well they match your profile. Built with a modern full-stack architecture leveraging Ollama for local AI inference.

## Features

- **Resume Parsing**: Extracts skills, experience, and education from PDF, DOCX, or TXT resumes
- **AI-Powered Analysis**: Uses AI to understand your qualifications and preferences
- **Smart Job Search**: Searches for jobs based on your extracted skills and experience
- **Match Scoring**: Ranks jobs by how well they match your profile (0-100%)
- **Match Reasoning**: Provides explanations for why each job is a good fit
- **Location Filtering**: Specify preferred locations to find local or remote opportunities
- **Modern Interface**: Clean, responsive React-based frontend with dark mode
- **Configurable AI**: Customize Ollama settings (base URL, model) through the UI

## Architecture

### Backend (Python/FastAPI)
- **FastAPI**: High-performance web framework for the API
- **Ollama**: Local LLM integration for AI-powered analysis
- **PyPDF & python-docx**: Resume file parsing
- **Custom Job Search Service**: Job matching and scoring algorithms

### Frontend (React/TypeScript)
- **React 18**: Modern UI library
- **TypeScript**: Type-safe development
- **Vite**: Fast build tool and dev server
- **TailwindCSS**: Utility-first CSS framework
- **Lucide React**: Beautiful icon library

## Prerequisites

- **Python 3.8+** for the backend
- **Node.js 18+** and **npm** or **bun** for the frontend
- **Ollama** installed and running (for local AI inference)
  - Install from: https://ollama.ai
  - Default model: `lama3` (configurable)

## Installation

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Create a virtual environment:
```bash
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Ensure Ollama is running:
```bash
ollama serve
```

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
# or
bun install
```

## Running the Application

### Start the Backend

From the `server` directory:
```bash
python main.py
```

The API will be available at `http://localhost:8000`

### Start the Frontend

From the `client` directory:
```bash
npm run dev
# or
bun run dev
```

The application will be available at `http://localhost:5173`

## Usage

1. **Upload Resume**: 
   - Click the upload area or drag and drop your resume file
   - Supported formats: PDF, DOCX, TXT
   - The AI will extract your skills, experience, and education

2. **Set Location (Optional)**:
   - Enter your preferred job location
   - Leave blank for remote or location-independent jobs

3. **Find Matching Jobs**:
   - Click "Find Matching Jobs"
   - The AI searches for jobs based on your skills
   - Jobs are ranked by match percentage (0-100%)

4. **Review Results**:
   - Browse jobs sorted by match score
   - Click on any job to see full details
   - View match reasoning for each job
   - Click "Apply Now" to visit the job posting

5. **Configure Settings**:
   - Click the "Settings" button
   - Update Ollama base URL if needed (default: `http://localhost:11434`)
   - Change the AI model (default: `qwen3-coder:480b-cloud`)

## API Endpoints

### `POST /api/upload-resume`
Upload and parse resume file
- **Body**: multipart/form-data with file
- **Response**: `{ "success": boolean, "resume_text": string, "resume_details": object }`

### `POST /api/search-jobs`
Search for jobs based on query and location
- **Body**: `{ "query": string, "location": string (optional), "limit": number (optional) }`
- **Response**: `{ "success": boolean, "jobs": array }`

### `POST /api/match-jobs`
Match resume with jobs and score them
- **Body**: `{ "resume_details": object, "jobs": array }`
- **Response**: `{ "success": boolean, "matched_jobs": array }`

### `GET /api/config`
Get current configuration
- **Response**: Configuration object

### `POST /api/config`
Update configuration
- **Body**: `{ "ollama_base_url": string (optional), "ollama_model": string (optional) }`
- **Response**: `{ "success": boolean, "config": object }`

## Project Structure

```
doc-agent/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # React components
│   │   │   ├── ResumeUpload.tsx
│   │   │   ├── JobResults.tsx
│   │   │   └── Settings.tsx
│   │   ├── lib/
│   │   │   └── api.ts    # API client
│   │   └── App.tsx       # Main app component
│   ├── package.json
│   └── vite.config.ts
└── server/                # Python backend
    ├── main.py           # FastAPI application
    ├── ollama_client.py  # Ollama integration
    ├── resume_parser.py  # Resume file parsing
    ├── job_search_service.py # Job search logic
    ├── job_matcher.py    # Job matching and scoring
    ├── config.py         # Configuration management
    └── requirements.txt
```

## Configuration

The application uses a configuration system that persists settings. Default values:

- **Ollama Base URL**: `http://localhost:11434`
- **Ollama Model**: `qwen3-coder:480b-cloud`

These can be changed through the Settings UI in the application.

## License

This project is provided as-is for educational and development purposes.
