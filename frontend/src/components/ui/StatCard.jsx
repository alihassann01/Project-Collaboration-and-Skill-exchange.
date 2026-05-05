const colorMap = {
  blue:   { bg: 'bg-blue-50',   icon: 'text-blue-600',   bar: 'bg-blue-500'   },
  green:  { bg: 'bg-green-50',  icon: 'text-green-600',  bar: 'bg-green-500'  },
  yellow: { bg: 'bg-yellow-50', icon: 'text-yellow-600', bar: 'bg-yellow-500' },
  purple: { bg: 'bg-purple-50', icon: 'text-purple-600', bar: 'bg-purple-500' },
  red:    { bg: 'bg-red-50',    icon: 'text-red-600',    bar: 'bg-red-500'    },
  gray:   { bg: 'bg-slate-50',  icon: 'text-slate-500',  bar: 'bg-slate-400'  },
  amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600',  bar: 'bg-amber-500'  },
  sky:    { bg: 'bg-sky-50',    icon: 'text-sky-600',    bar: 'bg-sky-500'    },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600', bar: 'bg-violet-500' },
}

export default function StatCard({ title, value, icon: Icon, color = 'blue' }) {
  const c = colorMap[color] || colorMap.blue

  return (
    <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-5 flex items-center gap-4 hover:shadow-card-hover transition-all duration-200 group relative overflow-hidden">
      {/* Subtle top gradient bar */}
      <div className={`absolute top-0 left-0 right-0 h-0.5 ${c.bar}`} />
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${c.bg} group-hover:scale-105 transition-transform`}>
        {Icon && <Icon size={22} className={c.icon} />}
      </div>
      <div>
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-display font-700 text-slate-900 leading-tight mt-0.5">{value ?? '—'}</p>
      </div>
    </div>
  )
}
