from ollama_client import OllamaClient
from typing import Dict, Any
import json

class ResumeService:
    def __init__(self, ollama_client: OllamaClient):
        self.ollama = ollama_client
    
    def extract_job_requirements(self, job_posting: str) -> Dict[str, Any]:
        """Extract key requirements from job posting"""
        prompt = f"""Extract the key information from this job posting and return it as a JSON object with these exact keys:
- job_title: The title of the position
- company: Company name (if mentioned)
- location: Job location
- required_skills: Array of required technical and soft skills
- required_experience: Summary of experience requirements
- responsibilities: Array of key responsibilities
- qualifications: Array of required qualifications
- tech_stack: Array of mentioned technologies/frameworks

Job Posting:
{job_posting}

Return ONLY valid JSON, no other text."""
        
        response = self.ollama.generate(prompt)
        
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {
                    "job_title": "",
                    "company": "",
                    "location": "",
                    "required_skills": [],
                    "required_experience": "",
                    "responsibilities": [],
                    "qualifications": [],
                    "tech_stack": []
                }
        except json.JSONDecodeError:
            return {
                "job_title": "",
                "company": "",
                "location": "",
                "required_skills": [],
                "required_experience": "",
                "responsibilities": [],
                "qualifications": [],
                "tech_stack": []
            }
    
    def extract_user_background(self, user_background: str) -> Dict[str, Any]:
        """Extract structured information from user's background"""
        prompt = f"""Extract the following information from this user's background and return it as a JSON object with these exact keys:
- full_name: The person's full name (if provided)
- email: Email address (if provided)
- phone: Phone number (if provided)
- location: City, State/Province, Country (if provided)
- summary: Professional summary or objective
- experience: Array of work experience objects with title, company, location, start_date, end_date, description
- education: Array of education objects with degree, school, location, graduation_date
- skills: Array of technical and soft skills
- certifications: Array of certifications if any

User Background:
{user_background}

Return ONLY valid JSON, no other text."""
        
        response = self.ollama.generate(prompt)
        
        try:
            start_idx = response.find('{')
            end_idx = response.rfind('}') + 1
            if start_idx != -1 and end_idx != 0:
                json_str = response[start_idx:end_idx]
                return json.loads(json_str)
            else:
                return {
                    "full_name": "",
                    "email": "",
                    "phone": "",
                    "location": "",
                    "summary": user_background[:500],
                    "experience": [],
                    "education": [],
                    "skills": [],
                    "certifications": []
                }
        except json.JSONDecodeError:
            return {
                "full_name": "",
                "email": "",
                "phone": "",
                "location": "",
                "summary": user_background[:500],
                "experience": [],
                "education": [],
                "skills": [],
                "certifications": []
            }
    
    def generate_tailored_resume(self, job_requirements: Dict[str, Any], user_background: Dict[str, Any]) -> str:
        """Generate a resume tailored to the job posting"""
        prompt = f"""Create a professionally formatted resume in markdown format tailored specifically for this job posting.

Job Requirements:
{json.dumps(job_requirements, indent=2)}

User Background:
{json.dumps(user_background, indent=2)}

Instructions:
1. Tailor the resume to match the job requirements as closely as possible
2. Highlight relevant skills and experience that match the job posting
3. Use keywords from the job posting in the summary and skills sections
4. Emphasize experience that aligns with the job responsibilities
5. Keep the formatting clean, professional, and ATS-friendly
6. If the user lacks specific required skills/experience, focus on transferable skills and relevant achievements
7. Make the summary compelling and directly address why this candidate is a good fit for this role

Format the resume with these sections:
1. **Name and Contact Info** at the top
2. **Professional Summary** (tailored to this specific job)
3. **Work Experience** (reverse chronological, highlight relevant experience)
4. **Education**
5. **Skills** (prioritize skills mentioned in job posting)
6. **Certifications** (if any)

Use professional language, strong action verbs, and ensure the formatting is clean and consistent."""
        
        response = self.ollama.generate(prompt)
        return response
    
    def process_job_application(self, job_posting: str, user_background: str) -> Dict[str, Any]:
        """Process job posting and user background to generate tailored resume"""
        # Extract job requirements
        job_requirements = self.extract_job_requirements(job_posting)
        
        # Extract user background
        user_details = self.extract_user_background(user_background)
        
        # Generate tailored resume
        resume = self.generate_tailored_resume(job_requirements, user_details)
        
        return {
            "job_requirements": job_requirements,
            "user_details": user_details,
            "resume": resume
        }
