import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 shadow-xs">
          <span className="text-2xl" role="img" aria-label="warning">
            ⚠️
          </span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          404
        </h1>
        <h2 className="mt-1 text-lg font-semibold text-slate-800">
          Page Not Found
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          The page you are looking for does not exist or has been moved.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to={ROUTES.HOME}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm text-center transition-colors shadow-xs"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

export default NotFoundPage
