import { Link } from 'react-router-dom'
import { ArrowRightLeft, Send, CheckCircle } from 'lucide-react'
import { getInitials, colorFor } from '../utils/format'
import Button from './ui/Button'

export default function SkillSwapCard({ listing, onRequest, requestSent }) {
  const avatarBg = colorFor(listing.user_id || 0)

  return (
    <div className="group bg-white rounded-2xl border border-slate-100/80 shadow-card overflow-hidden card-hover flex flex-col">
      <div className="p-5 flex flex-col gap-4 flex-1">
        {/* User */}
        <div className="flex items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white text-sm flex-shrink-0 shadow-sm ${avatarBg}`}
          >
            {getInitials(listing.user_name || '?')}
          </div>
          <div className="min-w-0">
            <Link to={`/profile/${listing.user_id}`} className="font-semibold text-slate-800 text-sm hover:text-brand-600 transition-colors block truncate">
              {listing.user_name}
            </Link>
            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Skill Exchange</p>
          </div>
        </div>

        {/* Skills Exchange Visual */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
          <div className="flex items-center gap-3 text-[10px] text-slate-400 font-semibold uppercase tracking-wider mb-2">
            <span className="flex-1 text-center">Can Teach</span>
            <span className="w-5" />
            <span className="flex-1 text-center">Wants to Learn</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-center truncate">
              {listing.teach_skill}
            </span>
            <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 shadow-sm">
              <ArrowRightLeft size={14} className="text-slate-400" />
            </div>
            <span className="flex-1 text-xs font-semibold px-3 py-2.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200 text-center truncate">
              {listing.learn_skill}
            </span>
          </div>
        </div>
      </div>

      {/* Action footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50">
        {requestSent ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-2 rounded-xl border border-emerald-100">
            <CheckCircle size={13} /> Request Sent
          </span>
        ) : (
          <Button variant="primary" size="sm" onClick={() => onRequest(listing.id, listing)} className="w-full">
            <Send size={13} /> Send Request
          </Button>
        )}
      </div>
    </div>
  )
}
