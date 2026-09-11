import { useId } from 'react'
import { ChevronDown } from 'lucide-react'
import Label from './Label'

/**
 * Reusable Select dropdown component.
 * Supports options array or children, custom arrow, helper text, and error states.
 */
function Select({
  id: customId,
  label,
  options = [],
  placeholder,
  children,
  error,
  helperText,
  required = false,
  disabled = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  const generatedId = useId()
  const id = customId || generatedId
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : null

  return (
    <div className={`flex flex-col gap-1.5 w-full ${containerClassName}`.trim()}>
      {label && (
        <Label htmlFor={id} required={required} disabled={disabled}>
          {label}
        </Label>
      )}

      <div className="relative flex items-center">
        <select
          id={id}
          disabled={disabled}
          required={required}
          aria-invalid={hasError}
          aria-describedby={
            [
              hasError && errorMessage ? errorId : null,
              helperText ? helperId : null,
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
          className={`
            w-full appearance-none rounded-xl border bg-white px-3.5 py-2.5 pr-10 text-sm text-slate-900
            transition-colors duration-150 outline-none cursor-pointer
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200
            ${
              hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }
            ${className}
          `.trim()}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}

          {options.length > 0
            ? options.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  disabled={opt.disabled}
                >
                  {opt.label}
                </option>
              ))
            : children}
        </select>

        <div className="pointer-events-none absolute right-3.5 flex items-center text-slate-400">
          <ChevronDown className="w-4 h-4" />
        </div>
      </div>

      {hasError && errorMessage && (
        <p id={errorId} role="alert" className="text-xs text-red-600 font-medium">
          {errorMessage}
        </p>
      )}

      {!hasError && helperText && (
        <p id={helperId} className="text-xs text-slate-500">
          {helperText}
        </p>
      )}
    </div>
  )
}

export default Select
