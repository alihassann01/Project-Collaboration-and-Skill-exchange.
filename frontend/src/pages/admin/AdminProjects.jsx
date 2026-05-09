import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, XCircle, RefreshCw, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getAdminProjects, closeProject, reopenProject, deleteAdminProject } from '../../api/admin'
import StatusBadge from '../../components/ui/StatusBadge'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner from '../../components/ui/Spinner'

const PAGE_SIZE = 10

export default function AdminProjects() {
  const [projects, setProjects] = useState([])
  const [loading, setLoading]   = useState(true)
  const [busy, setBusy]         = useState(null)
  const [page, setPage]         = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]       = useState(0)
  const [searchQuery, setSearchQuery] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [closeTarget, setCloseTarget] = useState(null)
  const [closing, setClosing] = useState(false)
  const [reopenTarget, setReopenTarget] = useState(null)
  const [reopening, setReopening] = useState(false)

  function fetchProjects(p = page, search = searchQuery) {
    setLoading(true)
    getAdminProjects({ page: p, per_page: 10, search })
      .then(r => {
        const d = r.data.data
        setProjects(d.projects ?? [])
        setTotal(d.total ?? 0)
        setTotalPages(d.last_page ?? 1)
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load projects.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchProjects() }, [page])

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-display text-2xl font-bold text-slate-900">Manage Projects</h1>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
            {total}
          </span>
        </div>
        <form onSubmit={e => { e.preventDefault(); setPage(1); fetchProjects(1, searchQuery) }} className="flex gap-2">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search projects…"
              className="pl-8 pr-3 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 transition-all w-48"
            />
          </div>
          <button type="submit" className="px-3 py-2 rounded-xl text-sm font-semibold bg-brand-500 text-white hover:bg-brand-600 transition-colors">
            Search
          </button>
        </form>
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
              {projects.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                >
                  <td className="px-5 py-3">
                    <p className="font-medium text-slate-800 max-w-[200px] truncate">{p.title}</p>
                  </td>
                  <td className="px-3 py-3 text-slate-500">
                    {p.employer_id ? (
                      <Link to={`/profile/${p.employer_id}`} className="hover:text-brand-600 transition-colors">
                        {p.employer_name}
                      </Link>
                    ) : p.employer_name}
                  </td>
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
                      {p.status === 'closed' && (
                        <button
                          onClick={() => setReopenTarget({ id: p.id, title: p.title })}
                          disabled={busy === p.id}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-green-50 text-green-700 hover:bg-green-100 transition-colors disabled:opacity-50"
                        >
                          <RefreshCw size={13} /> Reopen
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
              Page {page} of {totalPages} ({total} projects)
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
        onConfirm={async () => {
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
        }}
        onCancel={() => setCloseTarget(null)}
      />

      <ConfirmDialog
        open={!!reopenTarget}
        title={`Reopen Project "${reopenTarget?.title}"?`}
        message="This will allow new applications to be submitted again."
        confirmLabel="Reopen"
        variant="default"
        loading={reopening}
        onConfirm={async () => {
          setReopening(true)
          try {
            const r = await reopenProject(reopenTarget.id)
            const updated = r.data.data.project
            setProjects(prev => prev.map(p => p.id === updated.id ? { ...p, status: updated.status } : p))
            toast.success('Project reopened.')
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to reopen project.')
          } finally {
            setReopening(false)
            setReopenTarget(null)
          }
        }}
        onCancel={() => setReopenTarget(null)}
      />

      <ConfirmDialog
        open={!!deleteTarget}
        title={`Delete Project "${deleteTarget?.title}"?`}
        message="This action cannot be undone."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true)
          try {
            await deleteAdminProject(deleteTarget.id)
            // Stay on current page; go back if it was the last item on this page
            const stayPage = projects.length <= 1 && page > 1 ? page - 1 : page
            setPage(stayPage)
            fetchProjects(stayPage, searchQuery)
            toast.success('Project deleted.')
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete project.')
          } finally {
            setDeleting(false)
            setDeleteTarget(null)
          }
        }}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  )
}
