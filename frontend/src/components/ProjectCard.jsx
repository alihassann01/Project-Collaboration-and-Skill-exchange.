import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Users, Clock, Briefcase } from 'lucide-react'
import { getInitials, chipColorClass, formatBudgetRange, deadlineUrgency, typeLabels, durationLabels } from '../utils/format'
import StatusBadge from './ui/StatusBadge'

export default function ProjectCard({ project }) {
  const {
    id, title, employer_name, skills_required,
    deadline, status, type, budget_min, budget_max,
    views, application_count, duration,
  } = project

  const skills = Array.isArray(skills_required)
    ? skills_required
    : typeof skills_required === 'string'
      ? skills_required.split(',').map(s => s.trim()).filter(Boolean)
      : []

  const budgetStr = formatBudgetRange(budget_min, budget_max)
  const urgency = deadlineUrgency(deadline)
  const typeInfo = typeLabels[type]
  const durationStr = durationLabels[duration]

  const visibleSkills = skills.slice(0, 3)
  const extraSkills = skills.length - 3

  const deadlineStr = deadline
    ? new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : null

  return (
    <Link
      to={`/projects/${id}`}
      className="group block bg-white rounded-2xl shadow-card border border-slate-100/80 overflow-hidden card-hover"
    >
      <div className="p-5 flex flex-col gap-3">
        {/* Header: avatar + employer + type */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            {employer_name && (
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0 shadow-sm">
                {getInitials(employer_name)}
              </div>
            )}
            <div className="min-w-0">
              {employer_name && (
                <p className="text-xs text-slate-400 font-medium truncate">{employer_name}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {typeInfo && (
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                {typeInfo.icon} {typeInfo.label}
              </span>
            )}
            <StatusBadge status={status} size="xs" />
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-slate-900 text-[15px] leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
          {title}
        </h3>

        {/* Skills */}
        {skills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {visibleSkills.map((skill, i) => (
              <span key={skill} className={chipColorClass(i)}>
                {skill}
              </span>
            ))}
            {extraSkills > 0 && (
              <span className="tag-chip bg-slate-50 text-slate-500 border-slate-200">
                +{extraSkills}
              </span>
            )}
          </div>
        )}

        {/* Info row: budget, duration */}
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
          {budgetStr && (
            <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
              <Briefcase size={10} /> {budgetStr}
            </span>
          )}
          {durationStr && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium">
              <Clock size={10} /> {durationStr}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-slate-400">
          {urgency && (
            <span className={`inline-flex items-center gap-1 font-semibold px-2 py-0.5 rounded-full ${urgency.color}`}>
              {urgency.icon} {urgency.label}
            </span>
          )}
          {!urgency && deadlineStr && (
            <span className="flex items-center gap-1">
              <CalendarDays size={11} /> {deadlineStr}
            </span>
          )}
          {application_count != null && (
            <span className="flex items-center gap-1">
              <Users size={11} /> {application_count} applied
            </span>
          )}
        </div>

        <span className="flex items-center gap-1 text-xs font-semibold text-brand-600 group-hover:text-brand-700 transition-colors">
          View <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </span>
      </div>
    </Link>
  )
}
