const API_BASE = 'http://localhost:8000/api'

export interface Document {
  id: string
  name: string
  url: string
  chunk_count: number
}

export async function fetchDocuments(): Promise<{ documents: Document[] }> {
  const response = await fetch(`${API_BASE}/documents`)
  if (!response.ok) throw new Error('Failed to fetch documents')
  return response.json()
}

export async function addDocument(url: string, name?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/fetch-doc`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ url, name })
  })
  if (!response.ok) throw new Error('Failed to add document')
  return response.json()
}

export async function deleteDocument(docId: string): Promise<any> {
  const response = await fetch(`${API_BASE}/documents/${docId}`, {
    method: 'DELETE'
  })
  if (!response.ok) throw new Error('Failed to delete document')
  return response.json()
}

export async function sendMessage(message: string, contextUrls?: string[]): Promise<any> {
  const response = await fetch(`${API_BASE}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, context_urls: contextUrls })
  })
  if (!response.ok) throw new Error('Failed to send message')
  return response.json()
}

export async function getConfig(): Promise<any> {
  const response = await fetch(`${API_BASE}/config`)
  if (!response.ok) throw new Error('Failed to get config')
  return response.json()
}

export async function updateConfig(ollamaBaseUrl?: string, ollamaModel?: string): Promise<any> {
  const response = await fetch(`${API_BASE}/config`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ 
      ollama_base_url: ollamaBaseUrl, 
      ollama_model: ollamaModel 
    })
  })
  if (!response.ok) throw new Error('Failed to update config')
  return response.json()
}

export async function uploadResume(file: File): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await fetch(`${API_BASE}/upload-resume`, {
    method: 'POST',
    body: formData
  })
  if (!response.ok) throw new Error('Failed to upload resume')
  return response.json()
}

export async function searchJobs(query: string, location: string = '', limit: number = 10): Promise<any> {
  const response = await fetch(`${API_BASE}/search-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, location, limit })
  })
  if (!response.ok) throw new Error('Failed to search jobs')
  return response.json()
}

export async function matchJobs(resumeDetails: any, jobs: any[]): Promise<any> {
  const response = await fetch(`${API_BASE}/match-jobs`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resume_details: resumeDetails, jobs })
  })
  if (!response.ok) throw new Error('Failed to match jobs')
  return response.json()
}