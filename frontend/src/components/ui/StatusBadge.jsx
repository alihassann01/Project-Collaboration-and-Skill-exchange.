/**
 * Shared StatusBadge component with dot indicator
 */
export default function StatusBadge({ status, size = 'sm' }) {
  const map = {
    approved:     { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    accepted:     { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    rejected:     { bg: 'bg-red-100 text-red-700',         dot: 'bg-red-500'     },
    pending:      { bg: 'bg-yellow-100 text-yellow-700',   dot: 'bg-yellow-500'  },
    open:         { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    closed:       { bg: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400'   },
    in_progress:  { bg: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'    },
    delivered:    { bg: 'bg-violet-100 text-violet-700',   dot: 'bg-violet-500'  },
    reviewing:    { bg: 'bg-sky-100 text-sky-700',         dot: 'bg-sky-500'     },
    revision_requested: { bg: 'bg-orange-100 text-orange-700', dot: 'bg-orange-500' },
    under_review: { bg: 'bg-blue-100 text-blue-700',       dot: 'bg-blue-500'    },
    completed:    { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    withdrawn:    { bg: 'bg-orange-100 text-orange-700',   dot: 'bg-orange-500'  },
    active:       { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
    inactive:     { bg: 'bg-slate-100 text-slate-500',     dot: 'bg-slate-400'   },
    hired:        { bg: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  }

  const fallback = { bg: 'bg-slate-100 text-slate-500', dot: 'bg-slate-400' }
  const s = map[status] || fallback
  const sizeClass = size === 'xs' ? 'text-[10px] px-2 py-px' : 'text-xs px-2.5 py-0.5'

  return (
    <span className={`inline-flex items-center gap-1.5 font-semibold rounded-full capitalize ${s.bg} ${sizeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot} flex-shrink-0`} />
      {(status || '').replace(/_/g, ' ')}
    </span>
  )
}
