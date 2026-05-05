import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarDays, Users, Edit, CheckCircle, Eye, DollarSign } from 'lucide-react'
import {
  getProject,
  applyToProject,
  getApplications,
  updateAppStatus,
} from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function StatusBadge({ status }) {
  const map = {
    approved: 'bg-green-100 text-green-700',
    rejected:  'bg-red-100 text-red-700',
    pending:   'bg-yellow-100 text-yellow-700',
    open:      'bg-green-100 text-green-700',
    closed:    'bg-slate-100 text-slate-500',
  }
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${map[status] || 'bg-slate-100 text-slate-500'}`}>
      {status}
    </span>
  )
}

function SkeletonDetail() {
  return (
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-slate-200 rounded-xl w-2/3" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          {[...Array(5)].map((_, i) => <div key={i} className="h-4 bg-slate-200 rounded-xl" />)}
        </div>
        <div className="h-56 bg-slate-200 rounded-2xl" />
      </div>
    </div>
  )
}

// ─── Apply form ────────────────────────────────────────────────────────────
function ApplyForm({ projectId, onSuccess }) {
  const [coverLetter, setCoverLetter] = useState('')
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (coverLetter.trim().length < 50) {
      setError('Cover letter must be at least 50 characters.')
      return
    }
    setError('')
    setLoading(true)
    try {
      await applyToProject(projectId, { cover_letter: coverLetter.trim() })
      toast.success('Application submitted!')
      onSuccess()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit application.'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-4 border-t border-slate-100 pt-4 space-y-3">
      <div className="flex flex-col gap-1">
        <label className="text-sm font-medium text-slate-700">Cover Letter</label>
        <textarea
          rows={5}
          value={coverLetter}
          onChange={e => setCoverLetter(e.target.value)}
          placeholder="Tell us why you're a good fit…"
          className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border transition-all
            placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400
            focus:border-brand-400 focus:bg-white resize-none
            ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 hover:border-slate-300'}`}
        />
        {error && <p className="text-xs text-red-500 font-medium">{error}</p>}
        <p className="text-xs text-slate-400">{coverLetter.length} / 50 chars min</p>
      </div>
      <Button type="submit" variant="primary" loading={loading} className="w-full">
        Submit Application
      </Button>
    </form>
  )
}

