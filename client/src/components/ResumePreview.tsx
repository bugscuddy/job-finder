import { useState } from 'react'
import { Download, Copy, Check, ArrowLeft, Briefcase, User } from 'lucide-react'

interface ResumePreviewProps {
  jobRequirements: any
  userDetails: any
  resume: string
  onBack: () => void
}

export default function ResumePreview({ jobRequirements, userDetails, resume, onBack }: ResumePreviewProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(resume)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([resume], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${userDetails.full_name || jobRequirements.job_title || 'resume'}.md`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleDownloadTxt = () => {
    const blob = new Blob([resume], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${userDetails.full_name || jobRequirements.job_title || 'resume'}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Input
        </button>
        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download MD
          </button>
          <button
            onClick={handleDownloadTxt}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition"
          >
            <Download className="w-4 h-4" />
            Download TXT
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl p-8 text-gray-900 shadow-xl">
        <div className="prose prose-lg max-w-none">
          <div dangerouslySetInnerHTML={{ __html: resume.replace(/\n/g, '<br/>') }} />
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-purple-500" />
            Job Requirements Extracted
          </h3>
          <div className="space-y-3 text-sm">
            <div>
              <span className="text-gray-400">Job Title:</span>
              <span className="ml-2 text-white">{jobRequirements.job_title || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Company:</span>
              <span className="ml-2 text-white">{jobRequirements.company || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Location:</span>
              <span className="ml-2 text-white">{jobRequirements.location || 'N/A'}</span>
            </div>
            {jobRequirements.required_skills && jobRequirements.required_skills.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-400 text-sm">Required Skills:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {jobRequirements.required_skills.slice(0, 8).map((skill: string, index: number) => (
                    <span key={index} className="bg-purple-900/50 text-purple-300 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {jobRequirements.required_skills.length > 8 && (
                    <span className="text-gray-500 text-xs">+{jobRequirements.required_skills.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" />
            Your Background Extracted
          </h3>
          <div className="grid grid-cols-1 gap-3 text-sm">
            <div>
              <span className="text-gray-400">Name:</span>
              <span className="ml-2 text-white">{userDetails.full_name || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Email:</span>
              <span className="ml-2 text-white">{userDetails.email || 'N/A'}</span>
            </div>
            <div>
              <span className="text-gray-400">Location:</span>
              <span className="ml-2 text-white">{userDetails.location || 'N/A'}</span>
            </div>
            {userDetails.skills && userDetails.skills.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-400 text-sm">Your Skills:</span>
                <div className="mt-2 flex flex-wrap gap-2">
                  {userDetails.skills.slice(0, 8).map((skill: string, index: number) => (
                    <span key={index} className="bg-blue-900/50 text-blue-300 px-2 py-1 rounded-full text-xs">
                      {skill}
                    </span>
                  ))}
                  {userDetails.skills.length > 8 && (
                    <span className="text-gray-500 text-xs">+{userDetails.skills.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
            {userDetails.experience && userDetails.experience.length > 0 && (
              <div className="mt-3">
                <span className="text-gray-400 text-sm">Experience Entries:</span>
                <span className="ml-2 text-white">{userDetails.experience.length}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
