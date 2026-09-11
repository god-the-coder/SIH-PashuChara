import { Info, CheckCircle2, AlertTriangle, AlertCircle, X } from 'lucide-react'

/**
 * Reusable Toast presentation component foundation.
 * Used for floating toast notifications. Controlled through props.
 */
function Toast({
  variant = 'info',
  title,
  message,
  children,
  icon,
  action,
  onClose,
  className = '',
  ...props
}) {
  const variantStyles = {
    info: {
      border: 'border-sky-200',
      iconColor: 'text-sky-600',
      bg: 'bg-white',
      DefaultIcon: Info,
    },
    success: {
      border: 'border-brand-200',
      iconColor: 'text-brand-600',
      bg: 'bg-white',
      DefaultIcon: CheckCircle2,
    },
    warning: {
      border: 'border-amber-200',
      iconColor: 'text-amber-600',
      bg: 'bg-white',
      DefaultIcon: AlertTriangle,
    },
    error: {
      border: 'border-red-200',
      iconColor: 'text-red-600',
      bg: 'bg-white',
      DefaultIcon: AlertCircle,
    },
  }

  const current = variantStyles[variant] || variantStyles.info
  const IconComponent = current.DefaultIcon
  const isUrgent = variant === 'error' || variant === 'warning'
  const content = message || children

  return (
    <div
      role={isUrgent ? 'alert' : 'status'}
      aria-live={isUrgent ? 'assertive' : 'polite'}
      className={`
        flex items-start gap-3 p-4 rounded-xl border shadow-lg max-w-sm w-full
        ${current.bg} ${current.border} ${className}
      `.trim()}
      {...props}
    >
      <div className={`shrink-0 mt-0.5 ${current.iconColor}`}>
        {icon || <IconComponent className="w-5 h-5" aria-hidden="true" />}
      </div>

      <div className="flex-1 min-w-0">
        {title && (
          <h4 className="text-sm font-semibold text-slate-900 tracking-tight">
            {title}
          </h4>
        )}
        {content && (
          <p className="text-sm text-slate-600 mt-0.5 leading-relaxed">
            {content}
          </p>
        )}
        {action && <div className="mt-2.5">{action}</div>}
      </div>

      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Close notification"
          className="shrink-0 p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-slate-400 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}

export default Toast
