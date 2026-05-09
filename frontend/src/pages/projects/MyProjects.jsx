import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Plus, Edit, Briefcase, Trash2 } from 'lucide-react'
import { getMyProjects, deleteProject } from '../../api/projects'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Button from '../../components/ui/Button'

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-50">
      {[1,2,3,4,5].map(i => (
        <td key={i} className="px-6 py-4">
          <div className="h-4 skeleton rounded-lg w-3/4" />
        </td>
      ))}
    </tr>
  )
}

export default function MyProjects() {
  const [projects, setProjects] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [deleteTarget, setDeleteTarget] = useState(null) // { id, title }
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    getMyProjects()
      .then(res => setProjects(res.data.data ?? res.data ?? []))
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load your projects.'
        toast.error(msg)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteProject(deleteTarget.id)
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
      toast.success('Project deleted.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      {/* Heading */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-slate-900">My Projects</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage your posted projects</p>
        </div>
        <Link to="/projects/create">
          <Button variant="employer" size="sm">
            <Plus size={15} /> Post New Project
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs font-semibold text-slate-400 uppercase tracking-wide border-b border-slate-100">
                  <th className="px-6 py-3 text-left">Title</th>
                  <th className="px-6 py-3 text-left">Status</th>
                  <th className="px-6 py-3 text-left">Applications</th>
                  <th className="px-6 py-3 text-left">Deadline</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(4)].map((_, i) => <SkeletonRow key={i} />)}
              </tbody>
            </table>
          </div>
        ) : projects.length === 0 ? (
          <div className="py-20 text-center">
            <Briefcase size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 font-medium mb-4">You haven't posted any projects yet.</p>
            <Link to="/projects/create">
              <Button variant="primary" size="sm">
                <Plus size={15} /> Post your first project
              </Button>
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
                  <th className="px-6 py-3 text-left">Deadline</th>
                  <th className="px-6 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}
                    className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        to={`/projects/${p.id}`}
                        className="font-medium text-slate-800 hover:text-brand-600 transition-colors"
                      >
                        {p.title}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600">{p.applications_count ?? 0}</span>
                        {(p.pending_applications_count ?? 0) > 0 && (
                          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
                            {p.pending_applications_count} pending
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-500">
                      {p.deadline
                        ? new Date(p.deadline).toLocaleDateString('en-US', {
                            month: 'short', day: 'numeric', year: 'numeric',
                          })
                        : '—'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link to={`/projects/${p.id}/edit`}>
                          <button className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5
                            rounded-lg bg-slate-50 text-slate-600 hover:bg-brand-50 hover:text-brand-600
                            border border-slate-200 hover:border-brand-100 transition-all">
                            <Edit size={13} /> Edit
                          </button>
                        </Link>
                        <button
                          onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5
                            rounded-lg bg-red-50 text-red-600 hover:bg-red-100
                            border border-red-100 transition-all"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!deleteTarget}
        title="Delete Project?"
        message={`Are you sure you want to delete "${deleteTarget?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
