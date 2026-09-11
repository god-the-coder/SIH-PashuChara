import { Link } from 'react-router-dom'
import { API_BASE_URL } from '../constants/env'
import { ROUTES } from '../constants/routes'

function HomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-100 text-brand-700 shadow-xs">
          <span className="text-2xl" role="img" aria-label="sprout">
            🌾
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          PashuChara-AI
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-slate-600">
          AI-driven animal feed formulation and cattle ration optimization platform.
        </p>

        <div className="mt-6 flex flex-col gap-3">
          <Link
            to={ROUTES.LOGIN}
            className="w-full py-2.5 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-medium text-sm text-center transition-colors shadow-xs"
          >
            Go to Login
          </Link>
          <Link
            to={ROUTES.REGISTER}
            className="w-full py-2.5 px-4 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-medium text-sm text-center transition-colors"
          >
            Go to Register
          </Link>
        </div>

        <div className="mt-6 flex flex-col items-center justify-center gap-2 border-t border-slate-100 pt-6">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-brand-500 animate-pulse" />
            <span className="text-xs font-medium text-slate-500">
              Routing Foundation Ready
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            API: {API_BASE_URL}
          </span>
        </div>
      </div>
    </main>
  )
}

export default HomePage
