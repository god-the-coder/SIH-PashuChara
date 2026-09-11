import { CheckCircle2 } from 'lucide-react'

/**
 * Reusable SuccessState presentation component.
 * Displays positive confirmation when operations complete successfully.
 */
function SuccessState({
  icon,
  title = 'Operation Successful',
  description = 'Your changes have been saved successfully.',
  action,
  className = '',
  ...props
}) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`.trim()}
      {...props}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 shadow-xs">
        {icon || <CheckCircle2 className="w-7 h-7" aria-hidden="true" />}
      </div>

      <h3 className="text-base font-semibold text-slate-900 tracking-tight">
        {title}
      </h3>

      {description && (
        <p className="mt-1.5 max-w-sm text-sm text-slate-500 leading-relaxed">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export default SuccessState
