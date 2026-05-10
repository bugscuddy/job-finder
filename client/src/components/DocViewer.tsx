import { useState } from 'react'
import { Trash2, X, BookOpen, FileText, Plus } from 'lucide-react'
import { addDocument, deleteDocument } from '../lib/api'

interface DocViewerProps {
  documents: any[]
  onRefresh: () => void
}

export default function DocViewer({ documents, onRefresh }: DocViewerProps) {
  const [showAddDoc, setShowAddDoc] = useState(false)
  const [newUrl, setNewUrl] = useState('')
  const [newName, setNewName] = useState('')
  const [isAdding, setIsAdding] = useState(false)

  const handleAddDoc = async () => {
    if (!newUrl.trim()) return

    setIsAdding(true)
    try {
      await addDocument(newUrl, newName || undefined)
      setNewUrl('')
      setNewName('')
      setShowAddDoc(false)
      onRefresh()
    } catch (error) {
      console.error('Failed to add document:', error)
      alert('Failed to add document. Please check the URL and try again.')
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to delete this document?')) return

    try {
      await deleteDocument(docId)
      onRefresh()
    } catch (error) {
      console.error('Failed to delete document:', error)
      alert('Failed to delete document.')
    }
  }

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setShowAddDoc(true)}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg transition"
        >
          <Plus className="w-5 h-5" />
          Add Doc
        </button>
      </div>

      {showAddDoc && (
        <div className="mb-6 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BookOpen className="w-5 h-5" />
              Add Documentation
            </h3>
            <button
              onClick={() => setShowAddDoc(false)}
              className="text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Documentation URL</label>
              <input
                type="url"
                value={newUrl}
                onChange={(e) => setNewUrl(e.target.value)}
                placeholder="https://docs.example.com"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Name (optional)</label>
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="React Documentation"
                className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
              />
            </div>
            <button
              onClick={handleAddDoc}
              disabled={isAdding || !newUrl.trim()}
              className="bg-green-600 hover:bg-green-700 disabled:bg-gray-700 px-6 py-2 rounded-lg transition"
            >
              {isAdding ? 'Adding...' : 'Add Documentation'}
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-4">
        {documents.length === 0 ? (
          <div className="text-center text-gray-400 py-20">
            <FileText className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-xl">No documentation added yet</p>
            <p className="text-sm mt-2">Click "Add Doc" to get started</p>
          </div>
        ) : (
          documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h4 className="font-semibold">{doc.name}</h4>
                  <p className="text-sm text-gray-400">{doc.url}</p>
                  <p className="text-xs text-gray-500">{doc.chunk_count} chunks indexed</p>
                </div>
              </div>
              <button
                onClick={() => handleDeleteDoc(doc.id)}
                className="text-gray-400 hover:text-red-400 transition p-2"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  )
}