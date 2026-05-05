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
}) {
  const inputId = id || name
  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-slate-700">
          {label}
        </label>
      )}
      <input
        id={inputId}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`
          w-full px-3.5 py-2.5 rounded-xl text-sm bg-slate-50
          border transition-all duration-150
          placeholder:text-slate-400
          focus:outline-none focus:ring-2 focus:ring-brand-400 focus:border-brand-400 focus:bg-white
          ${error
            ? 'border-red-400 bg-red-50 focus:ring-red-300 focus:border-red-400'
            : 'border-slate-200 hover:border-slate-300'
          }
        `}
      />
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
