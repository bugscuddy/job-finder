import requests
from bs4 import BeautifulSoup
import trafilatura
from typing import Dict, List
import re

class DocFetcher:
    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
    
    def fetch_url(self, url: str) -> str:
        """Fetch and extract content from a URL"""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            
            # Try trafilatura first (better for documentation)
            content = trafilatura.extract(response.text)
            
            if content:
                return self._clean_content(content)
            
            # Fallback to BeautifulSoup
            soup = BeautifulSoup(response.text, 'html.parser')
            
            # Remove script and style elements
            for script in soup(["script", "style", "nav", "footer", "header"]):
                script.decompose()
            
            text = soup.get_text()
            return self._clean_content(text)
            
        except Exception as e:
            raise Exception(f"Failed to fetch URL: {str(e)}")
    
    def _clean_content(self, text: str) -> str:
        """Clean and normalize content"""
        # Remove excessive whitespace
        text = re.sub(r'\s+', ' ', text)
        # Remove special characters but keep code-relevant ones
        text = re.sub(r'[^\w\s\-\.\,\:\;\(\)\[\]\{\}\=\+\*/<>]', '', text)
        return text.strip()
    
    def fetch_multiple_urls(self, urls: List[str]) -> Dict[str, str]:
        """Fetch content from multiple URLs"""
        results = {}
        for url in urls:
            try:
                results[url] = self.fetch_url(url)
            except Exception as e:
                print(f"Failed to fetch {url}: {e}")
                results[url] = ""
        return results