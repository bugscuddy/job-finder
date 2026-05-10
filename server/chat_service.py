from ollama_client import OllamaClient
from vector_store import VectorStore
from typing import List, Tuple

class ChatService:
    def __init__(self, vector_store: VectorStore):
        self.vector_store = vector_store
        self.ollama = OllamaClient()
    
    def chat(self, message: str, context_urls: List[str] = None) -> Tuple[str, List[str]]:
        """Generate a response with documentation context"""
        # Search for relevant documentation
        relevant_chunks = self.vector_store.search(message, k=3)
        
        # If no documents are indexed, provide a helpful message
        if not relevant_chunks:
            return "No documentation has been added yet. Please add documentation URLs using the Documents tab, then I can help answer your questions based on that content.", []
        
        # Build context from relevant chunks
        context = "\n\n".join([chunk[0] for chunk in relevant_chunks])
        sources = list(set([chunk[2] for chunk in relevant_chunks if chunk[2]]))
        
        # Get document names for sources
        source_names = []
        for source_id in sources:
            if source_id in self.vector_store.documents:
                source_names.append(self.vector_store.documents[source_id]["name"])
        
        # Build system prompt for teaching
        system_prompt = """You are an expert programming teacher. Your goal is to help users learn programming, frameworks, and AI concepts by explaining them clearly and providing practical examples.

Use the provided documentation context to answer questions accurately. Break down complex concepts into simple steps. Provide code examples when relevant. Encourage the user to ask follow-up questions.

If the context doesn't contain enough information, admit it and suggest what documentation would be needed."""
        
        # Build user prompt with context
        user_prompt = f"""Context from documentation:
{context}

User question: {message}

Please provide a clear, educational response based on the documentation context above."""
        
        # Generate response
        response = self.ollama.generate(user_prompt, system_prompt)
        
        return response, source_names