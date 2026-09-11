/**
 * Reusable Grid layout component.
 * Provides responsive multi-column layouts with sensible breakpoints.
 */
function Grid({
  children,
  cols = 1,
  gap = 'md',
  as: Component = 'div',
  className = '',
  ...props
}) {
  const colClasses = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
    6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
    12: 'grid-cols-12',
  }

  const gapClasses = {
    none: 'gap-0',
    xs: 'gap-1.5',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const chosenCols = colClasses[cols] || colClasses[1]
  const chosenGap = gapClasses[gap] || gapClasses.md

  return (
    <Component
      className={`grid ${chosenCols} ${chosenGap} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Grid
