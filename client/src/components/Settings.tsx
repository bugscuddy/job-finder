import { useState, useEffect } from 'react'
import { Settings as SettingsIcon, Save, X } from 'lucide-react'
import { getConfig, updateConfig } from '../lib/api'

interface SettingsProps {
  onClose: () => void
}

export default function Settings({ onClose }: SettingsProps) {
  const [ollamaBaseUrl, setOllamaBaseUrl] = useState('')
  const [ollamaModel, setOllamaModel] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const config = await getConfig()
      setOllamaBaseUrl(config.ollama?.base_url || 'http://localhost:11434')
      setOllamaModel(config.ollama?.model || 'qwen3-coder:480b-cloud')
    } catch (error) {
      console.error('Failed to load config:', error)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateConfig(ollamaBaseUrl, ollamaModel)
      alert('Settings saved successfully!')
      onClose()
    } catch (error) {
      console.error('Failed to save config:', error)
      alert('Failed to save settings. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold flex items-center gap-2">
            <SettingsIcon className="w-6 h-6" />
            AI Settings
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Ollama Base URL</label>
            <input
              type="text"
              value={ollamaBaseUrl}
              onChange={(e) => setOllamaBaseUrl(e.target.value)}
              placeholder="http://localhost:11434"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">The URL where your Ollama instance is running</p>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Ollama Model</label>
            <input
              type="text"
              value={ollamaModel}
              onChange={(e) => setOllamaModel(e.target.value)}
              placeholder="qwen3-coder:480b-cloud"
              className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">The model name to use (run 'ollama list' to see available models)</p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 px-4 py-2 rounded-lg transition flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              {isSaving ? 'Saving...' : 'Save Settings'}
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
