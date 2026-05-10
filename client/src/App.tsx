import { useState } from 'react'
import ResumeUpload from './components/ResumeUpload'
import JobResults from './components/JobResults'
import Settings from './components/Settings'
import { Briefcase, Settings as SettingsIcon } from 'lucide-react'

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [jobs, setJobs] = useState<any[] | null>(null)

  const handleJobsFound = (foundJobs: any[]) => {
    setJobs(foundJobs)
  }

  const handleBackToUpload = () => {
    setJobs(null)
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-blue-500" />
            Job Finder
          </h1>
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition"
          >
            <SettingsIcon className="w-5 h-5" />
            Settings
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4">
        {jobs ? (
          <JobResults jobs={jobs} onBack={handleBackToUpload} />
        ) : (
          <ResumeUpload onJobsFound={handleJobsFound} />
        )}
      </main>

      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default App