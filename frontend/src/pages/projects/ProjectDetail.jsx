import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { CalendarDays, Users, Edit, CheckCircle, Eye, Briefcase, ArrowLeft, Clock, MapPin, Send } from 'lucide-react'
import {
  getProject,
  applyToProject,
  getApplications,
  updateAppStatus,
} from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import { getInitials, chipColorClass, formatBudgetRange, deadlineUrgency, typeLabels, durationLabels } from '../../utils/format'
import StatusBadge from '../../components/ui/StatusBadge'
import Button from '../../components/ui/Button'
import Spinner from '../../components/ui/Spinner'

function SkeletonDetail() {
  return (
    <div className="space-y-6 animate-fade-up">
      <div className="h-4 skeleton w-32" />
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-5">
          <div className="h-8 skeleton w-3/4" />
          <div className="h-4 skeleton w-1/3" />
          <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-3">
            {[...Array(5)].map((_, i) => <div key={i} className="h-3 skeleton" style={{ width: `${90 - i * 10}%` }} />)}
          </div>
        </div>
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 p-5 space-y-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-10 skeleton" />)}
          </div>
          <div className="h-12 skeleton rounded-2xl" />
        </div>
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
        <p className={`text-xs font-medium ${coverLetter.length >= 50 ? 'text-green-500' : 'text-slate-400'}`}>
          {coverLetter.length} / 50 chars min {coverLetter.length >= 50 && '✓'}
        </p>
      </div>
      <Button type="submit" variant="student" loading={loading} className="w-full">
        <Send size={14} /> Submit Application
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
    <div id="applications-anchor" className="mt-10">
      <div className="flex items-center gap-3 mb-4">
        <h2 className="font-display font-bold text-slate-900 text-lg">Applications</h2>
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-600">
          {apps.length}
        </span>
      </div>
      {apps.length === 0 ? (
        <div className="empty-state bg-white rounded-2xl border border-slate-100 shadow-sm">
          <Users size={40} className="empty-state-icon" />
          <p className="empty-state-title">No applications yet</p>
          <p className="empty-state-text">Applications will appear here once students apply.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/50">
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
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-student-400 to-student-600 flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                            {getInitials(studentName)}
                          </div>
                          {studentId ? (
                            <Link
                              to={`/profile/${studentId}`}
                              className="text-brand-600 hover:text-brand-700 hover:underline transition-colors font-semibold text-sm"
                            >
                              {studentName}
                            </Link>
                          ) : <span className="text-sm">{studentName}</span>}
                        </div>
                      </td>
                      <td className="px-6 py-3 text-slate-500 text-xs">
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
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700
                                hover:bg-emerald-100 transition-colors border border-emerald-200"
                            >
                              ✓ Approve
                            </button>
                            <button
                              onClick={() => handleStatus(app.id, 'rejected')}
                              className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600
                                hover:bg-red-100 transition-colors border border-red-200"
                            >
                              ✕ Reject
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

// ─── Main ──────────────────────────────────────────────────────────────────
export default function ProjectDetail() {
  const { id }    = useParams()
  const { user }  = useAuth()

  const [project,  setProject]  = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    getProject(id)
      .then(res => {
        const p = res.data.data ?? res.data
        setProject(p)
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
      <div className="empty-state">
        <div className="text-5xl mb-4">🔍</div>
        <p className="empty-state-title">Project not found</p>
        <Link to="/projects" className="mt-4 inline-block">
          <Button variant="secondary" size="sm"><ArrowLeft size={14} /> Back to Projects</Button>
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

  const budgetStr = formatBudgetRange(project.budget_min, project.budget_max)
  const urgency = deadlineUrgency(project.deadline)
  const typeInfo = typeLabels[project.type]
  const durationStr = durationLabels[project.duration]

  const deadlineStr = project.deadline
    ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '—'

  return (
    <div className="animate-fade-up">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-slate-400 mb-6">
        <Link to="/projects" className="hover:text-brand-600 transition-colors flex items-center gap-1">
          <ArrowLeft size={14} /> Projects
        </Link>
        <span>/</span>
        <span className="text-slate-600 font-medium truncate">{project.title}</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Title + meta */}
          <div>
            <div className="flex items-start gap-3 flex-wrap mb-3">
              <h1 className="font-display text-2xl sm:text-3xl font-bold text-slate-900 leading-tight flex-1">
                {project.title}
              </h1>
              <StatusBadge status={project.status} />
            </div>

            {/* Meta pills */}
            <div className="flex flex-wrap items-center gap-2">
              {project.employer_name && (
                <span className="inline-flex items-center gap-1.5 text-sm text-slate-500">
                  <div className="w-6 h-6 rounded-md bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-[9px] font-bold">
                    {getInitials(project.employer_name)}
                  </div>
                  {project.employer_id ? (
                    <Link to={`/profile/${project.employer_id}`} className="font-medium text-slate-700 hover:text-brand-600 transition-colors">
                      {project.employer_name}
                    </Link>
                  ) : (
                    <span className="font-medium text-slate-700">{project.employer_name}</span>
                  )}
                </span>
              )}
              {typeInfo && (
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {typeInfo.icon} {typeInfo.label}
                </span>
              )}
              {durationStr && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  <Clock size={11} /> {durationStr}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <h2 className="section-label">Project Description</h2>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">
              {project.description}
            </p>
          </div>

          {/* Skills */}
          {skills.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
              <h2 className="section-label">Skills Required</h2>
              <div className="flex flex-wrap gap-2">
                {skills.map((s, i) => (
                  <span key={s} className={chipColorClass(i)}>{s}</span>
                ))}
              </div>
            </div>
          )}

          {/* Apply form (student) */}
          {isStudent && !isClosed && showForm && !project.already_applied && (
            <div className="bg-white rounded-2xl border border-student-200 shadow-sm p-6 ring-1 ring-student-100">
              <h2 className="font-display font-bold text-slate-900 mb-1">Apply for this Project</h2>
              <p className="text-xs text-slate-400 mb-2">Write a compelling cover letter to stand out</p>
              <ApplyForm
                projectId={id}
                onSuccess={() => { setProject(prev => ({ ...prev, already_applied: true, my_application_status: 'pending' })); setShowForm(false) }}
              />
            </div>
          )}

          {/* Employer: Applications */}
          {isOwner && <ApplicationsSection projectId={id} />}
        </div>

        {/* Right — sidebar */}
        <div className="space-y-4">
          {/* Info card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
                <CalendarDays size={16} className="text-slate-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Deadline</p>
                <p className="text-sm font-semibold text-slate-800">{deadlineStr}</p>
              </div>
              {urgency && (
                <span className={`ml-auto text-[10px] font-bold px-2 py-0.5 rounded-full ${urgency.color}`}>
                  {urgency.icon} {urgency.label}
                </span>
              )}
            </div>

            <div className="divider !my-3" />

            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <Users size={16} className="text-blue-500" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Applications</p>
                <p className="text-sm font-semibold text-slate-800">{project.application_count ?? project.applications_count ?? 0}</p>
              </div>
            </div>

            {/* Budget */}
            {budgetStr && (
              <>
                <div className="divider !my-3" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center flex-shrink-0">
                    <Briefcase size={16} className="text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Budget</p>
                    <p className="text-sm font-bold text-emerald-700">{budgetStr}</p>
                  </div>
                </div>
              </>
            )}

            {/* Views */}
            {project.views != null && (
              <>
                <div className="divider !my-3" />
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                    <Eye size={16} className="text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Views</p>
                    <p className="text-sm font-semibold text-slate-800">{project.views}</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Action card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-5 space-y-3">
            {/* Not logged in */}
            {!user && (
              <Link to="/login">
                <Button variant="primary" className="w-full">Login to Apply</Button>
              </Link>
            )}

            {/* Student */}
            {isStudent && (() => {
              const status = project.my_application_status
              const alreadyActed = project.already_applied || ['approved', 'rejected', 'withdrawn'].includes(status)

              if (alreadyActed) {
                if (status === 'approved') {
                  return (
                    <div className="flex items-center gap-2 justify-center text-emerald-600 font-semibold text-sm py-3
                      bg-emerald-50 rounded-xl border border-emerald-200">
                      <CheckCircle size={16} />
                      🎉 Application Approved!
                    </div>
                  )
                }
                if (status === 'rejected') {
                  return (
                    <div className="flex items-center gap-2 justify-center text-red-500 font-semibold text-sm py-3
                      bg-red-50 rounded-xl border border-red-200">
                      Application Not Selected
                    </div>
                  )
                }
                // pending or just submitted
                return (
                  <div className="flex items-center gap-2 justify-center text-amber-600 font-semibold text-sm py-3
                    bg-amber-50 rounded-xl border border-amber-200">
                    <CheckCircle size={16} />
                    Application Submitted — Pending Review
                  </div>
                )
              }

              if (isClosed) {
                return <Button variant="secondary" disabled className="w-full">Applications Closed</Button>
              }

              return (
                <Button
                  variant="student"
                  className="w-full"
                  onClick={() => setShowForm(v => !v)}
                >
                  {showForm ? 'Cancel' : '✨ Apply for this Project'}
                </Button>
              )
            })()}

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
                  className="w-full text-sm text-brand-600 hover:text-brand-700 font-medium py-2 transition-colors rounded-xl hover:bg-brand-50"
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
