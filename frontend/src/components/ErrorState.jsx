import { AlertCircle, RotateCcw } from 'lucide-react'
import Button from './Button'

/**
 * Reusable ErrorState component.
 * Displays an accessible error screen or section with optional retry action.
 */
function ErrorState({
  icon,
  title = 'Something went wrong',
  description = 'We encountered an issue loading this information. Please try again.',
  onRetry,
  retryText = 'Try Again',
  action,
  className = '',
  ...props
}) {
  return (
    <div
      role="alert"
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`.trim()}
      {...props}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 shadow-xs">
        {icon || <AlertCircle className="w-7 h-7" aria-hidden="true" />}
      </div>

      <h3 className="text-base font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      )}

      {onRetry && !action && (
        <div className="mt-5">
          <Button
            variant="outline"
            onClick={onRetry}
            leftIcon={<RotateCcw className="w-4 h-4" />}
          >
            {retryText}
          </Button>
        </div>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default ErrorState
