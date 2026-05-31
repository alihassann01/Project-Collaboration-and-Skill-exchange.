import { useEffect, useState, useCallback } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { Search, Plus, X, Briefcase, SlidersHorizontal } from 'lucide-react'
import { getProjects } from '../../api/projects'
import { useAuth } from '../../context/AuthContext'
import ProjectCard from '../../components/ProjectCard'
import Button from '../../components/ui/Button'

const PER_PAGE = 9

function SkeletonCard() {
  return (
    <div className="bg-white/95 rounded-3xl border border-white/80 shadow-card overflow-hidden">
      <div className="h-1.5 skeleton" />
      <div className="p-6 flex flex-col gap-4">
        <div className="flex items-center gap-2.5">
          <div className="w-11 h-11 rounded-2xl skeleton" />
          <div className="h-3 skeleton w-24" />
        </div>
        <div className="h-5 skeleton rounded-lg w-4/5" />
        <div className="flex gap-1.5">
          {[1, 2, 3].map(i => <div key={i} className="h-6 skeleton rounded-full w-16" />)}
        </div>
        <div className="h-3 skeleton rounded w-1/3" />
      </div>
      <div className="px-6 py-4 border-t border-slate-100 flex justify-between bg-slate-50/80">
        <div className="h-3 skeleton rounded w-20" />
        <div className="h-3 skeleton rounded w-16" />
      </div>
    </div>
  )
}

export default function ProjectList() {
  const { user } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()

  const page = parseInt(searchParams.get('page') || '1', 10)
  const search = searchParams.get('search') || ''
  const status = searchParams.get('status') || ''
  const skill = searchParams.get('skill') || ''
  const sort = searchParams.get('sort') || ''

  const [localSearch, setLocalSearch] = useState(search)
  const [localStatus, setLocalStatus] = useState(status)
  const [localSkill, setLocalSkill] = useState(skill)
  const [localSort, setLocalSort] = useState(sort)

  const [projects, setProjects] = useState([])
  const [total, setTotal] = useState(0)
  const [lastPage, setLastPage] = useState(1)
  const [fetching, setFetching] = useState(false)

  const fetchProjects = useCallback(() => {
    setFetching(true)
    getProjects({ page, per_page: PER_PAGE, search, status, skill, sort })
      .then(res => {
        const d = res.data.data
        setProjects(d.data ?? [])
        setTotal(d.total ?? 0)
        setLastPage(d.last_page ?? (Math.ceil((d.total ?? 0) / PER_PAGE) || 1))
      })
      .catch(err => {
        const msg = err.response?.data?.message || 'Failed to load projects.'
        toast.error(msg)
      })
      .finally(() => setFetching(false))
  }, [page, search, status, skill, sort])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  useEffect(() => {
    setLocalSearch(searchParams.get('search') || '')
    setLocalStatus(searchParams.get('status') || '')
    setLocalSkill(searchParams.get('skill') || '')
    setLocalSort(searchParams.get('sort') || '')
  }, [searchParams])

  function applyFilters(e) {
    e.preventDefault()
    const p = {}
    if (localSearch.trim()) p.search = localSearch.trim()
    if (localStatus) p.status = localStatus
    if (localSkill.trim()) p.skill = localSkill.trim()
    if (localSort) p.sort = localSort
    p.page = '1'
    setSearchParams(p)
  }

  function clearFilters() {
    setLocalSearch('')
    setLocalStatus('')
    setLocalSkill('')
    setLocalSort('')
    setSearchParams({})
  }

  function goToPage(n) {
    const p = Object.fromEntries(searchParams.entries())
    setSearchParams({ ...p, page: String(n) })
  }

  const hasFilters = search || status || skill || sort

  return (
    <div className="animate-fade-up space-y-6">
      <div className="editorial-hero min-h-[320px]">
        <img
          src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1600&q=85"
          alt=""
          className="editorial-image"
        />
        <div className="absolute inset-0 editorial-overlay" />
        <div className="relative z-10 flex min-h-[320px] items-center justify-between flex-wrap gap-8 p-6 md:p-10">
          <div className="max-w-2xl">
            <div className="eyebrow-pill mb-5">
              <Briefcase size={14} /> Real projects
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold leading-[0.98] tracking-tight">Browse Projects</h1>
            <p className="text-base md:text-lg text-white/78 mt-5 leading-relaxed max-w-xl">
              Find practical work, match your skills, and apply to projects from employers in the marketplace.
              {!fetching && <> <span className="font-bold text-white">{total}</span> project{total !== 1 ? 's' : ''} available.</>}
            </p>
          </div>
          {user?.role === 'employer' && (
            <Link to="/projects/create">
              <Button variant="success" size="lg" className="bg-white text-slate-950 hover:bg-emerald-50">
                <Plus size={16} /> Post New Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      <form
        onSubmit={applyFilters}
        className="soft-panel rounded-3xl border border-white/80 shadow-card p-4 md:p-5 flex flex-wrap gap-3 items-end"
      >
        <div className="w-full flex items-center gap-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">
          <SlidersHorizontal size={14} /> Refine results
        </div>

        <div className="flex-1 min-w-[180px] flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Search</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={localSearch}
              onChange={e => setLocalSearch(e.target.value)}
              placeholder="Search by title or skill..."
              className="w-full pl-8 pr-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1 min-w-[130px]">
          <label className="text-xs font-semibold text-slate-600">Status</label>
          <select
            value={localStatus}
            onChange={e => setLocalStatus(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">All</option>
            <option value="open">Open</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex-1 min-w-[150px] flex flex-col gap-1">
          <label className="text-xs font-semibold text-slate-600">Skill</label>
          <input
            type="text"
            value={localSkill}
            onChange={e => setLocalSkill(e.target.value)}
            placeholder="Filter by skill..."
            className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all"
          />
        </div>

        <div className="flex flex-col gap-1 min-w-[140px]">
          <label className="text-xs font-semibold text-slate-600">Sort By</label>
          <select
            value={localSort}
            onChange={e => setLocalSort(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-slate-50 border border-slate-200 hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white transition-all cursor-pointer"
          >
            <option value="">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="budget_high">Budget (High to Low)</option>
            <option value="deadline">Deadline (Soonest)</option>
          </select>
        </div>

        <div className="flex gap-2 items-center">
          <Button type="submit" variant="primary" size="sm" loading={fetching}>
            <Search size={14} /> Search
          </Button>
          {hasFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="p-2.5 rounded-full text-slate-400 hover:text-slate-600 hover:bg-white transition-colors border border-transparent hover:border-slate-200"
              title="Clear filters"
            >
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
        <div className="panel-card rounded-3xl py-20 text-center">
          <div className="mx-auto mb-4 w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center">
            <Search size={26} />
          </div>
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
            Previous
          </Button>
          <span className="text-sm text-slate-500 font-medium">
            Page {page} of {lastPage}
          </span>
          <Button variant="secondary" size="sm" disabled={page >= lastPage} onClick={() => goToPage(page + 1)}>
            Next
          </Button>
        </div>
      )}
    </div>
  )
}
