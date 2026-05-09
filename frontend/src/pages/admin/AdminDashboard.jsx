import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Users, Briefcase, FileText, UserCheck, Building2, FolderOpen } from 'lucide-react'
import { getAdminDashboard } from '../../api/admin'
import StatusBadge from '../../components/ui/StatusBadge'
import { roleBadge } from '../../utils/format'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'

function RoleBadge({ role }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadge[role] || 'bg-slate-100 text-slate-500'}`}>
      {role}
    </span>
  )
}

export default function AdminDashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminDashboard()
      .then(r => setData(r.data.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load admin dashboard.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  if (!data) return null

  const { stats, recent_users, recent_projects } = data

  return (
    <div className="animate-fade-up space-y-8">
      {/* Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-amber-400 via-amber-500 to-orange-600 p-6 md:p-8">
        <div className="grid-pattern absolute inset-0" />
        <div className="relative z-10 flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 rounded-xl px-3 py-1.5 mb-3">
              <span className="text-white/90 text-xs font-semibold">⚡ Admin Control Panel</span>
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-white leading-tight">
              Admin Dashboard
            </h1>
            <p className="text-white/70 text-sm mt-1">Monitor users, projects, and platform health.</p>
          </div>
          <div className="flex gap-2">
            <Link to="/admin/users" className="flex items-center gap-2 bg-white/15 border border-white/20 text-white px-4 py-2 rounded-xl text-sm font-semibold hover:bg-white/25 transition-colors">
              <Users size={15} /> Manage Users
            </Link>
            <Link to="/admin/projects" className="flex items-center gap-2 bg-white text-amber-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-amber-50 transition-colors shadow-sm">
              <Briefcase size={15} /> Manage Projects
            </Link>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Users"    value={stats.total_users}        icon={Users}      color="amber" />
        <StatCard title="Students"       value={stats.total_students}     icon={UserCheck}  color="sky" />
        <StatCard title="Employers"      value={stats.total_employers}    icon={Building2}  color="violet" />
        <StatCard title="Projects"       value={stats.total_projects}     icon={FolderOpen} color="amber" />
        <StatCard title="Open Projects"  value={stats.open_projects}      icon={Briefcase}  color="green" />
        <StatCard title="Applications"   value={stats.total_applications} icon={FileText}   color="blue" />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent users */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Users</h2>
            <Link to="/admin/users" className="text-xs text-brand-600 font-medium hover:text-brand-700">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500">Name</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Role</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Joined</th>
              </tr>
            </thead>
            <tbody>
              {recent_users.map((u, i) => (
                <tr key={u.id} className={`${i < recent_users.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-400">{u.email}</p>
                  </td>
                  <td className="px-3 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-3 py-3 text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Recent projects */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Recent Projects</h2>
            <Link to="/admin/projects" className="text-xs text-brand-600 font-medium hover:text-brand-700">View all →</Link>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50">
                <th className="text-left px-5 py-2.5 text-xs font-semibold text-slate-500">Title</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-3 py-2.5 text-xs font-semibold text-slate-500">Posted</th>
              </tr>
            </thead>
            <tbody>
              {recent_projects.map((p, i) => (
                <tr key={p.id} className={`${i < recent_projects.length - 1 ? 'border-b border-slate-50' : ''} hover:bg-slate-50 transition-colors`}>
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 truncate max-w-[180px]">{p.title}</p>
                    <p className="text-xs text-slate-400">{p.employer_name}</p>
                  </td>
                  <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3 text-xs text-slate-400">
                    {new Date(p.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
