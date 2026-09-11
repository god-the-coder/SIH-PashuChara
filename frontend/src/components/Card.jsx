/**
 * Reusable Card primitive and composable subcomponents.
 * Provides consistent containers for content, forms, metrics, and cards.
 */

export function Card({
  children,
  variant = 'default',
  className = '',
  ...props
}) {
  const variantClasses = {
    default: 'border border-slate-200 bg-white shadow-xs',
    elevated: 'border border-slate-100 bg-white shadow-md',
    flat: 'border border-slate-200 bg-slate-50/70',
    brand: 'border border-brand-200 bg-brand-50/30',
  }

  const chosenVariant = variantClasses[variant] || variantClasses.default

  return (
    <div
      className={`rounded-2xl ${chosenVariant} transition-colors ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardHeader({ children, className = '', ...props }) {
  return (
    <div
      className={`flex flex-col space-y-1.5 p-6 pb-4 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardTitle({ children, className = '', ...props }) {
  return (
    <h3
      className={`text-xl font-bold tracking-tight text-slate-900 ${className}`.trim()}
      {...props}
    >
      {children}
    </h3>
  )
}

export function CardDescription({ children, className = '', ...props }) {
  return (
    <p
      className={`text-sm leading-relaxed text-slate-600 ${className}`.trim()}
      {...props}
    >
      {children}
    </p>
  )
}

export function CardContent({ children, className = '', ...props }) {
  return (
    <div className={`p-6 pt-0 ${className}`.trim()} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ children, className = '', ...props }) {
  return (
    <div
      className={`flex items-center p-6 pt-4 border-t border-slate-100 ${className}`.trim()}
      {...props}
    >
      {children}
    </div>
  )
}

export default Card
