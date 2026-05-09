import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { BarChart3, Users, ArrowLeftRight, TrendingUp, Briefcase } from 'lucide-react'
import { getAdminReports } from '../../api/admin'
import StatCard from '../../components/ui/StatCard'
import Spinner from '../../components/ui/Spinner'

export default function AdminReports() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getAdminReports()
      .then(r => setData(r.data.data))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load reports.'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  if (!data) {
    return <p className="text-center text-red-500 py-12">Failed to load reports.</p>
  }

  const { applications_by_status = [], top_projects = [], new_users_last_30_days = 0, skill_swap_total = 0 } = data

  // Build status map
  const statusMap = {}
  applications_by_status.forEach(row => { statusMap[row.status] = Number(row.count) })
  const totalApps = Object.values(statusMap).reduce((a, b) => a + b, 0)

  const statusColors = {
    pending: { bg: 'bg-yellow-500', label: 'Pending' },
    approved: { bg: 'bg-green-500', label: 'Approved' },
    rejected: { bg: 'bg-red-500', label: 'Rejected' },
    withdrawn: { bg: 'bg-slate-400', label: 'Withdrawn' },
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">Reports & Analytics</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 text-amber-700">
          <BarChart3 size={12} className="inline mr-1" />Admin
        </span>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Applications" value={totalApps} icon={Briefcase} color="violet" />
        <StatCard title="New Users (30d)" value={new_users_last_30_days} icon={Users} color="sky" />
        <StatCard title="Skill Swaps" value={skill_swap_total} icon={ArrowLeftRight} color="green" />
        <StatCard title="Top Project Apps" value={top_projects[0]?.applications_count ?? 0} icon={TrendingUp} color="amber" />
      </div>

      {/* Applications by status */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card p-6">
        <h2 className="font-display font-bold text-slate-900 mb-4">Applications by Status</h2>
        {totalApps === 0 ? (
          <p className="text-slate-400 text-sm">No applications yet.</p>
        ) : (
          <div className="space-y-3">
            {Object.entries(statusColors).map(([status, config]) => {
              const count = statusMap[status] || 0
              const pct = totalApps > 0 ? Math.round((count / totalApps) * 100) : 0
              return (
                <div key={status} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-slate-600 w-24">{config.label}</span>
                  <div className="flex-1 bg-slate-100 rounded-full h-5 overflow-hidden">
                    <div
                      className={`h-full rounded-full ${config.bg} transition-all duration-500`}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <span className="text-sm font-semibold text-slate-700 w-16 text-right">{count} ({pct}%)</span>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Top projects by applications */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-900">Top Projects by Applications</h2>
        </div>
        {top_projects.length === 0 ? (
          <div className="px-6 py-12 text-center text-slate-400 text-sm">No projects yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100 bg-slate-50/80">
                  <th className="px-6 py-3 text-left">#</th>
                  <th className="px-6 py-3 text-left">Project</th>
                  <th className="px-6 py-3 text-left">Employer</th>
                  <th className="px-6 py-3 text-right">Applications</th>
                </tr>
              </thead>
              <tbody>
                {top_projects.map((p, i) => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3 font-bold text-slate-400">{i + 1}</td>
                    <td className="px-6 py-3 font-medium text-slate-800">{p.title}</td>
                    <td className="px-6 py-3 text-slate-500">{p.employer_name}</td>
                    <td className="px-6 py-3 text-right">
                      <span className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-full bg-brand-50 text-brand-700 font-bold text-xs">
                        {p.applications_count}
                      </span>
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
