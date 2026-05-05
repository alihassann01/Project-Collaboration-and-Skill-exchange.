/**
 * Shared StatusBadge component
 */
export default function StatusBadge({ status }) {
  const map = {
    approved:    'bg-green-100 text-green-700',
    accepted:    'bg-green-100 text-green-700',
    rejected:    'bg-red-100 text-red-700',
    pending:     'bg-yellow-100 text-yellow-700',
    open:        'bg-green-100 text-green-700',
    closed:      'bg-slate-100 text-slate-500',
    in_progress: 'bg-blue-100 text-blue-700',
    completed:   'bg-emerald-100 text-emerald-700',
    withdrawn:   'bg-orange-100 text-orange-700',
    active:      'bg-green-100 text-green-700',
    inactive:    'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {(status || '').replace(/_/g, ' ')}
    </span>
  )
}
