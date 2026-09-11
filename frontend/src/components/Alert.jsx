import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react'

/**
 * Reusable Alert banner component.
 * Displays contextual feedback messages with distinct visual variants.
 */
function Alert({
  variant = 'info',
  title,
  children,
  icon,
  action,
  onClose,
  className = '',
  ...props
}) {
  const variantStyles = {
    info: {
      container: 'bg-sky-50 border-sky-200 text-sky-900',
      iconColor: 'text-sky-600',
      DefaultIcon: Info,
    },
    success: {
      container: 'bg-brand-50 border-brand-200 text-brand-900',
      iconColor: 'text-brand-600',
      DefaultIcon: CheckCircle2,
    },
    warning: {
      container: 'bg-amber-50 border-amber-200 text-amber-900',
      iconColor: 'text-amber-600',
      DefaultIcon: AlertTriangle,
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-900',
      iconColor: 'text-red-600',
      DefaultIcon: AlertCircle,
    },
  }

  const current = variantStyles[variant] || variantStyles.info
  const IconComponent = current.DefaultIcon
  const isUrgent = variant === 'error' || variant === 'warning'

  return (
    <div
      role={isUrgent ? 'alert' : 'status'}
      className={`relative flex gap-3 p-4 rounded-xl border ${current.container} ${className}`.trim()}
      {...props}
    >
      <div className={`shrink-0 mt-0.5 ${current.iconColor}`}>
        {icon || <IconComponent className="w-5 h-5" aria-hidden="true" />}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold tracking-tight mb-0.5">
            {title}
          </h4>
        )}
        {children && (
          <div className="text-sm leading-relaxed opacity-90">{children}</div>
        )}
        {action && <div className="mt-3">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss alert"
          className="shrink-0 -mr-1 -mt-1 p-1 rounded-lg opacity-60 hover:opacity-100 hover:bg-black/5 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current transition-opacity cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Alert
