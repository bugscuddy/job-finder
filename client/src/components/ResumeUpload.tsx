import { useState } from 'react'
import { Upload, Search, MapPin, Sparkles, Briefcase } from 'lucide-react'
import { uploadResume, searchJobs, matchJobs } from '../lib/api'

interface ResumeUploadProps {
  onJobsFound: (jobs: any[]) => void
}

export default function ResumeUpload({ onJobsFound }: ResumeUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [location, setLocation] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSearching, setIsSearching] = useState(false)
  const [error, setError] = useState('')
  const [resumeDetails, setResumeDetails] = useState<any>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0])
      setError('')
    }
  }

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a resume file')
      return
    }

    setIsUploading(true)
    setError('')

    try {
      const result = await uploadResume(file)
      setResumeDetails(result.resume_details)
    } catch (err) {
      setError('Failed to upload resume. Please try again.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleSearch = async () => {
    if (!resumeDetails) {
      setError('Please upload a resume first')
      return
    }

    setIsSearching(true)
    setError('')

    try {
      // Generate search query from resume details
      const skills = resumeDetails.skills || []
      const query = skills.length > 0 ? skills.join(' ') : 'software engineer developer'
      
      // Search for jobs
      const searchResult = await searchJobs(query, location, 15)
      
      // Match jobs with resume
      const matchResult = await matchJobs(resumeDetails, searchResult.jobs)
      
      onJobsFound(matchResult.matched_jobs)
    } catch (err) {
      setError('Failed to search for jobs. Please try again.')
      console.error(err)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-600 rounded-lg">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Upload Your Resume</h2>
            <p className="text-gray-400 text-sm">Upload your resume (PDF, DOCX, or TXT)</p>
          </div>
        </div>

        <div className="border-2 border-dashed border-gray-700 rounded-lg p-8 text-center hover:border-gray-600 transition">
          <input
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
            id="resume-upload"
          />
          <label
            htmlFor="resume-upload"
            className="cursor-pointer"
          >
            <div className="flex flex-col items-center gap-3">
              <Upload className="w-12 h-12 text-gray-500" />
              {file ? (
                <div>
                  <p className="text-white font-medium">{file.name}</p>
                  <p className="text-gray-400 text-sm">{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div>
                  <p className="text-white font-medium">Click to upload or drag and drop</p>
                  <p className="text-gray-400 text-sm">PDF, DOCX, or TXT (max 10MB)</p>
                </div>
              )}
            </div>
          </label>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-300">
            {error}
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={!file || isUploading}
          className="mt-6 w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-3 px-6 rounded-lg transition"
        >
          {isUploading ? (
            <>
              <Sparkles className="w-5 h-5 animate-pulse" />
              Analyzing Resume...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5" />
              Upload & Analyze
            </>
          )}
        </button>

        {resumeDetails && (
          <div className="mt-6 p-4 bg-green-900/30 border border-green-700 rounded-lg">
            <p className="text-green-300 font-medium flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Resume analyzed successfully!
            </p>
            <p className="text-gray-400 text-sm mt-2">
              Found {resumeDetails.skills?.length || 0} skills in your resume
            </p>
          </div>
        )}
      </div>

      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-purple-600 rounded-lg">
            <MapPin className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold">Location (Optional)</h2>
            <p className="text-gray-400 text-sm">Specify your preferred job location</p>
          </div>
        </div>

        <input
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="e.g., San Francisco, CA, Remote, New York"
          className="w-full bg-gray-900 border border-gray-700 rounded-lg p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
        />
      </div>

      <button
        onClick={handleSearch}
        disabled={!resumeDetails || isSearching}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-lg transition"
      >
        {isSearching ? (
          <>
            <Search className="w-5 h-5 animate-pulse" />
            Finding Jobs for You...
          </>
        ) : (
          <>
            <Briefcase className="w-5 h-5" />
            Find Matching Jobs
          </>
        )}
      </button>

      <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700">
        <h3 className="font-semibold mb-3 text-gray-300">How it works:</h3>
        <ul className="space-y-2 text-gray-400 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-blue-500">1.</span>
            Upload your resume (PDF, DOCX, or TXT)
          </li>
          <li className="flex items-start gap-2">
            <span className="text-purple-500">2.</span>
            AI extracts your skills and experience
          </li>
          <li className="flex items-start gap-2">
            <span className="text-green-500">3.</span>
            Searches for jobs matching your profile
          </li>
          <li className="flex items-start gap-2">
            <span className="text-yellow-500">4.</span>
            Scores and ranks jobs by match percentage
          </li>
        </ul>
      </div>
    </div>
  )
}
