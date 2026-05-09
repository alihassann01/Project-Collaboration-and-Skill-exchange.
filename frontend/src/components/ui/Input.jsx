import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'

export default function Input({
  label,
  error,
  type = 'text',
  value,
  onChange,
  placeholder,
  name,
  id,
  autoComplete,
  leftIcon: LeftIcon,
  rightIcon: RightIcon,
  className = '',
  ...rest
}) {
  const inputId = id || name
  const isPassword = type === 'password'
  const [showPassword, setShowPassword] = useState(false)

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <div className="relative">
        {LeftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <LeftIcon size={16} />
          </div>
        )}
        <input
          id={inputId}
          name={name}
          type={isPassword && showPassword ? 'text' : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={`
            w-full py-2.5 rounded-xl text-sm bg-slate-50
            border transition-all duration-150
            placeholder:text-slate-400
            focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white
            ${LeftIcon ? 'pl-10' : 'px-3.5'}
            ${(RightIcon || isPassword) ? 'pr-10' : 'pr-3.5'}
            ${error
              ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400'
              : 'border-slate-200 hover:border-slate-300'
            }
            ${className}
          `}
          {...rest}
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(v => !v)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
        {RightIcon && !isPassword && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <RightIcon size={16} />
          </div>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
