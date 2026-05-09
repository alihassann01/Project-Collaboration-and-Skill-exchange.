import { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { getConversation, sendMessage } from '../../api/messages'
import { useAuth } from '../../context/AuthContext'
import { formatTime, formatDateLabel } from '../../utils/time'
import { getInitials, colorFor, roleBadge } from '../../utils/format'
import toast from 'react-hot-toast'
import { MessageSquare, Send, ExternalLink, ArrowLeft } from 'lucide-react'

function groupByDay(messages) {
  const groups = []
  let currentDay = null
  messages.forEach(msg => {
    const day = new Date(msg.created_at).toDateString()
    if (day !== currentDay) {
      currentDay = day
      groups.push({ date: msg.created_at, messages: [] })
    }
    groups[groups.length - 1].messages.push(msg)
  })
  return groups
}

export default function Conversation() {
  const { id: convId } = useParams()
  const { user: me } = useAuth()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [other, setOther] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [body, setBody] = useState('')
  const [sending, setSending] = useState(false)
  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const scrollContainerRef = useRef(null)
  const wasAtBottomRef = useRef(true)

  // Load current conversation (marks messages as read on the backend)
  useEffect(() => {
    setLoading(true)
    setError(null)
    getConversation(convId)
      .then(r => {
        const d = r.data.data
        setMessages(d.messages)
        setOther(d.other_user)
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load conversation.'
        setError(msg)
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [convId])

  // Poll for new messages every 5 seconds
  useEffect(() => {
    if (loading || error) return
    const interval = setInterval(() => {
      // Check if user is at bottom before poll
      const el = scrollContainerRef.current
      if (el) {
        wasAtBottomRef.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
      }
      getConversation(convId)
        .then(r => {
          const newMessages = r.data.data.messages
          setMessages(prev => {
            if (newMessages.length !== prev.length) return newMessages
            const lastNew = newMessages[newMessages.length - 1]
            const lastOld = prev[prev.length - 1]
            if (lastNew?.id !== lastOld?.id) return newMessages
            return prev
          })
        })
        .catch(() => {}) // silent fail on poll
    }, 5000)
    return () => clearInterval(interval)
  }, [convId, loading, error])

  // Auto-scroll only if user was at the bottom
  useEffect(() => {
    if (wasAtBottomRef.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  const handleSend = async () => {
    const trimmed = body.trim()
    if (!trimmed || sending) return
    setSending(true)
    // Optimistic
    const optimistic = {
      id: `opt-${Date.now()}`,
      sender_id: me?.id,
      body: trimmed,
      is_read: 0,
      created_at: new Date().toISOString(),
    }
    setMessages(prev => [...prev, optimistic])
    setBody('')
    try {
      const r = await sendMessage(convId, trimmed)
      const real = r.data.data.message
      setMessages(prev => prev.map(m => m.id === optimistic.id ? real : m))
    } catch (err) {
      setMessages(prev => prev.filter(m => m.id !== optimistic.id))
      toast.error(err.response?.data?.message || 'Failed to send message.')
      setBody(trimmed)
    } finally {
      setSending(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const groups = groupByDay(messages)

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-red-500 text-sm">{error}</p>
      </div>
    )
  }

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-slate-100 bg-white flex-shrink-0">
        {/* Mobile back button */}
        <button
          onClick={() => navigate('/messages')}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
          title="Back to conversations"
        >
          <ArrowLeft size={18} />
        </button>

        {other && (
          <>
            <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-white text-sm font-semibold shadow-sm ${colorFor(other.id)}`}>
              {getInitials(other.name)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-slate-900 text-sm">{other.name}</span>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${roleBadge[other.role] || 'bg-slate-100 text-slate-600'}`}>
                  {other.role}
                </span>
              </div>
              {other.headline && <p className="text-xs text-slate-500 truncate">{other.headline}</p>}
            </div>
            <Link
              to={`/profile/${other.id}`}
              className="p-2 rounded-lg text-slate-400 hover:text-brand-600 hover:bg-brand-50 transition-colors"
              title="View profile"
            >
              <ExternalLink size={15} />
            </Link>
          </>
        )}
      </div>

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-5 py-4 space-y-1">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <MessageSquare size={40} className="text-slate-300" />
            <p className="text-sm text-slate-400">No messages yet. Say hello!</p>
          </div>
        ) : (
          groups.map((group, gi) => (
            <div key={gi}>
              <div className="flex items-center gap-3 my-4">
                <div className="flex-1 h-px bg-slate-100" />
                <span className="text-xs text-slate-400 font-medium">{formatDateLabel(group.date)}</span>
                <div className="flex-1 h-px bg-slate-100" />
              </div>
              {group.messages.map((msg, mi) => {
                const myId = Number(me?.id ?? me?.user_id ?? 0)
                const isMe = myId > 0 && Number(msg.sender_id) === myId
                return (
                  <div key={msg.id || mi} className={`flex ${isMe ? 'justify-end' : 'justify-start'} mb-1`}>
                    <div className={`max-w-xs md:max-w-md lg:max-w-lg ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
                        isMe
                          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-br-sm shadow-sm'
                          : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                      }`}>
                        {msg.body}
                      </div>
                      <span className="text-xs text-slate-400 px-1">{formatTime(msg.created_at)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          ))
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex-shrink-0 border-t border-slate-100 px-4 py-3 bg-white">
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={body}
            onChange={e => setBody(e.target.value.slice(0, 2000))}
            onKeyDown={handleKeyDown}
            placeholder="Type a message… (Enter to send)"
            rows={1}
            maxLength={2000}
            className="flex-1 resize-none rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all max-h-24 overflow-y-auto bg-slate-50 focus:bg-white"
            style={{ minHeight: '42px' }}
          />
          <button
            onClick={handleSend}
            disabled={!body.trim() || sending}
            className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-r from-brand-500 to-brand-600 text-white flex items-center justify-center hover:from-brand-600 hover:to-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Send size={16} />
            }
          </button>
        </div>
        {body.length > 0 && (
          <p className={`text-xs mt-1 text-right ${body.length >= 1900 ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
            {body.length} / 2000
          </p>
        )}
      </div>
    </>
  )
}
