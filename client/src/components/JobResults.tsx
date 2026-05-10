import { useState } from 'react'
import { Briefcase, MapPin, DollarSign, ExternalLink, ArrowLeft, Star, TrendingUp } from 'lucide-react'

interface JobResultsProps {
  jobs: any[]
  onBack: () => void
}

export default function JobResults({ jobs, onBack }: JobResultsProps) {
  const [expandedJob, setExpandedJob] = useState<number | null>(null)

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400 bg-green-900/30 border-green-700'
    if (score >= 60) return 'text-yellow-400 bg-yellow-900/30 border-yellow-700'
    return 'text-red-400 bg-red-900/30 border-red-700'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent Match'
    if (score >= 60) return 'Good Match'
    return 'Potential Match'
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-400 hover:text-white transition"
        >
          <ArrowLeft className="w-5 h-5" />
          Upload Different Resume
        </button>
        <div className="text-gray-400">
          Found {jobs.length} matching jobs
        </div>
      </div>

      <div className="space-y-4">
        {jobs.map((job, index) => (
          <div
            key={index}
            className={`bg-gray-800 rounded-xl border border-gray-700 overflow-hidden transition-all ${
              expandedJob === index ? 'ring-2 ring-blue-500' : ''
            }`}
          >
            <div
              className="p-6 cursor-pointer hover:bg-gray-750"
              onClick={() => setExpandedJob(expandedJob === index ? null : index)}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white">{job.title}</h3>
                    <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getScoreColor(job.match_score)}`}>
                      {getScoreLabel(job.match_score)}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-gray-400 text-sm mb-3">
                    <div className="flex items-center gap-1">
                      <Briefcase className="w-4 h-4" />
                      {job.company}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {job.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {job.salary}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <TrendingUp className="w-4 h-4 text-blue-500" />
                    <span className="text-sm text-gray-300">
                      Match Score: <span className="font-bold text-white">{job.match_score.toFixed(0)}%</span>
                    </span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-400">{job.match_reason}</span>
                  </div>

                  <p className="text-gray-400 text-sm line-clamp-2">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-col items-center gap-2">
                  <div className="text-3xl font-bold text-white">
                    {job.match_score.toFixed(0)}
                    <span className="text-lg text-gray-400">%</span>
                  </div>
                  <Star className={`w-5 h-5 ${job.match_score >= 80 ? 'text-yellow-400 fill-yellow-400' : 'text-gray-500'}`} />
                </div>
              </div>
            </div>

            {expandedJob === index && (
              <div className="border-t border-gray-700 p-6 bg-gray-900/50">
                <h4 className="font-semibold mb-3 text-white">Requirements:</h4>
                <div className="flex flex-wrap gap-2 mb-4">
                  {job.requirements.map((req: string, reqIndex: number) => (
                    <span
                      key={reqIndex}
                      className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm"
                    >
                      {req}
                    </span>
                  ))}
                </div>

                <h4 className="font-semibold mb-3 text-white">Full Description:</h4>
                <p className="text-gray-400 text-sm mb-4">{job.description}</p>

                <a
                  href={job.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
                >
                  <ExternalLink className="w-4 h-4" />
                  Apply Now
                </a>
              </div>
            )}
          </div>
        ))}
      </div>

      {jobs.length === 0 && (
        <div className="bg-gray-800 rounded-xl p-12 text-center border border-gray-700">
          <Briefcase className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-white mb-2">No Jobs Found</h3>
          <p className="text-gray-400">
            Try uploading a different resume or adjusting your location preferences.
          </p>
        </div>
      )}
    </div>
  )
}
