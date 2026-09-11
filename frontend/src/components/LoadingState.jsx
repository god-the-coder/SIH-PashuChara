import Spinner from './Spinner'

/**
 * Reusable LoadingState component.
 * Displays a centered loading indicator with customizable title and explanatory text.
 */
function LoadingState({
  title = 'Loading...',
  description,
  size = 'lg',
  className = '',
  ...props
}) {
  return (
    <div
      role="status"
      className={`flex flex-col items-center justify-center p-8 text-center ${className}`.trim()}
      {...props}
    >
      <Spinner size={size} variant="brand" label={title} />

      {title && (
        <h3 className="mt-4 text-sm font-semibold text-slate-900 tracking-tight">
          {title}
        </h3>
      )}

      {description && (
        <p className="mt-1 max-w-xs text-xs text-slate-500 leading-relaxed">
          {description}
        </p>
      )}
    </div>
  )
}

export default LoadingState
