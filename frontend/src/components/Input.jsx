import { useState, useId } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import Label from './Label'

/**
 * Reusable Input component.
 * Supports labels, helper text, error messages, prefix/suffix icons,
 * password toggle, and complete accessibility attributes.
 */
function Input({
  id: customId,
  label,
  type = 'text',
  error,
  helperText,
  required = false,
  disabled = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  containerClassName = '',
  ...props
}) {
  const generatedId = useId()
  const id = customId || generatedId
  const errorId = `${id}-error`
  const helperId = `${id}-helper`

  const [showPassword, setShowPassword] = useState(false)
  const isPassword = type === 'password'
  const computedType = isPassword ? (showPassword ? 'text' : 'password') : type

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
        {leftIcon && (
          <div className="absolute left-3.5 flex items-center pointer-events-none text-slate-400">
            {leftIcon}
          </div>
        )}

        <input
          id={id}
          type={computedType}
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
            transition-colors duration-150 outline-none
            disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed disabled:border-slate-200
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon || isPassword ? 'pr-10' : ''}
            ${
              hasError
                ? 'border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-200'
                : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-100'
            }
            ${className}
          `.trim()}
          {...props}
        />

        {isPassword && !disabled && (
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3.5 p-0.5 text-slate-400 hover:text-slate-600 focus:outline-none focus:text-brand-600 cursor-pointer"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        )}

        {!isPassword && rightIcon && (
          <div className="absolute right-3.5 flex items-center pointer-events-none text-slate-400">
            {rightIcon}
          </div>
        )}
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

export default Input
