import { useEffect, useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  FileText, CheckCircle, Clock, Briefcase,
  Users, GraduationCap, Building2, FolderOpen,
  Target, ArrowLeftRight, Trophy, Plus, ArrowRight,
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { getDashboard } from '../../api/dashboard'
import StatusBadge from '../../components/ui/StatusBadge'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'
import Button from '../../components/ui/Button'



// ─── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`animate-pulse bg-slate-200 rounded-xl ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade-up space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-24" />)}
      </div>
      <Skeleton className="h-64" />
    </div>
  )
}

// ─── Public landing (not logged in) ─────────────────────────────────────────
function PublicDashboard() {
  return (
    <div className="animate-fade-up space-y-12">
      {/* Hero */}
      <div className="relative text-center py-20 px-4 rounded-3xl overflow-hidden bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900">
        <div className="grid-pattern absolute inset-0" />
        <div className="absolute inset-0 bg-gradient-radial from-brand-600/30 via-transparent to-transparent" />
        <div className="relative z-10">
          <h1 className="font-display text-4xl sm:text-5xl font-700 text-white tracking-tight leading-tight max-w-2xl mx-auto">
            Find Projects.{' '}
            <span className="text-brand-300">Share Skills.</span>{' '}
            Grow Together.
          </h1>
          <p className="mt-4 text-slate-300 text-lg max-w-xl mx-auto">
            SkillMarket connects students with real projects and lets you exchange skills with peers.
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to="/projects">
              <button className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white px-6 py-3 rounded-xl font-semibold text-base hover:bg-white/20 transition-colors">
                Browse Projects <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-2 bg-white text-brand-700 px-6 py-3 rounded-xl font-semibold text-base hover:bg-brand-50 transition-colors shadow-sm">
                Get Started Free <ArrowRight size={16} />
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid sm:grid-cols-3 gap-5">
        {[
          {
            icon: <Target size={28} className="text-brand-600" />,
            title: 'Real Projects',
            desc: 'Work on live projects posted by employers',
            bgClass: 'bg-brand-50',
          },
          {
            icon: <ArrowLeftRight size={28} className="text-emerald-600" />,
            title: 'Skill Swap',
            desc: 'Teach what you know, learn what you don\'t',
            bgClass: 'bg-emerald-50',
          },
          {
            icon: <Trophy size={28} className="text-amber-600" />,
            title: 'Build Portfolio',
            desc: 'Gain experience and grow your profile',
            bgClass: 'bg-amber-50',
          },
        ].map(({ icon, title, desc, bgClass }) => (
          <div key={title} className="bg-white rounded-2xl shadow-card border border-slate-100 p-6 text-center hover:shadow-card-hover transition-all group">
            <div className={`w-14 h-14 rounded-2xl ${bgClass} flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform`}>{icon}</div>
            <h3 className="font-display font-700 text-slate-900 text-lg mb-1">{title}</h3>
            <p className="text-slate-500 text-sm">{desc}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Student dashboard ───────────────────────────────────────────────────────
function StudentDashboard({ data, name }) {
  const {
    my_applications_count,
    approved_count,
    pending_count,
    open_projects_count,
    recent_applications = [],
  } = data

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-student-500 via-student-600 to-brand-700 p-6 md:p-8">
        <div className="grid-pattern absolute inset-0" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
              <span className="text-white/90 text-xs font-semibold">🎓 Student Dashboard</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-tight">
              Welcome back, {name}! 👋
            </h1>
            <p className="text-white/70 text-sm mt-1">Track your applications and discover new opportunities.</p>
          </div>
          <Link to="/projects">
            <button className="flex items-center gap-2 bg-white text-student-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-student-50 transition-colors shadow-sm">
              Browse Projects <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="My Applications" value={my_applications_count} icon={FileText}   color="sky"    />
        <StatCard title="Approved"         value={approved_count}        icon={CheckCircle} color="green"  />
        <StatCard title="Pending"          value={pending_count}         icon={Clock}       color="yellow" />
        <StatCard title="Open Projects"    value={open_projects_count}   icon={Briefcase}   color="violet" />
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/skill-swap" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-brand-200 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <ArrowLeftRight size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Browse Skill Swap →</p>
            <p className="text-xs text-slate-400 mt-0.5">Teach what you know, learn what you don't</p>
          </div>
        </Link>
        <Link to="/projects" className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:border-brand-200 transition-all group">
          <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Briefcase size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Browse Projects →</p>
            <p className="text-xs text-slate-400 mt-0.5">Find real-world projects to work on</p>
          </div>
        </Link>
      </div>

      {/* Recent applications */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-display font-700 text-slate-900">Recent Applications</h2>
          <Link to="/my-applications" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View all →
          </Link>
        </div>

        {recent_applications.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <FileText size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No applications yet. Browse projects to get started!</p>
            <Link to="/projects" className="mt-4 inline-block">
              <Button variant="primary" size="sm">Browse Projects</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Date Applied</th>
                </tr>
              </thead>
              <tbody>
                {recent_applications.map((app, i) => (
                  <tr key={app.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-3 font-medium text-slate-800">{app.project_title}</td>
                    <td className="px-6 py-3"><StatusBadge status={app.status} /></td>
                    <td className="px-6 py-3 text-slate-500">
                      {app.applied_at ? new Date(app.applied_at).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Employer dashboard ──────────────────────────────────────────────────────
function EmployerDashboard({ data, name }) {
  const {
    my_projects_count,
    total_applications,
    pending_applications,
    recent_projects = [],
  } = data

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-employer-500 via-employer-600 to-employer-800 p-6 md:p-8">
        <div className="grid-pattern absolute inset-0" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
              <span className="text-white/90 text-xs font-semibold">🏢 Employer Dashboard</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-tight">
              Welcome back, {name}! 👋
            </h1>
            <p className="text-white/70 text-sm mt-1">Manage your projects and review incoming talent.</p>
          </div>
          <Link to="/projects/create">
            <button className="flex items-center gap-2 bg-white text-employer-700 px-4 py-2.5 rounded-xl font-semibold text-sm hover:bg-employer-50 transition-colors shadow-sm">
              <Plus size={15} /> Post Project
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="My Projects"      value={my_projects_count}    icon={FolderOpen}  color="violet" />
        <StatCard title="Total Applications" value={total_applications} icon={FileText}    color="green"  />
        <StatCard title="Pending Review"   value={pending_applications} icon={Clock}       color="amber"  />
      </div>

      {/* Recent projects */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-700 text-slate-900">Recent Projects</h2>
        </div>

        {recent_projects.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Briefcase size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500 text-sm">No projects yet. Post your first project!</p>
            <Link to="/projects/create" className="mt-4 inline-block">
              <Button variant="primary" size="sm"><Plus size={14} /> Post Project</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Applications</th>
                  <th className="px-6 py-3 text-left">Budget</th>
                  <th className="px-6 py-3 text-left">Deadline</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {recent_projects.map((p, i) => {
                  const hasBudget = p.budget_min != null || p.budget_max != null
                  const budgetStr = hasBudget
                    ? p.budget_min != null && p.budget_max != null
                      ? `PKR ${Number(p.budget_min).toLocaleString()} – ${Number(p.budget_max).toLocaleString()}`
                      : p.budget_min != null
                        ? `PKR ${Number(p.budget_min).toLocaleString()}+`
                        : `Up to PKR ${Number(p.budget_max).toLocaleString()}`
                    : '—'
                  return (
                    <tr key={p.id ?? i} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                      <td className="px-6 py-3 font-medium text-slate-800">{p.title}</td>
                      <td className="px-6 py-3"><StatusBadge status={p.status} /></td>
                      <td className="px-6 py-3 text-slate-600">{p.applications_count ?? 0}</td>
                      <td className="px-6 py-3 text-slate-600 text-xs">{budgetStr}</td>
                      <td className="px-6 py-3 text-slate-500">
                        {p.deadline ? new Date(p.deadline).toLocaleDateString() : '—'}
                      </td>
                      <td className="px-6 py-3">
                        <Link
                          to={`/projects/${p.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline transition-colors"
                        >
                          View Applications
                        </Link>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Admin dashboard ─────────────────────────────────────────────────────────
function AdminDashboard({ data, name }) {
  const {
    total_users,
    total_students,
    total_employers,
    total_projects,
    open_projects,
    total_applications,
  } = data

  return (
    <div className="animate-fade-up space-y-6">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-6 md:p-8">
        <div className="grid-pattern absolute inset-0" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
            <span className="text-white/90 text-xs font-semibold">⚡ Admin Control Panel</span>
          </div>
          <h1 className="font-display text-2xl md:text-3xl font-700 text-white leading-tight">
            Platform Overview
          </h1>
          <p className="text-white/70 text-sm mt-1">Monitor users, projects, and platform health.</p>
        </div>
      </div>

      {/* 6 stat cards in 2 rows of 3 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard title="Total Users"        value={total_users}        icon={Users}        color="amber"  />
        <StatCard title="Students"           value={total_students}     icon={GraduationCap} color="sky"   />
        <StatCard title="Employers"          value={total_employers}    icon={Building2}    color="violet" />
        <StatCard title="Total Projects"     value={total_projects}     icon={FolderOpen}   color="amber"  />
        <StatCard title="Open Projects"      value={open_projects}      icon={Briefcase}    color="green"  />
        <StatCard title="Applications"       value={total_applications} icon={FileText}     color="blue"   />
      </div>
    </div>
  )
}

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth()
  const [data, setData]       = useState(null)
  const [fetching, setFetching] = useState(false)
  const [error, setError]     = useState(null)

  useEffect(() => {
    if (!user) return          // Public view — no API call needed
    setFetching(true)
    getDashboard()
      .then(res => setData(res.data.data))
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load dashboard data.'
        toast.error(msg)
        setError(msg)
      })
      .finally(() => setFetching(false))
  }, [user])

  // Not logged in
  if (!user) return <PublicDashboard />

  // Loading
  if (fetching) return <DashboardSkeleton />

  // API error
  if (error) {
    return (
      <div className="animate-fade-up bg-white rounded-2xl shadow-sm border border-red-100 p-10 text-center">
        <p className="text-red-500 font-medium">{error}</p>
        <Button
          variant="secondary"
          size="sm"
          className="mt-4"
          onClick={() => window.location.reload()}
        >
          Retry
        </Button>
      </div>
    )
  }

  // Not yet loaded (edge case)
  if (!data) return null

  if (user.role === 'student')  return <StudentDashboard  data={data} name={user.name} />
  if (user.role === 'employer') return <EmployerDashboard data={data} name={user.name} />
  if (user.role === 'admin')    return <Navigate to="/admin" replace />

  return <div className="text-slate-500 p-8">Unknown role: {user.role}</div>
}
