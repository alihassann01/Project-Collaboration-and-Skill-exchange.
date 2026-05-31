import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Briefcase,
  Building2,
  CheckCircle2,
  Clock3,
  FileText,
  FolderOpen,
  ShieldCheck,
  UserCheck,
  Users,
} from 'lucide-react'
import { getAdminDashboard } from '../../api/admin'
import StatusBadge from '../../components/ui/StatusBadge'
import { roleBadge } from '../../utils/format'
import Spinner from '../../components/ui/Spinner'

function RoleBadge({ role }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge[role] || 'bg-slate-100 text-slate-500'}`}>
      {role}
    </span>
  )
}

function MetricCard({ title, value, icon: Icon, tone = 'slate', to, detail }) {
  const tones = {
    amber: 'bg-amber-50 text-amber-700 ring-amber-100',
    emerald: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
    sky: 'bg-sky-50 text-sky-700 ring-sky-100',
    violet: 'bg-violet-50 text-violet-700 ring-violet-100',
    rose: 'bg-rose-50 text-rose-700 ring-rose-100',
    slate: 'bg-slate-50 text-slate-700 ring-slate-100',
  }

  const content = (
    <div className="group h-full rounded-2xl border border-white/80 bg-white/95 p-5 shadow-card backdrop-blur-sm transition-all hover:-translate-y-0.5 hover:shadow-lg">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ring-1 ${tones[tone] || tones.slate}`}>
          <Icon size={20} strokeWidth={1.8} />
        </div>
        {to && <ArrowRight size={16} className="mt-1 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-slate-500" />}
      </div>
      <p className="mt-5 text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className="mt-1 font-display text-3xl font-bold leading-none text-slate-950">{value ?? 0}</p>
      {detail && <p className="mt-2 text-xs leading-relaxed text-slate-500">{detail}</p>}
    </div>
  )

  return to ? (
    <Link to={to} className="block h-full rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-400">
      {content}
    </Link>
  ) : content
}

