import { useId } from 'react'

/**
 * Reusable Radio button component.
 * Features accessible focus states, optional description, and error styling.
 */
function Radio({
  id: customId,
  name,
  value,
  label,
  description,
  error,
  disabled = false,
  required = false,
  className = '',
  containerClassName = '',
  ...props
}) {
  const generatedId = useId()
  const id = customId || generatedId
  const errorId = `${id}-error`
  const descId = `${id}-desc`

  const hasError = Boolean(error)
  const errorMessage = typeof error === 'string' ? error : null

  return (
    <div className={`flex flex-col gap-1 ${containerClassName}`.trim()}>
      <div className="flex items-start gap-2.5">
        <div className="flex items-center h-5">
          <input
            id={id}
            name={name}
            value={value}
            type="radio"
            disabled={disabled}
            required={required}
            aria-invalid={hasError}
            aria-describedby={
              [
                hasError && errorMessage ? errorId : null,
                description ? descId : null,
              ]
                .filter(Boolean)
                .join(' ') || undefined
            }
            className={`
              h-4 w-4 rounded-full border text-brand-600 cursor-pointer
              focus:ring-2 focus:ring-brand-500 focus:ring-offset-1 outline-none
              disabled:cursor-not-allowed disabled:opacity-50
              ${
                hasError
                  ? 'border-red-400 focus:ring-red-400'
                  : 'border-slate-300 hover:border-slate-400 focus:ring-brand-500'
              }
              ${className}
            `.trim()}
            {...props}
          />
        </div>

        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={id}
                className={`text-sm font-medium select-none cursor-pointer ${
                  disabled
                    ? 'text-slate-400 cursor-not-allowed'
                    : 'text-slate-700'
                }`}
              >
                {label}
                {required && (
                  <span className="text-red-500 ml-1" aria-hidden="true">
                    *
                  </span>
                )}
              </label>
            )}

            {description && (
              <p
                id={descId}
                className={`text-xs ${
                  disabled ? 'text-slate-400' : 'text-slate-500'
                }`}
              >
                {description}
              </p>
            )}
          </div>
        )}
      </div>

      {hasError && errorMessage && (
        <p id={errorId} role="alert" className="text-xs text-red-600 font-medium pl-6">
          {errorMessage}
        </p>
      )}
    </div>
  )
}

export default Radio
