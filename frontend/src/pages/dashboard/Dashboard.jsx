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

const heroImages = {
  public: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?auto=format&fit=crop&w=1600&q=85',
  student: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=85',
  employer: 'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=85',
  admin: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=85',
}

// ─── Skeleton loader ────────────────────────────────────────────────────────
function Skeleton({ className = '' }) {
  return <div className={`skeleton ${className}`} />
}

function DashboardSkeleton() {
  return (
    <div className="animate-fade-up space-y-6">
      <div className="h-40 skeleton rounded-3xl" />
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <div className="h-64 skeleton rounded-2xl" />
    </div>
  )
}

// ─── Public landing (not logged in) ─────────────────────────────────────────
function PublicDashboard() {
  return (
    <div className="animate-fade-up space-y-12">
      {/* Hero */}
      <div className="editorial-hero min-h-[520px]">
        <img src={heroImages.public} alt="" className="editorial-image" />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="relative z-10 min-h-[520px] flex items-center px-6 md:px-12 py-12">
          <div className="max-w-3xl">
            <div className="eyebrow-pill mb-6">
              <Target size={14} /> SkillMarket
            </div>
            <h1 className="font-display text-5xl md:text-7xl font-bold text-white tracking-tight leading-[0.96]">
              Real projects for students and employers.
          </h1>
          <p className="mt-6 text-white/78 text-lg md:text-xl max-w-2xl leading-relaxed">
            Discover project work, exchange practical skills, and build career momentum in one elegant workspace.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/projects">
              <button className="inline-flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-full font-bold text-base hover:bg-emerald-50 transition-colors shadow-card">
                Browse Projects <ArrowRight size={16} />
              </button>
            </Link>
            <Link to="/register">
              <button className="inline-flex items-center gap-2 bg-white/10 border border-white/25 text-white px-6 py-3 rounded-full font-bold text-base hover:bg-white/20 transition-colors">
                Get Started Free <ArrowRight size={16} />
              </button>
            </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          ['53+', 'Projects'],
          ['760+', 'Learning partners'],
          ['318K+', 'Learner moments'],
          ['20M+', 'Practice hours'],
        ].map(([value, label]) => (
          <div key={label} className="panel-card rounded-4xl p-6 text-center">
            <p className="font-display text-3xl md:text-4xl font-bold text-slate-950">{value}</p>
            <p className="text-xs uppercase tracking-[0.14em] text-slate-400 font-bold mt-2">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {[
          {
            icon: <Target size={28} className="text-brand-600" />,
            title: 'Real Projects',
            desc: 'Work on live projects posted by employers',
            img: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80',
          },
          {
            icon: <ArrowLeftRight size={28} className="text-emerald-600" />,
            title: 'Skill Swap',
            desc: 'Teach what you know, learn what you don\'t',
            img: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
          },
          {
            icon: <Trophy size={28} className="text-amber-600" />,
            title: 'Build Portfolio',
            desc: 'Gain experience and grow your profile',
            img: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
          },
        ].map(({ icon, title, desc, img }) => (
          <div key={title} className="market-card group">
            <div className="relative h-48 overflow-hidden">
              <img src={img} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 to-transparent" />
              <div className="absolute left-5 bottom-5 w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-card">
                {icon}
              </div>
            </div>
            <div className="p-6">
              <h3 className="font-display font-bold text-slate-950 text-2xl mb-2">{title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
            </div>
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
      <div className="editorial-hero min-h-[360px]">
        <img src={heroImages.student} alt="" className="editorial-image" />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="relative z-10 min-h-[360px] flex items-center justify-between flex-wrap gap-6 p-6 md:p-10">
          <div className="max-w-2xl">
            <div className="eyebrow-pill mb-5">
              <GraduationCap size={14} className="text-white" />
              <span>Student workspace</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-[0.96] tracking-tight">
              Welcome back, {name}
            </h1>
            <p className="text-white/78 text-base md:text-lg mt-5 max-w-xl leading-relaxed">Track applications, find active projects, and keep your skill exchange momentum in one polished workspace.</p>
          </div>
          <Link to="/projects">
            <button className="flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-full font-bold text-sm hover:bg-emerald-50 transition-all shadow-card active:scale-[0.97]">
              Browse Projects <ArrowRight size={15} />
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards — Bug 7: wrapped in Links for navigation */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Link to="/my-applications" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="My Applications" value={my_applications_count} icon={FileText}   color="sky"    />
        </Link>
        <Link to="/my-applications" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Approved"         value={approved_count}        icon={CheckCircle} color="green"  />
        </Link>
        <Link to="/my-applications" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Pending"          value={pending_count}         icon={Clock}       color="yellow" />
        </Link>
        <Link to="/projects?status=open" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Open Projects"    value={open_projects_count}   icon={Briefcase}   color="violet" />
        </Link>
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/skill-swap" className="soft-panel rounded-2xl p-5 flex items-center gap-4 hover:shadow-card-hover hover:border-brand-200 transition-all group">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
            <ArrowLeftRight size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Browse Skill Swap</p>
            <p className="text-xs text-slate-400 mt-0.5">Teach what you know, learn what you don't</p>
          </div>
        </Link>
        <Link to="/projects" className="soft-panel rounded-2xl p-5 flex items-center gap-4 hover:shadow-card-hover hover:border-brand-200 transition-all group">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
            <Briefcase size={18} className="text-purple-600" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-sm">Browse Projects</p>
            <p className="text-xs text-slate-400 mt-0.5">Find real-world projects to work on</p>
          </div>
        </Link>
      </div>

      {/* Recent applications */}
      <div className="panel-card">
        <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between bg-white/70">
          <h2 className="font-display font-bold text-slate-900">Recent Applications</h2>
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
                    <td className="px-6 py-3 font-medium text-slate-800">
                      {app.project_id ? (
                        <Link to={`/projects/${app.project_id}`} className="text-brand-600 hover:text-brand-700 hover:underline transition-colors">
                          {app.project_title}
                        </Link>
                      ) : app.project_title}
                    </td>
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
      <div className="editorial-hero min-h-[360px]">
        <img src={heroImages.employer} alt="" className="editorial-image" />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="relative z-10 min-h-[360px] flex items-center justify-between flex-wrap gap-6 p-6 md:p-10">
          <div className="max-w-2xl">
            <div className="eyebrow-pill mb-5">
              <Building2 size={14} className="text-white" />
              <span>Employer workspace</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold text-white leading-[0.96] tracking-tight">
              Welcome back, {name}
            </h1>
            <p className="text-white/78 text-base md:text-lg mt-5 max-w-xl leading-relaxed">Manage live listings, review applicants, and keep project momentum visible at a glance.</p>
          </div>
          <Link to="/projects/create">
            <button className="flex items-center gap-2 bg-white text-slate-950 px-6 py-3 rounded-full font-bold text-sm hover:bg-emerald-50 transition-colors shadow-card">
              <Plus size={15} /> Post Project
            </button>
          </Link>
        </div>
      </div>

      {/* Stat cards — Bug 7: wrapped in Links for navigation */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/my-projects" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="My Projects"      value={my_projects_count}    icon={FolderOpen}  color="violet" />
        </Link>
        <Link to="/my-projects" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Total Applications" value={total_applications} icon={FileText}    color="green"  />
        </Link>
        <Link to="/my-projects" className="block hover:scale-[1.02] transition-transform">
          <StatCard title="Pending Review"   value={pending_applications} icon={Clock}       color="amber"  />
        </Link>
      </div>

      {/* Recent projects */}
      <div className="panel-card">
        <div className="px-6 py-4 border-b border-slate-100/80 flex items-center justify-between bg-white/70">
          <h2 className="font-display font-bold text-slate-900">Recent Projects</h2>
          <Link to="/my-projects" className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors">
            View all →
          </Link>
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
                      <td className="px-6 py-3 font-medium text-slate-800">
                        {p.id ? (
                          <Link to={`/projects/${p.id}`} className="text-brand-600 hover:text-brand-700 hover:underline transition-colors font-semibold">
                            {p.title}
                          </Link>
                        ) : p.title}
                      </td>
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

// Dead AdminDashboard component removed — admin role redirects to /admin page directly

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
