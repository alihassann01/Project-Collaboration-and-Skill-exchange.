import { TrendingUp, TrendingDown } from 'lucide-react'

const colorMap = {
  blue:    { bg: 'bg-blue-50',    icon: 'text-blue-600',    bar: 'bg-blue-500',    numClass: 'stats-number'          },
  green:   { bg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500', numClass: 'stats-number-student'  },
  yellow:  { bg: 'bg-yellow-50',  icon: 'text-yellow-600',  bar: 'bg-yellow-500',  numClass: 'stats-number'          },
  purple:  { bg: 'bg-purple-50',  icon: 'text-purple-600',  bar: 'bg-purple-500',  numClass: 'stats-number-employer' },
  red:     { bg: 'bg-red-50',     icon: 'text-red-600',     bar: 'bg-red-500',     numClass: 'stats-number'          },
  gray:    { bg: 'bg-slate-50',   icon: 'text-slate-500',   bar: 'bg-slate-400',   numClass: ''                      },
  amber:   { bg: 'bg-amber-50',   icon: 'text-amber-600',   bar: 'bg-amber-500',   numClass: 'stats-number-admin'    },
  sky:     { bg: 'bg-sky-50',     icon: 'text-sky-600',     bar: 'bg-sky-500',     numClass: 'stats-number'          },
  violet:  { bg: 'bg-violet-50',  icon: 'text-violet-600',  bar: 'bg-violet-500',  numClass: 'stats-number-employer' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600', bar: 'bg-emerald-500', numClass: 'stats-number-student'  },
  indigo:  { bg: 'bg-indigo-50',  icon: 'text-indigo-600',  bar: 'bg-indigo-500',  numClass: 'stats-number-employer' },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue', trend, className = '' }) {
  const c = colorMap[color] || colorMap.blue

  return (
    <div className={`bg-white rounded-2xl shadow-card border border-slate-100 p-5 flex items-center gap-4 card-hover group relative overflow-hidden ${className}`}>
      {/* Subtle top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar} opacity-80`} />

      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg} group-hover:scale-110 transition-transform duration-200`}>
        {Icon && <Icon size={22} className={c.icon} strokeWidth={1.8} />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <div className="flex items-baseline gap-2 mt-0.5">
          <p className={`text-2xl font-display font-bold leading-tight ${c.numClass || 'text-slate-900'}`}>
            {value ?? '—'}
          </p>
          {trend && (
            <span className={`inline-flex items-center gap-0.5 text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
              trend > 0 ? 'text-emerald-700 bg-emerald-50' : 'text-red-600 bg-red-50'
            }`}>
              {trend > 0 ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
