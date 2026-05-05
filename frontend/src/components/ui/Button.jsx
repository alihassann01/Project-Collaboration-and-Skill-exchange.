import Spinner from './Spinner'

const variants = {
  primary:   'bg-gradient-to-r from-brand-600 to-brand-700 hover:from-brand-700 hover:to-brand-800 text-white shadow-sm shadow-brand-200/60',
  secondary: 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 shadow-sm',
  danger:    'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white shadow-sm shadow-red-200/60',
  ghost:     'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  employer:  'bg-gradient-to-r from-employer-500 to-employer-600 hover:from-employer-600 hover:to-employer-700 text-white shadow-sm shadow-employer-200/60',
  student:   'bg-gradient-to-r from-student-500 to-student-600 hover:from-student-600 hover:to-student-700 text-white shadow-sm shadow-student-200/60',
}

const sizes = {
  sm: 'px-3.5 py-1.5 text-xs rounded-lg',
  md: 'px-5 py-2.5 text-sm rounded-xl',
  lg: 'px-6 py-3 text-base rounded-xl',
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
        font-medium transition-all duration-150
        disabled:opacity-60 disabled:cursor-not-allowed
        focus:outline-none focus:ring-2 focus:ring-brand-400 focus:ring-offset-2
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
