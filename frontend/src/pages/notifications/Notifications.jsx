import { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { getNotifications, markOneRead, markAllRead } from '../../api/notifications'
import { timeAgo } from '../../utils/time'
import toast from 'react-hot-toast'
import { Bell, MessageSquare, RefreshCw, CheckSquare, Briefcase, FileText, Star, ExternalLink } from 'lucide-react'



const typeIcons = {
  message: <MessageSquare size={18} className="text-brand-500" />,
  swap_request: <RefreshCw size={18} className="text-violet-500" />,
  swap_response: <CheckSquare size={18} className="text-teal-500" />,
  project: <Briefcase size={18} className="text-amber-500" />,
  application: <FileText size={18} className="text-blue-500" />,
  rating: <Star size={18} className="text-yellow-500" />,
}
const defaultIcon = <Bell size={18} className="text-slate-400" />

function SkeletonRow() {
  return (
    <div className="flex items-start gap-3 px-5 py-4">
      <div className="w-9 h-9 rounded-xl skeleton flex-shrink-0 mt-0.5" />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 skeleton rounded w-40" />
        <div className="h-3 skeleton rounded w-64" />
      </div>
      <div className="h-3 skeleton rounded w-12 flex-shrink-0" />
    </div>
  )
}

export default function Notifications() {
  const [items, setItems] = useState([])
  const [unread, setUnread] = useState(0)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    getNotifications()
      .then(r => {
        const d = r.data.data
        setItems(d.notifications)
        setUnread(d.unread_count)
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load notifications.'))
      .finally(() => setLoading(false))
  }, [])

  const handleClick = async (item) => {
    if (!item.is_read) {
      try {
        await markOneRead(item.id)
        setItems(prev => prev.map(n => n.id === item.id ? { ...n, is_read: 1 } : n))
        const newCount = Math.max(0, unread - 1)
        setUnread(newCount)
        window.dispatchEvent(new CustomEvent('navbar:unread', { detail: { count: newCount } }))
      } catch (err) {
        toast.error(err.response?.data?.message || 'Could not mark as read.')
      }
    }
    if (item.link) navigate(item.link)
  }

  const handleMarkAll = async () => {
    try {
      await markAllRead()
      setItems(prev => prev.map(n => ({ ...n, is_read: 1 })))
      setUnread(0)
      window.dispatchEvent(new CustomEvent('navbar:unread', { detail: { count: 0 } }))
      toast.success('All notifications marked as read.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to mark all as read.')
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-display font-bold text-slate-900">Notifications</h1>
          {unread > 0 && (
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-brand-500 text-white">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && !loading && (
          <button
            onClick={handleMarkAll}
            className="text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 px-6 text-center">
            <Bell size={44} className="text-slate-300" />
            <p className="text-slate-500 text-sm font-medium">You're all caught up!</p>
            <p className="text-slate-400 text-xs">No notifications yet.</p>
          </div>
        ) : (
          items.map((item, i) => (
            <div
              key={item.id}
              onClick={() => handleClick(item)}
              className={`w-full flex items-start gap-3 px-5 py-4 text-left transition-colors hover:bg-slate-50 cursor-pointer ${i < items.length - 1 ? 'border-b border-slate-100' : ''
                } ${!item.is_read ? 'bg-blue-50 border-l-4 border-l-brand-400' : ''}`}
            >
              <div className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center mt-0.5 ${!item.is_read ? 'bg-brand-100' : 'bg-slate-100'
                }`}>
                {typeIcons[item.type] || defaultIcon}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${!item.is_read ? 'font-semibold text-slate-900' : 'font-medium text-slate-700'}`}>
                  {item.title}
                </p>
                {item.body && (
                  <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{item.body}</p>
                )}
                {item.link && (
                  <span
                    onClick={e => { e.stopPropagation(); navigate(item.link) }}
                    className="inline-flex items-center gap-1 text-xs text-brand-600 hover:text-brand-700 font-medium mt-1 transition-colors"
                  >
                    View <ExternalLink size={10} />
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{timeAgo(item.created_at)}</span>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
