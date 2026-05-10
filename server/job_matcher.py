from typing import List, Dict, Any
from ollama_client import OllamaClient

class JobMatcher:
    def __init__(self, ollama_client: OllamaClient):
        self.ollama = ollama_client
    
    def match_jobs(self, resume_details: Dict[str, Any], jobs: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Match resume with jobs and score them"""
        matched_jobs = []
        
        for job in jobs:
            score = self._calculate_match_score(resume_details, job)
            job_with_score = job.copy()
            job_with_score['match_score'] = score
            job_with_score['match_reason'] = self._generate_match_reason(resume_details, job, score)
            matched_jobs.append(job_with_score)
        
        # Sort by match score (highest first)
        matched_jobs.sort(key=lambda x: x['match_score'], reverse=True)
        
        return matched_jobs
    
    def _calculate_match_score(self, resume_details: Dict[str, Any], job: Dict[str, Any]) -> float:
        """Calculate a match score between resume and job (0-100)"""
        score = 0.0
        
        resume_skills = set([s.lower() for s in resume_details.get('skills', [])])
        resume_text = resume_details.get('full_text', '').lower()
        
        # Extract job requirements
        job_requirements = [r.lower() for r in job.get('requirements', [])]
        job_text = f"{job['title']} {job['description']} {' '.join(job_requirements)}".lower()
        
        # Skill matching (up to 50 points)
        skill_matches = 0
        for skill in resume_skills:
            if skill in job_text:
                skill_matches += 1
        
        if resume_skills:
            skill_score = (skill_matches / len(resume_skills)) * 50
        else:
            skill_score = 25  # Neutral score if no skills extracted
        score += skill_score
        
        # Keyword matching in job title (up to 20 points)
        title_keywords = ['engineer', 'developer', 'software', 'fullstack', 'backend', 'frontend']
        for keyword in title_keywords:
            if keyword in resume_text and keyword in job['title'].lower():
                score += 20 / len(title_keywords)
        
        # Base score (up to 30 points for general fit)
        score += 30
        
        return min(score, 100)
    
    def _generate_match_reason(self, resume_details: Dict[str, Any], job: Dict[str, Any], score: float) -> str:
        """Generate a reason for the match score"""
        resume_skills = resume_details.get('skills', [])
        job_requirements = job.get('requirements', [])
        
        matching_skills = []
        for skill in resume_skills:
            if any(skill.lower() in req.lower() for req in job_requirements):
                matching_skills.append(skill)
        
        if matching_skills:
            return f"Matches on skills: {', '.join(matching_skills[:3])}"
        elif score > 60:
            return "Good overall fit based on experience and background"
        elif score > 40:
            return "Potential fit - may require highlighting relevant experience"
        else:
            return "Lower match - consider customizing application"