function HealthRow({ label, value, icon: Icon, tone = 'emerald' }) {
  const tones = {
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
    sky: 'bg-sky-50 text-sky-700',
  }

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3">
      <div className="flex items-center gap-3 min-w-0">
        <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${tones[tone] || tones.emerald}`}>
          <Icon size={17} />
        </span>
        <span className="text-sm font-medium text-slate-700">{label}</span>
      </div>
      <span className="text-sm font-bold text-slate-950">{value}</span>
    </div>
  )
}

function EmptyState({ label }) {
  return (
    <div className="px-5 py-10 text-center text-sm text-slate-400">
      {label}
    </div>
  )
}

export default function AdminDashboard() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load admin dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  const adminModel = useMemo(() => {
    if (!data) return null
    const stats = data.stats || {}
    const closedProjects = Math.max(0, (stats.total_projects || 0) - (stats.open_projects || 0))
    const projectFill = stats.total_projects ? Math.round(((stats.open_projects || 0) / stats.total_projects) * 100) : 0
    const studentShare = stats.total_users ? Math.round(((stats.total_students || 0) / stats.total_users) * 100) : 0
    const employerShare = stats.total_users ? Math.round(((stats.total_employers || 0) / stats.total_users) * 100) : 0

    return {
      stats,
      closedProjects,
      projectFill,
      studentShare,
      employerShare,
      recentUsers: data.recent_users || [],
      recentProjects: data.recent_projects || [],
    }
  }, [data])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  if (!adminModel) return null

  const { stats, closedProjects, projectFill, studentShare, employerShare, recentUsers, recentProjects } = adminModel

  return (
    <div className="animate-fade-up space-y-7">
      <section className="overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-950 text-white shadow-card">
        <div className="relative p-6 md:p-8">
          <div className="absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top_right,rgba(245,158,11,0.34),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.24),transparent_38%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/80">
                <ShieldCheck size={14} />
                Admin command center
              </div>
              <h1 className="mt-4 font-display text-3xl font-bold tracking-normal md:text-4xl">
                Platform overview
              </h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/68">
                Monitor users, projects, applications, and moderation actions from one focused workspace.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link to="/admin/users" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-50">
                <Users size={16} /> Users
              </Link>
              <Link to="/admin/projects" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15">
                <Briefcase size={16} /> Projects
              </Link>
              <Link to="/admin/reports" className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-white/15">
                <BarChart3 size={16} /> Reports
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <MetricCard title="Total users" value={stats.total_users} icon={Users} tone="amber" to="/admin/users" detail={`${studentShare}% students`} />
        <MetricCard title="Students" value={stats.total_students} icon={UserCheck} tone="sky" to="/admin/users?role=student" detail="Learning accounts" />
        <MetricCard title="Employers" value={stats.total_employers} icon={Building2} tone="violet" to="/admin/users?role=employer" detail={`${employerShare}% of users`} />
        <MetricCard title="Projects" value={stats.total_projects} icon={FolderOpen} tone="emerald" to="/admin/projects" detail={`${stats.open_projects || 0} open`} />
        <MetricCard title="Applications" value={stats.total_applications} icon={FileText} tone="rose" to="/admin/reports" detail="Across all projects" />
        <MetricCard title="Closed work" value={closedProjects} icon={CheckCircle2} tone="slate" to="/admin/projects?status=closed" detail="Completed or closed" />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.35fr_0.85fr]">
        <div className="panel-card overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100/80 bg-white/80 px-5 py-4">
            <div>
              <h2 className="font-display text-lg font-bold text-slate-900">Recent activity</h2>
              <p className="text-xs text-slate-400">Newest accounts and project posts</p>
            </div>
            <Link to="/admin/reports" className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:text-brand-700">
              Full reports <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid lg:grid-cols-2">
            <div className="border-b border-slate-100 lg:border-b-0 lg:border-r">
              <div className="flex items-center justify-between px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Users</p>
                <Link to="/admin/users" className="text-xs font-semibold text-slate-500 hover:text-brand-600">View all</Link>
              </div>
              {recentUsers.length === 0 ? (
                <EmptyState label="No recent users yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentUsers.map(user => (
                    <div key={user.id} className="flex items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-sm font-bold text-slate-600">
                        {user.name?.slice(0, 1)?.toUpperCase() || 'U'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link to={`/profile/${user.id}`} className="block truncate text-sm font-bold text-slate-800 hover:text-brand-600">
                          {user.name}
                        </Link>
                        <p className="truncate text-xs text-slate-400">{user.email}</p>
                      </div>
                      <div className="text-right">
                        <RoleBadge role={user.role} />
                        <p className="mt-1 text-[11px] text-slate-400">
                          {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between px-5 py-3">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Projects</p>
                <Link to="/admin/projects" className="text-xs font-semibold text-slate-500 hover:text-brand-600">View all</Link>
              </div>
              {recentProjects.length === 0 ? (
                <EmptyState label="No recent projects yet." />
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentProjects.map(project => (
                    <div key={project.id} className="px-5 py-3.5 transition-colors hover:bg-slate-50">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link to={`/projects/${project.id}`} className="block truncate text-sm font-bold text-slate-800 hover:text-brand-600">
                            {project.title}
                          </Link>
                          <p className="mt-1 truncate text-xs text-slate-400">{project.employer_name}</p>
                        </div>
                        <StatusBadge status={project.status} />
                      </div>
                      <p className="mt-2 flex items-center gap-1 text-[11px] text-slate-400">
                        <Clock3 size={12} />
                        {new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="panel-card p-5">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="font-display text-lg font-bold text-slate-900">Platform health</h2>
                <p className="text-xs text-slate-400">Quick operational signals</p>
              </div>
              <Activity size={19} className="text-emerald-600" />
            </div>
            <div className="space-y-3">
              <HealthRow label="Open project ratio" value={`${projectFill}%`} icon={FolderOpen} tone="emerald" />
              <HealthRow label="Student share" value={`${studentShare}%`} icon={UserCheck} tone="sky" />
              <HealthRow label="Employer share" value={`${employerShare}%`} icon={Building2} tone="amber" />
            </div>
          </div>

          <div className="panel-card p-5">
            <div className="mb-4">
              <h2 className="font-display text-lg font-bold text-slate-900">Admin shortcuts</h2>
              <p className="text-xs text-slate-400">Most-used controls</p>
            </div>
            <div className="grid gap-2">
              <Link to="/admin/users?role=student" className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-sky-100 hover:bg-sky-50 hover:text-sky-700">
                Review students <ArrowRight size={15} />
              </Link>
              <Link to="/admin/users?role=employer" className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-violet-100 hover:bg-violet-50 hover:text-violet-700">
                Review employers <ArrowRight size={15} />
              </Link>
              <Link to="/admin/projects?status=open" className="flex items-center justify-between rounded-xl border border-slate-100 px-4 py-3 text-sm font-semibold text-slate-700 transition-colors hover:border-emerald-100 hover:bg-emerald-50 hover:text-emerald-700">
                Open projects <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </aside>
      </section>
    </div>
  )
}
