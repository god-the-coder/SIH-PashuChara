import Spinner from './Spinner'

/**
 * Reusable IconButton primitive component.
 * Displays an accessible, icon-only button with variant, size, and loading support.
 */
function IconButton({
  icon,
  children,
  'aria-label': ariaLabel,
  variant = 'ghost',
  size = 'md',
  type = 'button',
  isLoading = false,
  disabled = false,
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
    sm: 'h-8 w-8 rounded-lg text-xs',
    md: 'h-10 w-10 rounded-xl text-sm',
    lg: 'h-12 w-12 rounded-xl text-base',
  }

  const spinnerSizes = {
    sm: 'sm',
    md: 'sm',
    lg: 'md',
  }

  const spinnerVariants = {
    primary: 'white',
    secondary: 'neutral',
    outline: 'brand',
    ghost: 'neutral',
    danger: 'white',
  }

  const chosenVariant = variantClasses[variant] || variantClasses.ghost
  const chosenSize = sizeClasses[size] || sizeClasses.md
  const isDisabled = disabled || isLoading
  const content = icon || children

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-label={ariaLabel}
      aria-busy={isLoading}
      className={`${baseClasses} ${chosenVariant} ${chosenSize} ${className}`.trim()}
      {...props}
    >
      {isLoading ? (
        <Spinner
          size={spinnerSizes[size] || 'sm'}
          variant={spinnerVariants[variant] || 'neutral'}
          label={ariaLabel || 'Loading'}
        />
      ) : (
        content
      )}
    </button>
  )
}

export default IconButton
