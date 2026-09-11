/**
 * Reusable Divider primitive component.
 * Supports horizontal and vertical orientations, with optional centered label.
 */
function Divider({
  orientation = 'horizontal',
  label = null,
  className = '',
  ...props
}) {
  if (orientation === 'vertical') {
    return (
      <div
        role="separator"
        aria-orientation="vertical"
        className={`inline-block h-full min-h-[1em] w-[1px] self-stretch bg-slate-200 ${className}`.trim()}
        {...props}
      />
    )
  }

  if (label) {
    return (
      <div
        role="separator"
        aria-orientation="horizontal"
        className={`flex items-center my-4 ${className}`.trim()}
        {...props}
      >
        <div className="flex-grow border-t border-slate-200" />
        <span className="px-3 text-xs font-medium text-slate-400 uppercase tracking-wider select-none">
          {label}
        </span>
        <div className="flex-grow border-t border-slate-200" />
      </div>
    )
  }

  return (
    <hr
      role="separator"
      aria-orientation="horizontal"
      className={`my-4 border-t border-slate-200 ${className}`.trim()}
      {...props}
    />
  )
}

export default Divider
