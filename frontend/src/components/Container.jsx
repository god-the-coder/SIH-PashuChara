/**
 * Reusable Container component.
 * Constrains content width with consistent horizontal padding across screen sizes.
 */
function Container({
  children,
  size = 'lg',
  gutter = true,
  as: Component = 'div',
  className = '',
  ...props
}) {
  const sizeClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    full: 'max-w-full',
  }

  const chosenSize = sizeClasses[size] || sizeClasses.lg
  const gutterClass = gutter ? 'px-4 sm:px-6 lg:px-8' : ''

  return (
    <Component
      className={`mx-auto w-full ${chosenSize} ${gutterClass} ${className}`.trim()}
      {...props}
    >
      {children}
    </Component>
  )
}

export default Container
