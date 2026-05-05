import { Link } from 'react-router-dom'
import { ArrowRightLeft } from 'lucide-react'
import { colorFor } from '../utils/format'
import Button from './ui/Button'

export default function SkillSwapCard({ listing, onRequest, requestSent }) {
  const avatarBg = colorFor(listing.user_id || 0)

  return (
    <div className="group bg-white rounded-2xl border border-slate-100/80 shadow-card p-5 flex flex-col gap-4
      hover:shadow-card-hover hover:-translate-y-0.5 transition-all duration-200">
      {/* User */}
      <div className="flex items-center gap-3">
        <div
          className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-sm flex-shrink-0 ${avatarBg}`}
        >
          {listing.user_name?.[0]?.toUpperCase() || '?'}
        </div>
        <Link to={`/profile/${listing.user_id}`} className="font-semibold text-slate-800 text-sm hover:text-brand-600 transition-colors">
          {listing.user_name}
        </Link>
      </div>

      {/* Skills Exchange Visual */}
      <div className="flex items-center gap-3">
        <span className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-100 text-center truncate">
          {listing.teach_skill}
        </span>
        <ArrowRightLeft size={16} className="text-slate-300 flex-shrink-0" />
        <span className="flex-1 text-xs font-semibold px-3 py-2 rounded-xl bg-sky-50 text-sky-700 border border-sky-100 text-center truncate">
          {listing.learn_skill}
        </span>
      </div>

      <div className="flex items-center gap-3 text-[10px] text-slate-400 font-medium uppercase tracking-wider">
        <span className="flex-1 text-center">Can Teach</span>
        <span className="w-4" />
        <span className="flex-1 text-center">Wants to Learn</span>
      </div>

      {/* Action */}
      <div className="pt-1 border-t border-slate-100 mt-auto">
        {requestSent ? (
          <span className="text-xs font-semibold text-slate-400 px-3 py-2 rounded-xl bg-slate-50 inline-block">
            ✓ Request Sent
          </span>
        ) : (
          <Button variant="primary" size="sm" onClick={() => onRequest(listing.id)}>
            Send Request
          </Button>
        )}
      </div>
    </div>
  )
}
