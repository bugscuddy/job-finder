import { useState } from 'react'
import { Sparkles, Briefcase, User } from 'lucide-react'
import { generateResume } from '../lib/api'

interface ApplicationInputProps {
  onResumeGenerated: (jobRequirements: any, userDetails: any, resume: string) => void
}

export default function ApplicationInput({ onResumeGenerated }: ApplicationInputProps) {
  const [jobPosting, setJobPosting] = useState('')
  const [userBackground, setUserBackground] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    if (!jobPosting.trim()) {
      setError('Please paste a job posting')
      return
    }
    if (!userBackground.trim()) {
      setError('Please provide your background and experience')
      return
    }

    setIsGenerating(true)
    setError('')

    try {
      const result = await generateResume(jobPosting, userBackground)
      onResumeGenerated(result.job_requirements, result.user_details, result.resume)
    } catch (err) {
      setError('Failed to generate resume. Please check your Ollama connection and try again.')
      console.error(err)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-lg">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Paste Job Posting</h2>
            <p className="text-gray-400 text-sm">Copy and paste the job description you want to apply for</p>
          </div>
        </div>

        <textarea
          value={jobPosting}
          onChange={(e) => setJobPosting(e.target.value)}
          placeholder="Paste the job posting here. Include:
- Job title and company
- Responsibilities
- Requirements
- Qualifications
- Tech stack mentioned
- Any other details from the posting..."
          className="w-full h-48 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
        />
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Your Background</h2>
            <p className="text-gray-400 text-sm">Paste your resume, experience, or background details</p>
          </div>
        </div>

        <textarea
          value={userBackground}
          onChange={(e) => setUserBackground(e.target.value)}
          placeholder="Paste your background here. Include:
- Your name and contact information
- Work experience (companies, roles, dates, achievements)
- Education
- Skills (technical and soft skills)
- Certifications
- Projects or notable achievements
- Any other relevant experience..."
          className="w-full h-64 bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
      </div>

      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
          {error}
        </div>
      )}

      <button
        onClick={handleGenerate}
        disabled={isGenerating || !jobPosting.trim() || !userBackground.trim()}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition"
      >
        {isGenerating ? (
          <>
            <Sparkles className="w-5 h-5 animate-pulse" />
            Generating Tailored Resume...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate Tailored Resume
          </>
        )}
      </button>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold mb-3 text-gray-300">How it works:</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-purple-500">1.</span>
            The AI extracts key requirements from the job posting
          </li>
          <li className="flex items-start gap-2">
            <span className="text-blue-500">2.</span>
            It analyzes your background and experience
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">3.</span>
            It generates a resume tailored specifically to match the job requirements
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500">4.</span>
            Keywords from the job posting are emphasized throughout
          </li>
        </ul>
      </div>
    </div>
  )
}
