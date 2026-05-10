import numpy as np
import faiss
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Optional, Tuple
import uuid
import pickle
import os

class VectorStore:
    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self.dimension = self.model.get_sentence_embedding_dimension()
        self.index = faiss.IndexFlatL2(self.dimension)
        self.documents: Dict[str, Dict] = {}
        self.chunks: List[str] = []
        
        # Load existing index if available
        self._load_index()
    
    def _chunk_text(self, text: str, chunk_size: int = 500, overlap: int = 50) -> List[str]:
        """Split text into overlapping chunks"""
        words = text.split()
        chunks = []
        
        for i in range(0, len(words), chunk_size - overlap):
            chunk = " ".join(words[i:i + chunk_size])
            if chunk.strip():
                chunks.append(chunk)
        
        return chunks
    
    def add_document(self, content: str, url: str, name: Optional[str] = None) -> str:
        """Add a document to the vector store"""
        doc_id = str(uuid.uuid4())
        
        chunks = self._chunk_text(content)
        embeddings = self.model.encode(chunks)
        
        # Add to FAISS index
        self.index.add(embeddings.astype(np.float32))
        
        # Store document metadata
        self.documents[doc_id] = {
            "id": doc_id,
            "url": url,
            "name": name or url,
            "content": content,
            "chunks": chunks,
            "chunk_start_idx": len(self.chunks)
        }
        
        self.chunks.extend(chunks)
        self._save_index()
        
        return doc_id
    
    def search(self, query: str, k: int = 5) -> List[Tuple[str, float, str]]:
        """Search for relevant chunks"""
        if len(self.chunks) == 0:
            return []
        
        query_embedding = self.model.encode([query])
        distances, indices = self.index.search(query_embedding.astype(np.float32), k)
        
        results = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx >= 0 and idx < len(self.chunks):
                results.append((self.chunks[idx], float(dist), self._get_doc_id_for_chunk(idx)))
        
        return results
    
    def _get_doc_id_for_chunk(self, chunk_idx: int) -> str:
        """Find which document a chunk belongs to"""
        for doc_id, doc in self.documents.items():
            if doc["chunk_start_idx"] <= chunk_idx < doc["chunk_start_idx"] + len(doc["chunks"]):
                return doc_id
        return ""
    
    def list_documents(self) -> List[Dict]:
        """List all documents"""
        return [
            {
                "id": doc["id"],
                "name": doc["name"],
                "url": doc["url"],
                "chunk_count": len(doc["chunks"])
            }
            for doc in self.documents.values()
        ]
    
    def delete_document(self, doc_id: str):
        """Delete a document (simplified - rebuilds index)"""
        if doc_id in self.documents:
            del self.documents[doc_id]
            self._rebuild_index()
            self._save_index()
    
    def _rebuild_index(self):
        """Rebuild the FAISS index from remaining documents"""
        self.index = faiss.IndexFlatL2(self.dimension)
        self.chunks = []
        
        for doc_id, doc in self.documents.items():
            doc["chunk_start_idx"] = len(self.chunks)
            embeddings = self.model.encode(doc["chunks"])
            self.index.add(embeddings.astype(np.float32))
            self.chunks.extend(doc["chunks"])
    
    def _save_index(self):
        """Save index to disk"""
        os.makedirs("data", exist_ok=True)
        with open("data/vector_store.pkl", "wb") as f:
            pickle.dump({
                "documents": self.documents,
                "chunks": self.chunks
            }, f)
        faiss.write_index(self.index, "data/faiss.index")
    
    def _load_index(self):
        """Load index from disk"""
        if os.path.exists("data/vector_store.pkl") and os.path.exists("data/faiss.index"):
            try:
                with open("data/vector_store.pkl", "rb") as f:
                    data = pickle.load(f)
                    self.documents = data["documents"]
                    self.chunks = data["chunks"]
                self.index = faiss.read_index("data/faiss.index")
            except Exception as e:
                print(f"Failed to load index: {e}")