import { useState } from 'react'
import { Plus, MessageSquare, Settings, Trash2, Edit3 } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  timestamp: Date
}

interface SidebarProps {
  onNewChat: () => void
  onSelectConversation: (id: string) => void
  onOpenSettings: () => void
  currentConversationId: string | null
  conversations: Conversation[]
}

export default function Sidebar({
  onNewChat,
  onSelectConversation,
  onOpenSettings,
  currentConversationId,
  conversations
}: SidebarProps) {
  const [isHoveredId, setIsHoveredId] = useState<string | null>(null)

  return (
    <div className="w-64 bg-[#171717] h-screen flex flex-col border-r border-gray-800">
      {/* New Chat Button */}
      <div className="p-3">
        <button
          onClick={onNewChat}
          className="w-full flex items-center gap-2 px-3 py-2.5 bg-white hover:bg-gray-200 text-black rounded-lg transition-colors text-sm"
        >
          <Plus className="w-4 h-4" />
          <span className="font-medium">New chat</span>
        </button>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto px-3">
        <div className="space-y-1">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group flex items-center gap-2 px-3 py-3 rounded-lg cursor-pointer transition-colors ${
                currentConversationId === conv.id
                  ? 'bg-gray-800'
                  : 'hover:bg-gray-800/50'
              }`}
              onMouseEnter={() => setIsHoveredId(conv.id)}
              onMouseLeave={() => setIsHoveredId(null)}
              onClick={() => onSelectConversation(conv.id)}
            >
              <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-200 truncate">{conv.title}</p>
              </div>
              {isHoveredId === conv.id && (
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle edit
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Edit3 className="w-3 h-3 text-gray-400" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // Handle delete
                    }}
                    className="p-1 hover:bg-gray-700 rounded transition-colors"
                  >
                    <Trash2 className="w-3 h-3 text-gray-400" />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Section */}
      <div className="p-3 border-t border-gray-800">
        <button
          onClick={onOpenSettings}
          className="w-full flex items-center gap-2 px-3 py-3 hover:bg-gray-800 rounded-lg transition-colors text-gray-200"
        >
          <Settings className="w-4 h-4" />
          <span className="text-sm">Settings</span>
        </button>
      </div>
    </div>
  )
}
