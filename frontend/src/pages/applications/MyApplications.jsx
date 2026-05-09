import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { ChevronDown, ChevronUp, ArrowRight, XCircle } from 'lucide-react'
import { getMyApplications, withdrawApplication } from '../../api/applications'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Button from '../../components/ui/Button'

const FILTERS = ['All', 'Pending', 'Approved', 'Rejected', 'Withdrawn']

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex justify-between">
        <div className="h-5 skeleton rounded w-1/2" />
        <div className="h-5 skeleton rounded-full w-20" />
      </div>
      <div className="h-3 skeleton rounded w-1/4" />
      <div className="h-3 skeleton rounded w-1/3" />
    </div>
  )
}

function ApplicationCard({ app, onWithdrawn }) {
  const [open, setOpen] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)

  const formatted = new Date(app.created_at).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  const handleWithdraw = async () => {
    setWithdrawing(true)
    try {
      await withdrawApplication(app.id)
      toast.success('Application withdrawn.')
      onWithdrawn?.(app.id)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to withdraw application.')
    } finally {
      setWithdrawing(false)
      setShowConfirm(false)
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <Link
            to={`/projects/${app.project_id}`}
            className="font-semibold text-slate-900 hover:text-brand-600 transition-colors"
          >
            {app.project_title}
          </Link>
          <p className="text-xs text-slate-400 mt-0.5">
            {app.employer_id ? (
              <Link to={`/profile/${app.employer_id}`} className="hover:text-brand-600 transition-colors">
                {app.employer_name}
              </Link>
            ) : app.employer_name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <StatusBadge status={app.status} />
          {app.status === 'pending' && (
            <button
              onClick={() => setShowConfirm(true)}
              className="flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              <XCircle size={12} /> Withdraw
            </button>
          )}
        </div>
      </div>

      <p className="text-xs text-slate-400">Applied {formatted}</p>

      {/* Cover letter toggle */}
      {app.cover_letter && (
        <div>
          <button
            onClick={() => setOpen(v => !v)}
            className="flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
          >
            {open ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            {open ? 'Hide cover letter' : 'View cover letter'}
          </button>
          {open && (
            <p className="mt-2 text-sm text-slate-600 bg-slate-50 rounded-xl px-4 py-3 leading-relaxed border border-slate-100">
              {app.cover_letter}
            </p>
          )}
        </div>
      )}

      {/* Employer note */}
      {app.employer_note && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">📝 Employer Feedback</p>
          <p className="text-sm text-amber-800 leading-relaxed">{app.employer_note}</p>
        </div>
      )}

      <ConfirmDialog
        open={showConfirm}
        title="Withdraw Application?"
        message={`Are you sure you want to withdraw your application for "${app.project_title}"? This cannot be undone.`}
        confirmLabel="Withdraw"
        variant="danger"
        loading={withdrawing}
        onConfirm={handleWithdraw}
        onCancel={() => setShowConfirm(false)}
      />
    </div>
  )
}

export default function MyApplications() {
  const [applications, setApplications] = useState([])
  const [loading, setLoading]           = useState(true)
  const [filter, setFilter]             = useState('All')

  useEffect(() => {
    getMyApplications()
      .then(res => {
        setApplications(res.data.data ?? [])
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load applications.'))
      .finally(() => setLoading(false))
  }, [])

  const handleWithdrawn = (id) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'withdrawn' } : a))
  }

  const filtered = filter === 'All'
    ? applications
    : applications.filter(a => a.status === filter.toLowerCase())

  return (
    <div className="animate-fade-up space-y-6">
      {/* Heading */}
      <div>
        <h1 className="font-display text-2xl font-bold text-slate-900">My Applications</h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Track your project applications{!loading && <> · <span className="font-semibold text-slate-700">{applications.length}</span> total</>}
        </p>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
        {FILTERS.map(f => {
          const count = f === 'All'
            ? applications.length
            : applications.filter(a => a.status === f.toLowerCase()).length
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-1.5 ${
                filter === f
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {f}
              {count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold leading-none ${
                  filter === f ? 'bg-brand-100 text-brand-700' : 'bg-slate-200 text-slate-500'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col gap-4">
          {[...Array(3)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : applications.length === 0 ? (
        <div className="empty-state bg-white rounded-2xl border border-slate-100 shadow-sm">
          <div className="text-5xl mb-4">📋</div>
          <p className="empty-state-title">No applications yet</p>
          <p className="empty-state-text mb-4">Start browsing projects to find your next opportunity</p>
          <Link to="/projects">
            <Button variant="student" size="sm">
              Browse Projects <ArrowRight size={14} />
            </Button>
          </Link>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 py-12 text-center">
          <div className="text-4xl mb-3">
            {filter === 'Pending' ? '⏳' : filter === 'Approved' ? '✅' : filter === 'Rejected' ? '❌' : filter === 'Withdrawn' ? '🙅' : '💼'}
          </div>
          <p className="text-slate-500 font-medium">No {filter.toLowerCase()} applications</p>
          <p className="text-xs text-slate-400 mt-1">Try checking another filter or browse new projects</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {filtered.map(app => (
            <ApplicationCard key={app.id} app={app} onWithdrawn={handleWithdrawn} />
          ))}
        </div>
      )}
    </div>
  )
}
