import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Building2, DollarSign } from 'lucide-react'
import StatusBadge from './ui/StatusBadge'

const typeLabel = { remote: '🏠 Remote', onsite: '🏢 Onsite', hybrid: '🔀 Hybrid' }

function formatPKR(n) {
  return Number(n).toLocaleString('en-PK')
}

export default function ProjectCard({ project }) {
  const {
    id, title, employer_name, skills_required,
    deadline, status, type, budget_min, budget_max, views,
  } = project

  const skills = Array.isArray(skills_required)
    ? skills_required
    : typeof skills_required === 'string'
      ? skills_required.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const deadlineStr = deadline
    ? `Due: ${new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
    : null

  const hasBudget = budget_min != null || budget_max != null
  const budgetStr = hasBudget
    ? budget_min != null && budget_max != null
      ? `PKR ${formatPKR(budget_min)} – ${formatPKR(budget_max)}`
      : budget_min != null
        ? `PKR ${formatPKR(budget_min)}+`
        : `Up to PKR ${formatPKR(budget_max)}`
    : null

  const visibleSkills = skills.slice(0, 4)
  const extraSkills = skills.length - 4

  return (
    <div className="group bg-white rounded-2xl shadow-card border border-slate-100/80 p-5 flex flex-col gap-3
      hover:shadow-card-hover hover:border-brand-100 transition-all duration-200">

      {/* Title + status */}
      <div className="flex items-start justify-between gap-2">
        <Link
          to={`/projects/${id}`}
          className="font-display font-700 text-slate-900 text-base leading-snug
            group-hover:text-brand-600 transition-colors line-clamp-2"
        >
          {title}
        </Link>
        <StatusBadge status={status} />
      </div>

      {/* Employer */}
      {employer_name && (
        <div className="flex items-center gap-1.5 -mt-1">
          <Building2 size={11} className="text-slate-300" />
          <span className="text-xs text-slate-400 font-medium">Posted by {employer_name}</span>
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {visibleSkills.map(skill => (
            <span
              key={skill}
              className="text-xs px-2.5 py-0.5 rounded-full bg-brand-50 text-brand-700 font-medium border border-brand-100"
            >
              {skill}
            </span>
          ))}
          {extraSkills > 0 && (
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-medium">
              +{extraSkills} more
            </span>
          )}
        </div>
      )}

      {/* Info row: type, budget, views */}
      {(type || hasBudget || views != null) && (
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {type && (
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              {typeLabel[type] ?? type}
            </span>
          )}
          {budgetStr && (
            <span className="flex items-center gap-1 font-semibold text-green-700 bg-green-50 px-2.5 py-0.5 rounded-full border border-green-100">
              <DollarSign size={10} /> {budgetStr}
            </span>
          )}
          {views != null && (
            <span className="text-slate-400">👁 {views} views</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-slate-50">
        {deadlineStr ? (
          <span className="flex items-center gap-1 text-xs text-slate-400">
            <CalendarDays size={12} />
            {deadlineStr}
          </span>
        ) : <span />}

        <Link
          to={`/projects/${id}`}
          className="flex items-center gap-1 text-xs font-semibold text-brand-600
            hover:text-brand-700 transition-colors"
        >
          View Details <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </Link>
      </div>
    </div>
  )
}
