/**
 * Reusable Badge primitive component.
 * Displays status tags, counts, and category indicators.
 */
function Badge({
  children,
  variant = 'default',
  size = 'md',
  dot = false,
  icon = null,
  className = '',
  ...props
}) {
  const variantClasses = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-brand-50 text-brand-700 border-brand-200',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    danger: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  }

  const dotColors = {
    default: 'bg-slate-500',
    brand: 'bg-brand-600',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-red-500',
    info: 'bg-sky-500',
  }

  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
  }

  const chosenVariant = variantClasses[variant] || variantClasses.default
  const chosenDotColor = dotColors[variant] || dotColors.default
  const chosenSize = sizeClasses[size] || sizeClasses.md

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${chosenVariant} ${chosenSize} ${className}`.trim()}
      {...props}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${chosenDotColor}`}
          aria-hidden="true"
        />
      )}
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span>{children}</span>
    </span>
  )
}

export default Badge
