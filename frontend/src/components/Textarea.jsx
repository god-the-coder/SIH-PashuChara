import { useId } from 'react'
import Label from './Label'

/**
 * Reusable Textarea component.
 * Supports labels, helper text, error messages, and full accessibility attributes.
 */
function Textarea({
  id: customId,
  label,
  rows = 3,
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

      <textarea
        id={id}
        rows={rows}
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
          w-full rounded-xl border bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400
          transition-colors duration-150 outline-none resize-y
          disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200
          ${
            hasError
              ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
              : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
          }
          ${className}
        `.trim()}
        {...props}
      />

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

export default Textarea
