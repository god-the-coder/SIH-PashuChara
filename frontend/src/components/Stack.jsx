/**
 * Reusable Stack layout component.
 * Provides flexible vertical and horizontal flex layouts with consistent spacing.
 */
function Stack({
  children,
  direction = 'col',
  spacing = 'md',
  align = 'stretch',
  justify = 'start',
  wrap = false,
  as: Component = 'div',
  className = '',
  ...props
}) {
  const directionClasses = {
    col: 'flex flex-col',
    row: 'flex flex-row',
    responsive: 'flex flex-col sm:flex-row',
  }

  const spacingClasses = {
    none: 'gap-0',
    xs: 'gap-1.5',
    sm: 'gap-3',
    md: 'gap-4',
    lg: 'gap-6',
    xl: 'gap-8',
  }

  const alignClasses = {
    start: 'items-start',
    center: 'items-center',
    end: 'items-end',
    stretch: 'items-stretch',
    baseline: 'items-baseline',
  }

  const justifyClasses = {
    start: 'justify-start',
    center: 'justify-center',
    end: 'justify-end',
    between: 'justify-between',
    around: 'justify-around',
  }

  const chosenDirection = directionClasses[direction] || directionClasses.col
  const chosenSpacing = spacingClasses[spacing] || spacingClasses.md
  const chosenAlign = alignClasses[align] || alignClasses.stretch
  const chosenJustify = justifyClasses[justify] || justifyClasses.start
  const wrapClass = wrap ? 'flex-wrap' : 'flex-nowrap'

  return (
    <Component
      className={`${chosenDirection} ${chosenSpacing} ${chosenAlign} ${chosenJustify} ${wrapClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Stack
