import { useEffect, useState } from 'react'
import { useNavigate, Outlet, useParams } from 'react-router-dom'
import { getConversations } from '../../api/messages'
import { timeAgo } from '../../utils/time'
import { getInitials, colorFor } from '../../utils/format'
import toast from 'react-hot-toast'
import { MessageSquare } from 'lucide-react'

function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
      <div className="w-10 h-10 rounded-full bg-slate-200 flex-shrink-0" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-slate-200 rounded w-32" />
        <div className="h-3 bg-slate-100 rounded w-48" />
      </div>
    </div>
  )
}

export default function Messages() {
  const [conversations, setConversations] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { id: activeId } = useParams()

  useEffect(() => {
    getConversations()
      .then(r => setConversations(r.data.data.conversations))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load conversations.'))
      .finally(() => setLoading(false))
  }, [activeId]) // refetch when conversation changes (to update unread counts)

  return (
    <div className="flex h-[calc(100vh-7rem)] border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
      {/* Left panel — conversation list */}
      <div className={`${activeId ? 'hidden md:flex' : 'flex'} w-full md:w-80 flex-shrink-0 border-r border-slate-100 flex-col`}>
        <div className="px-4 py-4 border-b border-slate-100">
          <h1 className="text-lg font-display font-bold text-slate-900">Messages</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
          ) : conversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 px-6 text-center py-16">
              <MessageSquare size={40} className="text-slate-300" />
              <p className="text-sm text-slate-500 leading-relaxed">
                No conversations yet. Visit someone's profile and click Message to start chatting.
              </p>
            </div>
          ) : (
            conversations.map(conv => {
              const isActive = String(conv.id) === String(activeId)
              const hasUnread = Number(conv.unread_count) > 0
              return (
                <button
                  key={conv.id}
                  onClick={() => navigate(`/messages/${conv.id}`)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
                    isActive ? 'bg-brand-50 border-r-2 border-brand-500' : ''
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold ${colorFor(conv.other_user_id)}`}>
                    {getInitials(conv.other_user_name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className={`text-sm truncate ${hasUnread ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                        {conv.other_user_name}
                      </span>
                      <span className="text-xs text-slate-400 flex-shrink-0">{timeAgo(conv.last_message_at)}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-slate-500 truncate flex-1">
                        {conv.last_message || 'No messages yet'}
                      </p>
                      {hasUnread && (
                        <span className="w-2 h-2 rounded-full bg-brand-500 flex-shrink-0" />
                      )}
                    </div>
                  </div>
                </button>
              )
            })
          )}
        </div>
      </div>

      {/* Right panel — renders child Conversation route via Outlet, or empty state */}
      {activeId ? (
        <div className="flex-1 flex flex-col min-w-0">
          <Outlet />
        </div>
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-50">
          <div className="flex flex-col items-center gap-3 text-center px-8">
            <MessageSquare size={48} className="text-slate-300" />
            <p className="text-slate-400 text-sm font-medium">Select a conversation to start messaging</p>
          </div>
        </div>
      )}
    </div>
  )
}
