import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Trash2, ToggleLeft, ToggleRight, Shield, ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { getAdminUsers, toggleUser, deleteUser } from '../../api/admin'
import { roleBadge as roleBadgeMap } from '../../utils/format'
import ConfirmDialog from '../../components/ui/ConfirmDialog'
import Spinner from '../../components/ui/Spinner'

const PAGE_SIZE = 10

function RoleBadge({ role }) {
  return (
    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full capitalize ${roleBadgeMap[role] || 'bg-slate-100 text-slate-500'}`}>
      {role}
    </span>
  )
}

export default function AdminUsers() {
  const [users, setUsers]     = useState([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy]       = useState(null)
  const [page, setPage]       = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal]     = useState(0)
  const [searchTerm, setSearchTerm] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [deleting, setDeleting] = useState(false)

  function fetchUsers(p = page, search = searchTerm) {
    setLoading(true)
    getAdminUsers({ page: p, per_page: 10, search })
      .then(r => {
        const d = r.data.data
        setUsers(d.users ?? [])
        setTotal(d.total ?? 0)
        setTotalPages(d.last_page ?? 1)
      })
      .catch(err => toast.error(err.response?.data?.message || 'Failed to load users.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchUsers() }, [page])

  async function handleToggle(id) {
    setBusy(id)
    try {
      const r = await toggleUser(id)
      const updated = r.data.data.user
      setUsers(prev => prev.map(u => u.id === updated.id ? { ...u, is_active: updated.is_active } : u))
      toast.success(updated.is_active ? 'User activated.' : 'User suspended.')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to toggle user.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="animate-fade-up space-y-6">
      <div className="flex items-center gap-3">
        <h1 className="font-display text-2xl font-bold text-slate-900">Manage Users</h1>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
          {total}
        </span>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-card overflow-hidden">
        {/* Search bar */}
        <div className="px-5 py-3 border-b border-slate-100">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => { setSearchTerm(e.target.value) }}
              onKeyDown={e => { if (e.key === 'Enter') { setPage(1); fetchUsers(1, searchTerm) } }}
              placeholder="Search users… (Enter to search)"
              className="w-full pl-8 pr-3 py-2 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/80 sticky top-0 z-10">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Name</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Email</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Role</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Status</th>
                <th className="text-left px-3 py-3 text-xs font-semibold text-slate-500">Joined</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u, i) => (
                <tr
                  key={u.id}
                  className={`border-b border-slate-50 hover:bg-slate-50/70 transition-colors ${i % 2 === 0 ? '' : 'bg-slate-50/30'}`}
                >
                  <td className="px-5 py-3 font-medium text-slate-800">
                    <Link to={`/profile/${u.id}`} className="hover:text-brand-600 transition-colors">
                      {u.name}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-slate-500">{u.email}</td>
                  <td className="px-3 py-3"><RoleBadge role={u.role} /></td>
                  <td className="px-3 py-3">
                    <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                      u.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                    }`}>
                      {u.is_active ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-400">
                    {new Date(u.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex items-center justify-end gap-2">
                      {u.role === 'admin' ? (
                        <span className="flex items-center gap-1 text-xs text-amber-500 font-medium px-2.5 py-1">
                          <Shield size={13} /> Admin
                        </span>
                      ) : (
                        <>
                          <button
                            onClick={() => handleToggle(u.id)}
                            disabled={busy === u.id}
                            title={u.is_active ? 'Suspend user' : 'Activate user'}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                              u.is_active
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                                : 'bg-green-50 text-green-700 hover:bg-green-100'
                            }`}
                          >
                            {u.is_active
                              ? <><ToggleRight size={14} /> Suspend</>
                              : <><ToggleLeft size={14} /> Activate</>
                            }
                          </button>
                          <button
                            onClick={() => setDeleteTarget({ id: u.id, name: u.name })}
                            disabled={busy === u.id}
                            title="Delete user"
                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50"
                          >
                            <Trash2 size={13} /> Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {users.length === 0 && (
            <div className="py-16 text-center text-slate-400 text-sm">No users found.</div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100">
            <span className="text-xs text-slate-400">
              Page {page} of {totalPages} ({total} users)
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
        open={!!deleteTarget}
        title={`Delete User "${deleteTarget?.name}"?`}
        message="This action cannot be undone. All associated data will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        loading={deleting}
        onConfirm={async () => {
          setDeleting(true)
          try {
            await deleteUser(deleteTarget.id)
            // Stay on current page; go back if it was the last item on this page
            const stayPage = users.length <= 1 && page > 1 ? page - 1 : page
            setPage(stayPage)
            fetchUsers(stayPage, searchTerm)
            toast.success('User deleted.')
          } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to delete user.')
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
