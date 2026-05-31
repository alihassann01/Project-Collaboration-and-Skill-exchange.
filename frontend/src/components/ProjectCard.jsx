import { Link } from 'react-router-dom'
import { ArrowRight, CalendarDays, Users, Clock, Briefcase } from 'lucide-react'
import { getInitials, chipColorClass, formatBudgetRange, deadlineUrgency, typeLabels, durationLabels } from '../utils/format'
import StatusBadge from './ui/StatusBadge'

const projectImages = [
  'https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=900&q=80',
]

export default function ProjectCard({ project }) {
  const {
    id, title, employer_name, employer_id, skills_required,
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
  const imageSrc = projectImages[Math.abs(Number(id) || title?.length || 0) % projectImages.length]

  return (
    <Link
      to={`/projects/${id}`}
      className="group block market-card"
    >
      <div className="relative h-36 overflow-hidden bg-slate-900">
        <img
          src={imageSrc}
          alt=""
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-transparent" />
        <div className="absolute left-4 right-4 bottom-4 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            {employer_name && (
              <div className="w-10 h-10 rounded-2xl bg-white/95 flex items-center justify-center text-brand-700 text-sm font-bold flex-shrink-0 shadow-sm">
                {getInitials(employer_name)}
              </div>
            )}
            {employer_name && (
              <div className="min-w-0">
                {employer_id ? (
                  <p
                    className="text-sm text-white font-bold truncate hover:text-emerald-200 transition-colors cursor-pointer"
                    onClick={e => { e.preventDefault(); e.stopPropagation(); window.location.href = `/profile/${employer_id}` }}
                  >
                    {employer_name}
                  </p>
                ) : (
                  <p className="text-sm text-white font-bold truncate">{employer_name}</p>
                )}
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/65">Project owner</p>
              </div>
            )}
          </div>
          <StatusBadge status={status} size="xs" />
        </div>
      </div>
      <div className="p-6 flex flex-col gap-4">
        {/* Header: avatar + employer + type */}
        <div className="flex items-center justify-between gap-3">
          <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-slate-400">Experience</div>
          <div className="flex items-center gap-1.5 flex-shrink-0">
            {typeInfo && (
              <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200/70">
                {typeInfo.icon} {typeInfo.label}
              </span>
            )}
          </div>
        </div>

        {/* Title */}
        <h3 className="font-display font-bold text-slate-950 text-lg leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
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
        <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
          {budgetStr && (
            <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
              <Briefcase size={10} /> {budgetStr}
            </span>
          )}
          {durationStr && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/70">
              <Clock size={10} /> {durationStr}
            </span>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
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

        <span className="flex items-center gap-1 text-sm font-bold text-brand-600 group-hover:text-brand-700 transition-colors">
          View <ArrowRight size={13} className="opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
        </span>
      </div>
    </Link>
  )
}