// ─── Applications table (employer) ─────────────────────────────────────────
function ApplicationsSection({ projectId }) {
  const [apps, setApps]       = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getApplications(projectId)
      .then(res => setApps(res.data.data ?? res.data ?? []))
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load applications.'
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [projectId])

  async function handleStatus(appId, status) {
    setApps(prev => prev.map(a => a.id === appId ? { ...a, status } : a))
    try {
      await updateAppStatus(appId, status)
      toast.success(`Application ${status}.`)
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update status.'
      toast.error(msg)
      setApps(prev => prev.map(a => a.id === appId ? { ...a, status: 'pending' } : a))
    }
  }

  if (loading) return (
    <div className="flex justify-center py-8">
      <Spinner size="md" className="text-brand-600" />
    </div>
  )

  return (
    <div className="mt-10">
      <h2 className="font-display font-700 text-slate-900 text-lg mb-4">
        Applications ({apps.length})
      </h2>
      {apps.length === 0 ? (
        <p className="text-slate-400 text-sm py-6 text-center">No applications yet.</p>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Student</th>
                  <th className="px-6 py-3 text-left">Applied On</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {apps.map(app => {
                  const studentId = app.student_id ?? app.user?.id
                  const studentName = app.student_name ?? app.user?.name ?? '—'
                  return (
                    <tr key={app.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {studentId ? (
                          <Link
                            to={`/profile/${studentId}`}
                            className="text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                          >
                            {studentName}
                          </Link>
                        ) : studentName}
                      </td>
                      <td className="px-6 py-3 text-slate-500">
                        {app.created_at ? new Date(app.created_at).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="px-6 py-3">
                        {app.status === 'pending' && (
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleStatus(app.id, 'approved')}
                              className="text-xs font-semibold px-3 py-1 rounded-lg bg-green-50 text-green-700
                                hover:bg-green-100 transition-colors border border-green-200"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleStatus(app.id, 'rejected')}
                              className="text-xs font-semibold px-3 py-1 rounded-lg bg-red-50 text-red-600
                                hover:bg-red-100 transition-colors border border-red-200"
                            >
                              Reject
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

const typeLabel = { remote: '🏠 Remote', onsite: '🏢 Onsite', hybrid: '🔀 Hybrid' }
const durationLabel = {
  less_1_month: 'Less than 1 month',
  '1_3_months': '1–3 months',
  '3_6_months': '3–6 months',
  ongoing: 'Ongoing',
}

function formatPKR(n) { return Number(n).toLocaleString('en-PK') }

// ─── Main ──────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id }    = useParams()
  const { user }  = useAuth()

  const [project,  setProject]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [applied,  setApplied]  = useState(false)

  useEffect(() => {
    setLoading(true)
    getProject(id)
      .then(res => {
        const p = res.data.data ?? res.data
        setProject(p)
        setApplied(p.already_applied ?? false)
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load project.'
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <SkeletonDetail />

  if (!project) {
    return (
      <div className="text-center py-20 text-slate-400">
        <p>Project not found.</p>
        <Link to="/projects" className="text-brand-600 hover:underline text-sm mt-2 inline-block">
          Back to Projects
        </Link>
      </div>
    )
  }

  const skills = Array.isArray(project.skills_required)
    ? project.skills_required
    : typeof project.skills_required === 'string'
      ? project.skills_required.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const isOwner      = user?.role === 'employer' && String(project.employer_id) === String(user?.id)
  const isStudent    = user?.role === 'student'
  const isClosed     = project.status === 'closed'
  const deadlineStr  = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  const hasBudget = project.budget_min != null || project.budget_max != null
  const budgetStr = hasBudget
    ? project.budget_min != null && project.budget_max != null
      ? `PKR ${formatPKR(project.budget_min)} – ${formatPKR(project.budget_max)}`
      : project.budget_min != null
        ? `PKR ${formatPKR(project.budget_min)}+`
        : `Up to PKR ${formatPKR(project.budget_max)}`
    : null

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <div className="text-sm text-slate-400 mb-4">
        <Link to="/projects" className="hover:text-brand-600 transition-colors">Projects</Link>
        <span className="mx-2">/</span>
        <span className="text-slate-600 font-medium">{project.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title */}
          <div className="flex items-start gap-3 flex-wrap">
            <h1 className="font-display text-3xl font-700 text-slate-900 leading-tight flex-1">
              {project.title}
            </h1>
            <StatusBadge status={project.status} />
          </div>

          {/* Posted by */}
          {project.employer_name && (
            <p className="text-sm text-slate-500">
              Posted by <span className="font-semibold text-slate-700">{project.employer_name}</span>
            </p>
          )}

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="font-display font-700 text-slate-900 mb-3">Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-display font-700 text-slate-900 mb-3">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map(s => (
                  <span key={s}
                    className="text-sm px-3 py-1 rounded-full bg-brand-50 text-brand-700
                      font-medium border border-brand-100">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Apply form (student) */}
          {isStudent && !isClosed && showForm && !applied && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="font-display font-700 text-slate-900 mb-1">Apply for this Project</h2>
              <ApplyForm
                projectId={id}
                onSuccess={() => { setApplied(true); setShowForm(false) }}
              />
            </div>
          )}

          {/* Employer: Applications */}
          {isOwner && <ApplicationsSection projectId={id} />}
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-4">
            <div className="flex items-center gap-3">
              <CalendarDays size={16} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Deadline</p>
                <p className="text-sm font-semibold text-slate-800">{deadlineStr}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Users size={16} className="text-slate-400 flex-shrink-0" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Applications</p>
                <p className="text-sm font-semibold text-slate-800">{project.application_count ?? project.applications_count ?? 0}</p>
              </div>
            </div>

            {/* Budget */}
            {budgetStr && (
              <div className="flex items-center gap-3">
                <DollarSign size={16} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Budget</p>
                  <p className="text-sm font-semibold text-green-700">{budgetStr}</p>
                </div>
              </div>
            )}

            {/* Type */}
            {project.type && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Project Type</p>
                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                  {typeLabel[project.type] ?? project.type}
                </span>
              </div>
            )}

            {/* Duration */}
            {project.duration && (
              <div>
                <p className="text-xs text-slate-400 font-medium mb-1">Duration</p>
                <span className="inline-block text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700">
                  {durationLabel[project.duration] ?? project.duration}
                </span>
              </div>
            )}

            {/* Views */}
            {project.views != null && (
              <div className="flex items-center gap-3">
                <Eye size={16} className="text-slate-400 flex-shrink-0" />
                <div>
                  <p className="text-xs text-slate-400 font-medium">Views</p>
                  <p className="text-sm font-semibold text-slate-800">{project.views}</p>
                </div>
              </div>
            )}

            <div className="pt-2 border-t border-slate-100">
              <StatusBadge status={project.status} />
            </div>
          </div>

          {/* Action card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 space-y-3">
            {/* Not logged in */}
            {!user && (
              <Link to="/login">
                <Button variant="primary" className="w-full">Login to Apply</Button>
              </Link>
            )}

            {/* Student */}
            {isStudent && (
              applied ? (
                <div className="flex items-center gap-2 justify-center text-green-600 font-semibold text-sm py-2
                  bg-green-50 rounded-xl border border-green-200">
                  <CheckCircle size={16} />
                  Application Submitted ✓
                </div>
              ) : isClosed ? (
                <Button variant="secondary" disabled className="w-full">Applications Closed</Button>
              ) : (
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setShowForm(v => !v)}
                >
                  {showForm ? 'Cancel' : 'Apply for this Project'}
                </Button>
              )
            )}

            {/* Employer owner */}
            {isOwner && (
              <>
                <Link to={`/projects/${id}/edit`}>
                  <Button variant="secondary" className="w-full">
                    <Edit size={15} /> Edit Project
                  </Button>
                </Link>
                <button
                  onClick={() => document.getElementById('applications-anchor')?.scrollIntoView({ behavior: 'smooth' })}
                  className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium py-1 transition-colors"
                >
                  Manage Applications ↓
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
