import Spinner from './Spinner'

const variants = {
  primary:   'bg-brand-600 hover:bg-brand-700 text-white shadow-card shadow-brand-200/60',
  secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  danger:    'bg-red-600 hover:bg-red-700 text-white shadow-card shadow-red-200/60',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  employer:  'bg-employer-600 hover:bg-employer-700 text-white shadow-card shadow-employer-200/60',
  student:   'bg-student-600 hover:bg-student-700 text-white shadow-card shadow-student-200/60',
  success:   'bg-emerald-600 hover:bg-emerald-700 text-white shadow-card shadow-emerald-200/60',
  outline:   'bg-white border-2 border-brand-500 text-brand-600 hover:bg-brand-50 shadow-sm',
}

const sizes = {
  xs: 'px-3 py-1 text-[11px] rounded-full gap-1',
  sm: 'px-4 py-2 text-xs rounded-full',
  md: 'px-5 py-2.5 text-sm rounded-full',
  lg: 'px-6 py-3 text-base rounded-full',
  xl: 'px-8 py-3.5 text-base rounded-full',
}

export default function Button({
  children,
  loading = false,
  variant = 'primary',
  size = 'md',
  type = 'button',
  onClick,
  className = '',
  disabled,
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        font-semibold transition-all duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
        active:scale-[0.97]
        ${variants[variant] || variants.primary}
        ${sizes[size] || sizes.md}
        ${className}
      `}
    >
      {loading && <Spinner size="sm" />}
      {children}
    </button>
  )
}
