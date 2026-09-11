/**
 * Reusable Spinner / Loading primitive.
 * Displays an accessible, animated loading indicator with customizable size and color variant.
 */
function Spinner({
  size = 'md',
  variant = 'brand',
  label = 'Loading',
  className = '',
}) {
  const sizeClasses = {
    sm: 'h-4 w-4 border-2',
    md: 'h-5 w-5 border-2',
    lg: 'h-8 w-8 border-[3px]',
    xl: 'h-12 w-12 border-4',
  }

  const variantClasses = {
    brand: 'border-brand-200 border-t-brand-600',
    white: 'border-white/30 border-t-white',
    neutral: 'border-slate-200 border-t-slate-600',
  }

  const chosenSize = sizeClasses[size] || sizeClasses.md
  const chosenVariant = variantClasses[variant] || variantClasses.brand

  return (
    <div
      role="status"
      aria-label={label}
      className={`inline-flex items-center justify-center ${className}`}
    >
      <div
        className={`animate-spin rounded-full ${chosenSize} ${chosenVariant}`}
      />
      <span className="sr-only">{label}</span>
    </div>
  )
}

export default Spinner
