from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import uvicorn
import tempfile
import os

from resume_parser import ResumeParser
from job_search_service import JobSearchService
from job_matcher import JobMatcher
from config import config
from ollama_client import OllamaClient

app = FastAPI(title="Job Finder - AI-Powered Job Search")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
ollama_client = OllamaClient()
resume_parser = ResumeParser()
job_search_service = JobSearchService()
job_matcher = JobMatcher(ollama_client)

class JobSearchRequest(BaseModel):
    query: str
    location: Optional[str] = ""
    limit: Optional[int] = 10

class ConfigUpdate(BaseModel):
    ollama_base_url: Optional[str] = None
    ollama_model: Optional[str] = None

@app.get("/")
async def root():
    return {"message": "Job Finder API - AI-Powered Job Search"}

@app.post("/api/upload-resume")
async def upload_resume(file: UploadFile = File(...)):
    """Upload and parse resume file"""
    try:
        # Create temporary file
        with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # Parse resume
        file_type = file.filename.split('.')[-1].lower()
        resume_text = resume_parser.parse_file(temp_file_path, file_type)
        resume_details = resume_parser.extract_resume_details(resume_text)
        
        # Clean up temp file
        os.unlink(temp_file_path)
        
        return {
            "success": True,
            "resume_text": resume_text,
            "resume_details": resume_details
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/search-jobs")
async def search_jobs(request: JobSearchRequest):
    """Search for jobs based on query and location"""
    try:
        jobs = job_search_service.search_jobs(request.query, request.location, request.limit)
        return {"success": True, "jobs": jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/match-jobs")
async def match_jobs(resume_details: dict, jobs: List[dict]):
    """Match resume with jobs and score them"""
    try:
        matched_jobs = job_matcher.match_jobs(resume_details, jobs)
        return {"success": True, "matched_jobs": matched_jobs}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/config")
async def get_config():
    """Get current configuration"""
    return config.get_all()

@app.post("/api/config")
async def update_config(request: ConfigUpdate):
    """Update configuration"""
    if request.ollama_base_url:
        config.set("ollama.base_url", request.ollama_base_url)
        ollama_client.update_config(base_url=request.ollama_base_url)
    if request.ollama_model:
        config.set("ollama.model", request.ollama_model)
        ollama_client.update_config(model=request.ollama_model)
    return {"success": True, "config": config.get_all()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)