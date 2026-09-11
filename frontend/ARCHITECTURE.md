# Frontend architecture

PashuChara-AI uses a small, layer-oriented React structure. Files are added to a layer only when a concrete need exists; empty folders and placeholder abstractions are intentionally avoided.

## Source structure

```text
src/
  assets/       Static assets imported by application code
  components/   Reusable, presentational UI primitives
  config/       Validated runtime configuration
  constants/    Static, application-wide values such as route paths
  context/      Application-wide React providers and their consumer hooks
  layouts/      Shared root, public, and authenticated page structure
  pages/        Route-level screens that compose UI and feature behaviour
  routes/       Central route tree and route-boundary components
  services/     Shared API client and future endpoint services
  App.jsx       Application composition root
  main.jsx      Browser bootstrap
  index.css     Tailwind import, theme tokens, and global styles
```

The existing `components/index.js` is the public UI barrel. Pages should import reusable UI through it rather than depending on individual component file paths. Components remain independent of API calls, global state, and feature-specific business rules.

## Growth boundaries

Add these directories only when their first real implementation is needed:

- `layouts/` — shared page frames that render route content via `Outlet`; pages use a layout for common chrome, while routes select the layout.
- `services/` — API client configuration and endpoint modules. Pages and hooks call services; UI components never call HTTP directly.
- `hooks/` — reusable React behaviour, including data-fetching orchestration or shared UI state.
- `context/` — React providers and application-wide state only. Transient state stays in the owning page or component.
- `utils/` — framework-independent, side-effect-free helpers.
- `config/` — validated runtime configuration when environment settings become necessary outside a service.

Feature-specific modules should be introduced under `features/<feature-name>/` only after that feature has multiple collaborating files. A feature may own its components, hooks, and service adapter, but should use shared UI from `components/` and shared helpers from `utils/`.

## Dependency direction

```text
routes -> layouts/pages -> feature hooks/services -> API
                    -> components -> assets/constants/utils
context -> pages, layouts, hooks
```

Pages coordinate route concerns and feature behaviour. Layouts provide shared structure. Components render props and emit events only. Hooks coordinate reusable React logic. Services own network communication. Context exposes genuinely global application state. Utilities and constants do not import React, pages, or services.

## Routing

`routes/router.jsx` is the single source of route definitions. `RootLayout` provides the top-level shell. `PublicLayout` owns the responsive, centered main area for `/`, `/login`, `/register`, and the 404 page. The `/app` group is wrapped by `routes/ProtectedRoute.jsx`, then `ApplicationLayout`, which provides the responsive authenticated main content area. `ProtectedRoute` currently renders an `Outlet` without checks, so future authentication and redirect rules have one integration point. A wildcard route renders the 404 page through the public layout.

## API client

`config/env.js` reads and validates `VITE_API_BASE_URL`. `services/api/client.js` exports the sole Axios instance, with a common JSON accept header, a request timeout, and credentialed cross-origin requests for the backend's cookie-based session capability. Successful client requests resolve to `response.data`; rejected requests are converted once, in the response interceptor, to `ApiRequestError` from `services/api/error.js`. Token handling is not present.

## Feature services

Feature API modules live in `services/<feature>/<feature>Service.js`: `auth`, `inspection`, `batches`, `history`, and `farm` are present as intentionally empty contract placeholders. Each module has one default `<feature>Service` export. Once an endpoint contract exists, service methods import `api/client.js` directly, use verbs such as `get`, `list`, `create`, `update`, and `remove`, and return the Axios promise without UI concerns. Pass URL or query values as an explicit `params` object (`apiClient.get(path, { params })`), and pass request bodies as a named `payload` argument (`apiClient.post(path, payload)`). Services do not transform UI state, show notifications, or manage authentication state.

## Request and error handling

Pages and hooks own request state locally using `REQUEST_STATUS` from `constants/requestStatus.js`: begin at `IDLE`, set `LOADING` before awaiting a service call, then set `SUCCESS` or `ERROR` in a `try`/`catch`. Services never swallow rejected requests; their consumers must handle `ApiRequestError` in `catch` blocks. The normalized error retains `status`, `code`, and backend `data`, while `category` consistently identifies validation, authentication-related (401), authorization-related (403), not-found, conflict, rate-limit, server, timeout, network, and unexpected errors. Network and unexpected errors receive safe generic messages rather than raw technical details.

Request-state presentation stays in the page or feature UI: use existing `LoadingState` for `LOADING`, `ErrorState` for `ERROR`, and `SuccessState` where a completed operation needs confirmation. The API and service layers never import or display UI feedback components.

## Application context

`context/AppContext.jsx` exports the root `AppProvider`; `context/useAppContext.js` is the guarded consumer hook. The provider is mounted in `main.jsx` and intentionally exposes an immutable empty value today: no application-wide concern currently requires state. Future session, authenticated-user, or other truly shared application state can be added to this provider without changing its consumers. Feature records, form inputs, filters, modal state, and other transient UI state remain in their feature/page/component owner rather than context. Context does not make API calls; pages or hooks coordinate with services when that is needed.

## Naming conventions

- React components, pages, layouts, and context providers: `PascalCase.jsx` (for example, `FarmSummaryCard.jsx`, `DashboardPage.jsx`).
- Hooks: `use` + `PascalCase` in `camelCase.js`/`.jsx` (for example, `useFarmFilters.js`).
- Services, utilities, constants, and route modules: descriptive `camelCase.js`/`.jsx` (for example, `farmService.js`, `formatCurrency.js`, `router.jsx`).
- Directories: lowercase `kebab-case` when feature names contain multiple words.
- Each component module has one primary default export; named exports are reserved for intentional component families and public barrels.
