import requests
import json
from typing import Generator
from config import config

class OllamaClient:
    def __init__(self):
        self.base_url = config.get("ollama.base_url", "http://localhost:11434")
        self.model = config.get("ollama.model", "qwen3-coder:480b-cloud")
    
    def update_config(self, base_url: str = None, model: str = None):
        """Update configuration dynamically"""
        if base_url:
            self.base_url = base_url
            config.set("ollama.base_url", base_url)
        if model:
            self.model = model
            config.set("ollama.model", model)
    
    def generate(self, prompt: str, system_prompt: str = "") -> str:
        """Generate a response from Ollama"""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": False
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        response = requests.post(url, json=payload, timeout=120)
        response.raise_for_status()
        
        result = response.json()
        return result.get("response", "")
    
    def generate_stream(self, prompt: str, system_prompt: str = "") -> Generator[str, None, None]:
        """Generate a streaming response from Ollama"""
        url = f"{self.base_url}/api/generate"
        
        payload = {
            "model": self.model,
            "prompt": prompt,
            "stream": True
        }
        
        if system_prompt:
            payload["system"] = system_prompt
        
        response = requests.post(url, json=payload, stream=True, timeout=120)
        response.raise_for_status()
        
        for line in response.iter_lines():
            if line:
                try:
                    data = json.loads(line)
                    if "response" in data:
                        yield data["response"]
                except json.JSONDecodeError:
                    continue
    
    def list_models(self):
        """List available models"""
        url = f"{self.base_url}/api/tags"
        response = requests.get(url)
        response.raise_for_status()
        return response.json()