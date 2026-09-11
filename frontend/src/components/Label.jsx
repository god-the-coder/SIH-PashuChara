/**
 * Reusable accessible Form Label component.
 */
function Label({
  children,
  htmlFor,
  required = false,
  disabled = false,
  className = '',
  ...props
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block text-sm font-medium select-none ${
        disabled ? 'text-slate-400 cursor-not-allowed' : 'text-slate-700'
      } ${className}`.trim()}
      {...props}
    >
      {children}
      {required && (
        <span className="text-red-500 ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  )
}

export default Label
