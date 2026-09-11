import { FolderOpen } from 'lucide-react'

/**
 * Reusable EmptyState presentation component.
 * Displays a friendly empty state when no data, records, or search results exist.
 */
function EmptyState({
  icon,
  title = 'No records found',
  description = 'There are no items to display at this time.',
  action,
  className = '',
  ...props
}) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`.trim()}
      {...props}
    >
      <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500 shadow-xs">
        {icon || <FolderOpen className="w-7 h-7" aria-hidden="true" />}
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

export default EmptyState
