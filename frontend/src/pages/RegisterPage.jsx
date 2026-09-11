import { Link } from 'react-router-dom'
import { ROUTES } from '../constants/routes'

function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-xs">
          <span className="text-2xl" role="img" aria-label="user">
            👤
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Create Account
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          Registration placeholder for PashuChara-AI.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm text-center transition-colors"
          >
            Already have an account? Sign In
          </Link>
          <Link
            to={ROUTES.HOME}
            className="w-full py-2.5 px-4 rounded-xl text-slate-500 hover:text-slate-700 font-medium text-sm text-center transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </main>
  )
}

export default RegisterPage
