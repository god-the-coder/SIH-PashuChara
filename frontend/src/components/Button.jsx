import Spinner from './Spinner'

/**
 * Reusable Button primitive component.
 * Supports variants, sizes, loading state, icons, and full accessibility attributes.
 */
function Button({
  children,
  variant = 'primary',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
  fullWidth = false,
  leftIcon = null,
  rightIcon = null,
  className = '',
  ...props
}) {
  const baseClasses =
    'inline-flex items-center justify-center font-medium transition-colors cursor-pointer select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60'

  const variantClasses = {
    primary:
      'bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white shadow-xs focus-visible:ring-brand-500',
    secondary:
      'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 focus-visible:ring-slate-400',
    outline:
      'border border-slate-200 hover:bg-slate-50 active:bg-slate-100 text-slate-700 focus-visible:ring-brand-500',
    ghost:
      'hover:bg-slate-100 active:bg-slate-200 text-slate-700 focus-visible:ring-slate-400',
    danger:
      'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white shadow-xs focus-visible:ring-red-500',
  }

  const sizeClasses = {
    sm: 'text-xs px-3 py-1.5 rounded-lg gap-1.5',
    md: 'text-sm px-4 py-2.5 rounded-xl gap-2',
    lg: 'text-base px-5 py-3 rounded-xl gap-2.5',
  }

  const spinnerVariants = {
    primary: 'white',
    secondary: 'neutral',
    outline: 'brand',
    ghost: 'neutral',
    danger: 'white',
  }

  const spinnerSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
  }

  const chosenVariant = variantClasses[variant] || variantClasses.primary
  const chosenSize = sizeClasses[size] || sizeClasses.md
  const widthClass = fullWidth ? 'w-full' : ''
  const isDisabled = disabled || isLoading

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={`${baseClasses} ${chosenVariant} ${chosenSize} ${widthClass} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <>
          <Spinner
            size={spinnerSizes[size] || 'sm'}
            variant={spinnerVariants[variant] || 'brand'}
            label="Please wait"
          />
          <span>{children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  )
}

export default Button
