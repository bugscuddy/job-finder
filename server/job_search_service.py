from typing import List, Dict, Any
import requests
import re

class JobSearchService:
    def __init__(self):
        self.base_url = "https://www.arbeitnow.com/api/job-board-api"
    
    def search_jobs(self, query: str, location: str = "", limit: int = 10) -> List[Dict[str, Any]]:
        """Search for jobs using Arbeitnow API"""
        try:
            # Build API URL with parameters
            params = {}
            if query:
                params['search'] = query
            if location:
                params['location'] = location
            
            print(f"Searching for jobs with query: {query}, location: {location}")
            
            # Make request to Arbeitnow API
            response = requests.get(self.base_url, params=params, timeout=30)
            response.raise_for_status()
            
            data = response.json()
            print(f"Received {len(data.get('data', []))} jobs from API")
            
            # Extract and format jobs, filtering for English only
            jobs = self._format_jobs(data.get('data', []), limit)
            
            # Filter for English jobs
            english_jobs = [job for job in jobs if self._is_english_job(job)]
            
            print(f"After English filter: {len(english_jobs)} jobs")
            
            return english_jobs[:limit]
        except Exception as e:
            print(f"Error fetching jobs from Arbeitnow: {e}")
            import traceback
            traceback.print_exc()
            # Fallback to empty list if API fails
            return []
    
    def _format_jobs(self, raw_jobs: List[Dict], limit: int) -> List[Dict[str, Any]]:
        """Format raw job data from API into consistent structure"""
        formatted_jobs = []
        
        for job in raw_jobs[:limit]:
            formatted_job = {
                "title": job.get('title', 'Unknown Position'),
                "company": job.get('company_name', 'Unknown Company'),
                "location": job.get('location', 'Remote'),
                "description": job.get('description', 'No description available'),
                "requirements": self._extract_requirements(job),
                "salary": job.get('salary', 'Not specified'),
                "url": job.get('url', '#'),
                "job_type": job.get('job_type', 'Full-time'),
                "remote": job.get('remote', False)
            }
            formatted_jobs.append(formatted_job)
        
        return formatted_jobs
    
    def _extract_requirements(self, job: Dict) -> List[str]:
        """Extract requirements from job data"""
        requirements = []
        
        # Try to get requirements from various fields
        if 'requirements' in job:
            if isinstance(job['requirements'], list):
                requirements = job['requirements']
            elif isinstance(job['requirements'], str):
                # Split by common delimiters
                requirements = [r.strip() for r in job['requirements'].split(',') if r.strip()]
        
        # If no requirements found, try to extract from description
        if not requirements and 'description' in job:
            desc = job['description']
            # Look for common requirement indicators
            req_keywords = ['requirement', 'qualification', 'skill', 'must have', 'should have']
            for keyword in req_keywords:
                if keyword.lower() in desc.lower():
                    # Extract sentence containing the keyword
                    sentences = desc.split('.')
                    for sentence in sentences:
                        if keyword.lower() in sentence.lower():
                            requirements.append(sentence.strip())
                            break
        
        # If still no requirements, add generic ones
        if not requirements:
            requirements = [
                "Relevant experience required",
                "Strong communication skills",
                "Problem-solving abilities"
            ]
        
        return requirements[:5]  # Limit to 5 requirements
    
    def _is_english_job(self, job: Dict[str, Any]) -> bool:
        """Check if a job posting is in English"""
        # Combine text from title, description, and company
        text_to_check = f"{job.get('title', '')} {job.get('description', '')} {job.get('company', '')}".lower()
        
        # Check for CJK characters (Chinese, Japanese, Korean) - these are definitely not English
        cjk_pattern = r'[\u4e00-\u9fff\u3040-\u309f\u30a0-\u30ff\uac00-\ud7af]'
        if re.search(cjk_pattern, text_to_check):
            return False
        
        # Check for Cyrillic characters (Russian, etc.)
        cyrillic_pattern = r'[\u0400-\u04ff]'
        if re.search(cyrillic_pattern, text_to_check):
            return False
        
        # Check for Arabic characters
        arabic_pattern = r'[\u0600-\u06ff]'
        if re.search(arabic_pattern, text_to_check):
            return False
        
        # Check if the text contains mostly ASCII characters
        # If more than 50% non-ASCII, likely not English (relaxed from 30%)
        non_ascii_count = sum(1 for char in text_to_check if ord(char) > 127)
        total_chars = len(text_to_check) if text_to_check else 1
        
        if non_ascii_count / total_chars > 0.5:
            return False
        
        return True
