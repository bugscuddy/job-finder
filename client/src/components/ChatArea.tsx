import { useState, useRef, useEffect } from 'react'
import { Send, Upload, MapPin, Briefcase, Bot, User, Paperclip } from 'lucide-react'
import { uploadResume, searchJobs, matchJobs } from '../lib/api'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  type?: 'text' | 'resume' | 'jobs' | 'location'
  data?: any
}

interface ChatAreaProps {
  conversationId: string | null
}

export default function ChatArea({ conversationId: _conversationId }: ChatAreaProps) {
  // conversationId is used for future conversation persistence
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResumeUpload, setShowResumeUpload] = useState(false)
  const [location, setLocation] = useState('')
  const [resumeDetails, setResumeDetails] = useState<any>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input
    }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    // Check if user wants to upload resume
    if (input.toLowerCase().includes('upload') || input.toLowerCase().includes('resume')) {
      setShowResumeUpload(true)
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'll help you upload your resume. Please upload your resume file (PDF, DOCX, or TXT) and I'll analyze it to find matching jobs.",
        type: 'resume'
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
      return
    }

    // Check if user wants to set location
    if (input.toLowerCase().includes('location') || input.toLowerCase().includes('where')) {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "Where would you like to find jobs? You can specify a location (e.g., 'San Francisco, CA') or leave it blank for remote opportunities.",
        type: 'location'
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
      return
    }

    // Check if user wants to search for jobs
    if (input.toLowerCase().includes('search') || input.toLowerCase().includes('find') || input.toLowerCase().includes('jobs')) {
      if (!resumeDetails) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: "To find matching jobs, I'll need to analyze your resume first. Please upload your resume to get started."
        }
        setMessages(prev => [...prev, assistantMessage])
        setIsLoading(false)
        return
      }

      try {
        const skills = resumeDetails.skills || []
        const query = skills.length > 0 ? skills.join(' ') : 'software engineer developer'
        
        const searchResult = await searchJobs(query, location, 15)
        const matchResult = await matchJobs(resumeDetails, searchResult.jobs)

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: `I found ${matchResult.matched_jobs.length} jobs that match your profile. Here are the top matches:`,
          type: 'jobs',
          data: matchResult.matched_jobs
        }
        setMessages(prev => [...prev, assistantMessage])
      } catch (error) {
        console.error('Failed to search jobs:', error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: 'Sorry, I encountered an error while searching for jobs. Please try again.'
        }
        setMessages(prev => [...prev, errorMessage])
      }
      setIsLoading(false)
      return
    }

    // Default AI response
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: "I'm your AI job finder assistant. You can:\n• Upload your resume to get started\n• Set your preferred location\n• Search for matching jobs\n\nWhat would you like to do?"
      }
      setMessages(prev => [...prev, assistantMessage])
      setIsLoading(false)
    }, 500)
  }

  const handleResumeUpload = async (file: File) => {
    setIsLoading(true)
    setShowResumeUpload(false)

    try {
      const result = await uploadResume(file)
      setResumeDetails(result.resume_details)

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `I've analyzed your resume and found ${result.resume_details.skills?.length || 0} skills. You can now search for jobs that match your profile.`,
        type: 'text',
        data: { resumeName: file.name, skills: result.resume_details.skills }
      }
      setMessages(prev => [...prev, assistantMessage])
    } catch (error) {
      console.error('Failed to upload resume:', error)
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while uploading your resume. Please try again.'
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleLocationSubmit = () => {
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: location
        ? `I'll search for jobs in ${location}. You can now search for matching jobs.`
        : "I'll search for remote jobs. You can now search for matching jobs."
    }
    setMessages(prev => [...prev, assistantMessage])
    setLocation('')
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  return (
    <div className="flex-1 flex flex-col h-screen bg-[#212121]">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-6">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <div className="bg-[#212121] rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-gray-400" />
              </div>
              <h2 className="text-2xl font-semibold text-white mb-2">Job Finder AI</h2>
              <p className="text-gray-400 mb-8">Upload your resume and I'll find matching jobs for you</p>
              
              <div className="grid grid-cols-2 gap-3 max-w-xl mx-auto">
                <button
                  onClick={() => { setInput('Upload my resume'); setShowResumeUpload(true) }}
                  className="flex items-center gap-3 p-4 bg-[#2f2f2f] hover:bg-[#3f3f3f] rounded-xl transition-colors text-left"
                >
                  <Upload className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-200">Upload Resume</span>
                </button>
                <button
                  onClick={() => setInput('Set my job location')}
                  className="flex items-center gap-3 p-4 bg-[#2f2f2f] hover:bg-[#3f3f3f] rounded-xl transition-colors text-left"
                >
                  <MapPin className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-200">Set Location</span>
                </button>
                <button
                  onClick={() => setInput('Search for jobs')}
                  className="flex items-center gap-3 p-4 bg-[#2f2f2f] hover:bg-[#3f3f3f] rounded-xl transition-colors text-left"
                >
                  <Briefcase className="w-5 h-5 text-gray-400" />
                  <span className="text-sm text-gray-200">Find Jobs</span>
                </button>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="mb-6">
              <div className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center flex-shrink-0">
                    <Bot className="w-5 h-5 text-white" />
                  </div>
                )}
                <div className={`max-w-2xl ${msg.role === 'user' ? 'bg-[#2f2f2f]' : ''} rounded-lg px-4 py-3`}>
                  {msg.role === 'assistant' && msg.type === 'resume' && (
                    <div className="mb-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.docx,.txt"
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              handleResumeUpload(e.target.files[0])
                            }
                          }}
                          className="hidden"
                          id="resume-upload-chat"
                        />
                        <div className="flex items-center gap-2 px-4 py-3 bg-[#2f2f2f] hover:bg-[#3f3f3f] rounded-lg transition-colors cursor-pointer">
                          <Upload className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-200">Choose resume file</span>
                        </div>
                      </label>
                    </div>
                  )}
                  {msg.role === 'assistant' && msg.type === 'location' && (
                    <div className="mb-4 flex gap-2">
                      <input
                        type="text"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter location (optional)"
                        className="flex-1 bg-[#2f2f2f] border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#19c37d]"
                      />
                      <button
                        onClick={handleLocationSubmit}
                        className="px-4 py-2 bg-[#19c37d] hover:bg-[#1a9f6a] text-white rounded-lg transition-colors"
                      >
                        Set
                      </button>
                    </div>
                  )}
                  <p className="text-gray-200 whitespace-pre-wrap">{msg.content}</p>
                  {msg.type === 'jobs' && msg.data && (
                    <div className="mt-4 space-y-3">
                      {msg.data.slice(0, 5).map((job: any, index: number) => (
                        <div key={index} className="bg-[#2f2f2f] rounded-lg p-4 border border-gray-700">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1">
                              <h4 className="font-semibold text-white mb-1">{job.title}</h4>
                              <p className="text-sm text-gray-400 mb-2">{job.company} • {job.location}</p>
                              <div className="flex items-center gap-2">
                                <span className={`text-sm font-semibold ${getScoreColor(job.match_score)}`}>
                                  {job.match_score.toFixed(0)}% match
                                </span>
                                <span className="text-xs text-gray-500">• {job.match_reason}</span>
                              </div>
                            </div>
                            <a
                              href={job.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-[#19c37d] hover:text-[#1a9f6a] text-sm font-medium"
                            >
                              Apply →
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-[#7c3aed] flex items-center justify-center flex-shrink-0">
                    <User className="w-5 h-5 text-white" />
                  </div>
                )}
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex gap-4 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#19c37d] flex items-center justify-center flex-shrink-0">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="bg-[#2f2f2f] rounded-lg px-4 py-3">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="relative flex items-end gap-2 bg-[#2f2f2f] rounded-xl border border-gray-700 focus-within:border-gray-600">
            <button
              onClick={() => setShowResumeUpload(!showResumeUpload)}
              className="p-3 hover:bg-[#3f3f3f] rounded-lg transition-colors"
              title="Upload resume"
            >
              <Paperclip className="w-5 h-5 text-gray-400" />
            </button>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSendMessage()
                }
              }}
              placeholder="Message Job Finder AI..."
              className="flex-1 bg-transparent border-none text-white placeholder-gray-500 focus:outline-none resize-none py-3 max-h-32"
              rows={1}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim()}
              className="p-3 bg-white hover:bg-gray-200 disabled:bg-gray-700 disabled:text-gray-500 rounded-lg transition-colors"
            >
              <Send className="w-5 h-5 text-black" />
            </button>
          </div>
          <p className="text-xs text-gray-500 text-center mt-2">
            Job Finder AI can make mistakes. Verify important information.
          </p>
        </div>
      </div>
    </div>
  )
}
