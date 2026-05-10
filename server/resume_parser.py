from typing import Dict, Any
import os
from pypdf import PdfReader
from docx import Document

class ResumeParser:
    def parse_file(self, file_path: str, file_type: str) -> str:
        """Parse resume file and extract text content"""
        try:
            if file_type == 'pdf':
                return self._parse_pdf(file_path)
            elif file_type == 'docx':
                return self._parse_docx(file_path)
            elif file_type == 'txt':
                return self._parse_txt(file_path)
            else:
                raise ValueError(f"Unsupported file type: {file_type}")
        except Exception as e:
            raise Exception(f"Error parsing resume: {str(e)}")
    
    def _parse_pdf(self, file_path: str) -> str:
        """Extract text from PDF file"""
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() + "\n"
        return text
    
    def _parse_docx(self, file_path: str) -> str:
        """Extract text from DOCX file"""
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    
    def _parse_txt(self, file_path: str) -> str:
        """Extract text from TXT file"""
        with open(file_path, 'r', encoding='utf-8') as f:
            return f.read()
    
    def extract_resume_details(self, resume_text: str) -> Dict[str, Any]:
        """Extract structured information from resume text"""
        # This is a simple extraction - in production, you'd use more sophisticated NLP
        details = {
            "full_text": resume_text,
            "skills": self._extract_skills(resume_text),
            "experience": self._extract_experience(resume_text),
            "education": self._extract_education(resume_text),
        }
        return details
    
    def _extract_skills(self, text: str) -> list:
        """Extract skills from resume text (simple keyword matching)"""
        common_tech_skills = [
            "python", "javascript", "java", "react", "node.js", "typescript", "sql",
            "aws", "docker", "kubernetes", "git", "linux", "machine learning", "ai",
            "data science", "html", "css", "mongodb", "postgresql", "redis",
            "graphql", "rest api", "microservices", "agile", "scrum", "devops",
            "ci/cd", "testing", "debugging", "algorithms", "data structures"
        ]
        
        text_lower = text.lower()
        found_skills = []
        for skill in common_tech_skills:
            if skill in text_lower:
                found_skills.append(skill)
        
        return found_skills
    
    def _extract_experience(self, text: str) -> list:
        """Extract experience entries (simple extraction)"""
        # This is a placeholder - in production, use more sophisticated parsing
        return []
    
    def _extract_education(self, text: str) -> list:
        """Extract education entries (simple extraction)"""
        # This is a placeholder - in production, use more sophisticated parsing
        return []
