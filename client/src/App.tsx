import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import ChatArea from './components/ChatArea'
import Settings from './components/Settings'

interface Conversation {
  id: string
  title: string
  timestamp: Date
}

function App() {
  const [showSettings, setShowSettings] = useState(false)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  useEffect(() => {
    const savedConversations = localStorage.getItem('job-finder-conversations')
    if (savedConversations) {
      const parsed = JSON.parse(savedConversations)
      setConversations(parsed)
    }
  }, [])

  useEffect(() => {
    if (conversations.length > 0) {
      localStorage.setItem('job-finder-conversations', JSON.stringify(conversations))
    }
  }, [conversations])

  const handleNewChat = () => {
    const newConversation: Conversation = {
      id: Date.now().toString(),
      title: 'New conversation',
      timestamp: new Date()
    }
    setConversations(prev => [newConversation, ...prev])
    setCurrentConversationId(newConversation.id)
  }

  const handleSelectConversation = (id: string) => {
    setCurrentConversationId(id)
  }

  const handleOpenSettings = () => {
    setShowSettings(true)
  }

  return (
    <div className="flex h-screen bg-[#212121] text-white">
      <Sidebar
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onOpenSettings={handleOpenSettings}
        currentConversationId={currentConversationId}
        conversations={conversations}
      />
      <ChatArea conversationId={currentConversationId} />
      {showSettings && <Settings onClose={() => setShowSettings(false)} />}
    </div>
  )
}

export default App