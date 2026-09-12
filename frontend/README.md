# PashuiChara frontend

React, Vite, Tailwind CSS, ESLint, and React Router power the PashuiChara frontend.

Copy `.env.example` to `.env` and set `VITE_API_BASE_URL` before using API-backed functionality.

For Vercel, set `VITE_API_BASE_URL` to the hosted Django API URL in the project environment variables. The included `vercel.json` keeps React Router routes working on refresh.

```bash
npm run dev
npm run lint
npm run build
```

See [ARCHITECTURE.md](./ARCHITECTURE.md) for module responsibilities, dependency direction, and naming conventions.
