import { useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { Trash2, XCircle, ChevronLeft, ChevronRight } from 'lucide-react'
import { getAdminProjects, closeProject, deleteAdminProject } from '../../api/admin'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner from '../../components/ui/Spinner'

const PAGE_SIZE = 10

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState(null)
  const [page, setPage]         = useState(1)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [closeTarget, setCloseTarget] = useState(null)
  const [closing, setClosing] = useState(false)

  useEffect(() => {
    getAdminProjects()
      .then(r => setProjects(r.data.data.projects ?? []))
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load projects.'))
      .finally(() => setLoading(false))
  }, [])

  async function handleClose() {
    if (!closeTarget) return
    setClosing(true)
    try {
      const r = await closeProject(closeTarget.id)
      const updated = r.data.data.project
      setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, status: updated.status } : p))
      toast.success('Project closed.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to close project.')
    } finally {
      setClosing(false)
      setCloseTarget(null)
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await deleteAdminProject(deleteTarget.id)
      setProjects(prev => prev.filter(p => p.id !== deleteTarget.id))
      toast.success('Project deleted.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete project.')
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner size="lg" className="text-brand-600" />
      </div>
    )
  }

  const totalPages = Math.ceil(projects.length / PAGE_SIZE)
  const paginated = projects.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">Manage Projects</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
          {projects.length}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Title</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Employer</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Applications</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Posted</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 max-w-[200px] truncate">{p.title}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{p.employer_name}</td>
                  <td className="px-3 py-3"><StatusBadge status={p.status} /></td>
                  <td className="px-3 py-3 text-slate-500">{p.applications_count}</td>
                  <td className="px-3 py-3 text-xs text-slate-400">
                    {new Date(p.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {p.status === 'open' && (
                        <button
                          onClick={() => setCloseTarget({ id: p.id, title: p.title })}
                          disabled={busy === p.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors disabled:opacity-50"
                        >
                          <XCircle size={13} /> Close
                        </button>
                      )}
                      <button
                        onClick={() => setDeleteTarget({ id: p.id, title: p.title })}
                        disabled={busy === p.id}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <Trash2 size={13} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {projects.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No projects found.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages} ({projects.length} projects)
            </span>
            <div className="flex gap-1">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={!!closeTarget}
        title={`Close Project "${closeTarget?.title}"?`}
        message="This will prevent new applications from being submitted."
        confirmLabel="Close"
        variant="warning"
        loading={closing}
        onConfirm={handleClose}
        onCancel={() => setCloseTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete Project "${deleteTarget?.title}"?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
