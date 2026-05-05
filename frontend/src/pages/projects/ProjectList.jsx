import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, Plus, X } from 'lucide-react'
import { getProjects } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import ProjectCard from '../../components/ProjectCard'
import Button from '../../components/ui/Button'

const PER_PAGE = 9

function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-3 animate-pulse">
      <div className="flex justify-between gap-2">
        <div className="h-5 bg-slate-200 rounded-lg w-3/4" />
        <div className="h-5 bg-slate-200 rounded-full w-14" />
      </div>
      <div className="h-3 bg-slate-200 rounded w-1/3" />
      <div className="flex gap-1.5">
        {[1,2,3].map(i => <div key={i} className="h-5 bg-slate-200 rounded-full w-16" />)}
      </div>
      <div className="flex justify-between pt-2 border-t border-slate-50">
        <div className="h-3 bg-slate-200 rounded w-28" />
        <div className="h-3 bg-slate-200 rounded w-20" />
      </div>
    </div>
  )
}

export default function ProjectList() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const page   = parseInt(searchParams.get('page')   || '1', 10)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const skill  = searchParams.get('skill')  || ''

  const [localSearch, setLocalSearch] = useState(search)
  const [localStatus, setLocalStatus] = useState(status)
  const [localSkill,  setLocalSkill]  = useState(skill)

  const [projects,  setProjects]  = useState([])
  const [total,     setTotal]     = useState(0)
  const [lastPage,  setLastPage]  = useState(1)
  const [fetching,  setFetching]  = useState(false)

  const fetchProjects = useCallback(() => {
    setFetching(true)
    getProjects({ page, per_page: PER_PAGE, search, status, skill })
      .then(res => {
        const d = res.data.data
        setProjects(d.data ?? [])
        setTotal(d.total ?? 0)
        // FIX: wrap the fallback expression in parens so ?? and || don't conflict
        setLastPage(d.last_page ?? (Math.ceil((d.total ?? 0) / PER_PAGE) || 1))
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load projects.'
        toast.error(msg)
      })
      .finally(() => setFetching(false))
  }, [page, search, status, skill])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '')
    setLocalStatus(searchParams.get('status') || '')
    setLocalSkill(searchParams.get('skill')   || '')
  }, [searchParams])

  function applyFilters(e) {
    e.preventDefault()
    const p = {}
    if (localSearch.trim()) p.search = localSearch.trim()
    if (localStatus)        p.status = localStatus
    if (localSkill.trim())  p.skill  = localSkill.trim()
    p.page = '1'
    setSearchParams(p)
  }

  function clearFilters() {
    setLocalSearch(''); setLocalStatus(''); setLocalSkill('')
    setSearchParams({})
  }

  function goToPage(n) {
    const p = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...p, page: String(n) })
  }

  const hasFilters = search || status || skill

  return (
    <div className="animate-fade-up space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-sm">
            Browse Opportunities
          </span>
          <h1 className="font-display text-2xl font-700 text-slate-900">Projects</h1>
          {!fetching && (
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500">
              {total} result{total !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        {user?.role === 'employer' && (
          <Link to="/projects/create">
            <Button variant="employer" size="sm">
              <Plus size={15} /> Post New Project
            </Button>
          </Link>
        )}
      </div>

      <form onSubmit={applyFilters}
        className="bg-white rounded-2xl border border-slate-100 shadow-card p-4 flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[180px] flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by title or skill…"
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200
                hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400
                focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs font-medium text-slate-500">Status</label>
          <select
            value={localStatus}
            onChange={e => setLocalStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200
              hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400
              focus:border-brand-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px] flex flex-col gap-1">
          <label className="text-xs font-medium text-slate-500">Skill</label>
          <input
            type="text"
            value={localSkill}
            onChange={e => setLocalSkill(e.target.value)}
            placeholder="Filter by skill…"
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200
              hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400
              focus:border-brand-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex gap-2 items-center">
          <Button type="submit" variant="primary" size="sm" loading={fetching}>
            <Search size={14} /> Search
          </Button>
          {hasFilters && (
            <button type="button" onClick={clearFilters}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              title="Clear filters">
              <X size={16} />
            </button>
          )}
        </div>
      </form>

      {fetching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-card py-20 text-center">
          <div className="text-5xl mb-4">📂</div>
          <p className="text-slate-500 font-medium text-lg mb-1">No projects found</p>
          <p className="text-slate-400 text-sm mb-5">Try adjusting your filters or check back later.</p>
          {hasFilters && (
            <Button variant="secondary" size="sm" onClick={clearFilters}>
              <X size={14} /> Clear filters
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map(p => <ProjectCard key={p.id} project={p} />)}
        </div>
      )}

      {!fetching && lastPage > 1 && (
        <div className="flex items-center justify-center gap-4 pt-2">
          <Button variant="secondary" size="sm" disabled={page <= 1} onClick={() => goToPage(page - 1)}>
            ← Previous
          </Button>
          <span className="text-sm text-slate-500 font-medium">
            Page {page} of {lastPage}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => goToPage(page + 1)}>
            Next →
          </Button>
        </div>
      )}
    </div>
  )
}
