# Frontend–Backend Integration Plan

Source of truth for integration progress, based on the gap analysis of the pulled frontend (`frontend/src`) against the completed backend (`backend/apps/*`, tracked in [backend/IMPLEMENTATION_PLAN.md](backend/IMPLEMENTATION_PLAN.md)).

Structure: phases run in dependency order — each one unblocks the next. A phase is **not started** until the ones before it are verified. Some phases open with a **Decision** subphase — implementation on that phase pauses until the decision is made in chat.

```
Legend: [x] done, [~] in progress, [ ] not started
```

---

## Phase 1 — CSRF & session wiring (blocks everything else) ✅

Nothing that writes data will work from the browser until this is fixed: `CsrfViewMiddleware` is active but no view issues the `csrftoken` cookie, and `apiClient` has no interceptor to send it back.

- [x] 1.1 Backend: `ensure_csrf_cookie` added to `LoginView.post` and `MeView.get` ([apps/accounts/views.py](backend/apps/accounts/views.py)) — DRF's `SessionAuthentication` only enforces CSRF once a request carries an authenticated session, so issuing the cookie right on login (and refreshing it on the boot-check `/me/` call) covers every subsequent write
- [x] 1.2 Backend: `CSRF_TRUSTED_ORIGINS` added to [settings/base.py](backend/config/settings/base.py) (env-driven, same default origins as `CORS_ALLOWED_ORIGINS`), plus `.env.example` updated
- [x] 1.3 Frontend: `apiClient` request interceptor reads the `csrftoken` cookie and attaches `X-CSRFToken` on unsafe methods ([services/api/client.js](frontend/src/services/api/client.js))
- [x] 1.4 Verify: scripted `requests.Session()` walkthrough against the live dev server proved the exact mechanism the frontend interceptor mirrors — (a) no cookie before login, (b) `csrftoken` cookie issued on login, (c) an authenticated write **without** `X-CSRFToken` is rejected with 403, (d) the same write **with** the header succeeds (201). All four checks passed; full `accounts`/`farms` test suites (23 tests) still pass. A live-browser check of the interceptor itself wasn't possible in this session (no Browser tool available) — worth a quick manual smoke-test from an actual page before relying on it in Phase 2.

## Phase 2 — Auth model decision + integration ✅

- [x] 2.1 **Decision**: phone + password (no OTP). Backend stays as-is; fake OTP/Google/survey screens removed from the frontend.
- [x] 2.2 `authService`: `register()`, `login()`, `logout()`, `me()` wired to `/api/accounts/*` ([services/auth/authService.js](frontend/src/services/auth/authService.js))
- [x] 2.3 `LoginPage`/`AuthModal` rebuilt as real phone+password forms (OTP timers, fake OTP entry, and the fabricated Google sign-in removed since none of it corresponded to real backend capability); `RegisterPage` built out from a stub with a real name/phone/password form
- [x] 2.4 `DashboardContext`: `DEFAULT_USER`/`isLoggedIn: true` replaced with real session state — `me()` runs on app load (`authChecked` flag gates rendering until it resolves), `login`/`register`/`logout` call the real endpoints, nothing auth-related persists to `localStorage` anymore. Fields the backend doesn't track yet (age, location, cattle count, ...) are left neutral instead of fabricated for a real logged-in user.
- [x] 2.5 `ProtectedRoute`: **adjusted from the original plan** — the app already has an intentional guest-browsing affordance (SplashPage/LoginPage's "continue as guest", `isLoggedIn`-aware nav everywhere) that a hard per-route redirect would have broken. Implemented instead as a render-gate in `RootLayout` that holds child routes until the initial `me()` check resolves (avoids a flash of guest UI before a real session loads); actual authorization stays enforced by the backend, and feature phases wiring real API calls should prompt login on a 401 rather than the router blocking wholesale.
- [x] 2.6 Verify: scripted session-flow proof against the live dev server — anonymous `me()` → 403, `register()` → 201, `login()` → 200 with real `full_name`/`phone_number`, a fresh `me()` call (page-refresh equivalent) still returns the same user, `logout()` → 204, `me()` after logout → 403 again. All 6 steps passed. `npm run lint`/`npm run build` both clean (zero new errors vs. the pre-existing 19 baseline lint errors elsewhere in the pulled frontend). A live-browser click-through wasn't available in this session (Browser tool unavailable) — worth a manual smoke test from an actual page.

## Phase 3 — Farm service integration

Smallest real surface — good first end-to-end proof once auth works.

- [ ] 3.1 **Decision**: cattle/herd fields (`totalCattle`, `milkingCows`, `dailyFodderRequirementKg`) shown on `FarmPage` have no backend model (`Farm` is just `farm_name` + `location`). Decide: add a backend field/model for herd data, or drop those UI fields for now.
- [ ] 3.2 `farmService`: `getMyFarm()`, `createFarm()`, `updateFarm()` wired to `/api/farms/me/`
- [ ] 3.3 Rework `FarmPage` to read/write real farm data (and whatever 3.1 decided for herd fields)
- [ ] 3.4 Verify: create farm → edit → reload → persisted values shown

## Phase 4 — Inspection creation + image capture

- [ ] 4.1 Add a "basic info" step (inspection_type, material_type(+other), storage_duration_days) — `NewInspectionPage` currently has no screen collecting these before jumping into the camera flow
- [ ] 4.2 `inspectionService`: `create()`, `uploadImage()` wired to `POST /api/inspections/`, `POST /api/inspections/{id}/images/`
- [ ] 4.3 Wire the existing 4-step camera flow (front/side/macro/storage) to real `image_type` values and actual `uploadImage()` calls instead of `sessionStorage` data URLs
- [ ] 4.4 Add a delete/retake call to `DELETE /api/inspections/{id}/images/{image_id}/` on the existing "🔄 दोबारा" retake button
- [ ] 4.5 Verify: create inspection → upload 4 real images → confirm rows exist via Django admin or `GET /api/inspections/{id}/`

## Phase 5 — Dynamic AI questionnaire

Replaces `InspectionQuestionnairePage`'s fixed 5-question form — the backend generates its own questions from what Gemini sees in the photos.

- [ ] 5.1 `inspectionService`: `generateQuestions()`, `submitAnswers()`, `updateContext()` wired to `/questions/`, `/questions/answer/`, `/context/`
- [ ] 5.2 Rebuild `InspectionQuestionnairePage` to render whatever questions `followup_qa` returns (dynamic count/content), rather than the hardcoded form
- [ ] 5.3 Add farmer-optional context fields (storage_condition, moisture_exposure, farmer_observation, GPS-based weather) somewhere in this flow — currently no UI collects these at all
- [ ] 5.4 Verify: real Gemini call returns questions tailored to an uploaded set of images, answers submit successfully

## Phase 6 — Analyze + Results

- [ ] 6.1 Add an explicit "Analyze" trigger — no current screen calls `POST /api/inspections/{id}/analyze/`
- [ ] 6.2 `inspectionService`/new `resultService`: wire `analyze()` and `GET /api/results/{inspection_id}/`
- [ ] 6.3 Rebuild `ResultsPage` off the real `Result` shape (`risk_category`, `risk_score`, `headline`, `action_label`, `summary`, `confidence`, `findings`, `requires_lab_testing`, `recommendations[]`, `comparison`) — currently 100% mock data, ignores even the `sessionStorage` data it already has
- [ ] 6.4 Surface `comparison` (the re-inspection advisory) in the UI when present
- [ ] 6.5 Verify: full real pipeline — create → images → questions → answers → analyze → results page renders live Gemini output

## Phase 7 — Save flow

- [ ] 7.1 Add an explicit "Save" action (button/screen) — no current UI calls `POST /api/inspections/{id}/save/`
- [ ] 7.2 On save, surface the returned `batch` id/`batch_code` (first appearance of batch identity in the UI)
- [ ] 7.3 Verify: saving attaches/creates a batch, inspection status flips to SAVED

## Phase 8 — History

- [ ] 8.1 `historyService`: wired to `GET /api/inspections/?status=SAVED`
- [ ] 8.2 Rebuild `HistoryPage` off the real list (the existing `silage`/`feed` filter maps directly to `InspectionType`, keep it)
- [ ] 8.3 Verify: only SAVED inspections appear, clicking one opens its real result

## Phase 9 — Batches + QR

- [ ] 9.1 **Decision**: drop `BatchesPage`'s manual "+ नया बैच" add-batch form — batches are backend-auto-created on save, not manually created by farmers. Confirm before removing.
- [ ] 9.2 `batchService`: `list()`, `get()`, `update()`, `getTrend()`, `getQrPng()`, `resolveByCode()` wired to the full `/api/batches/*` surface
- [ ] 9.3 Rebuild `BatchesPage` off real batches; add QR display (post-save) and a scan/enter-code re-inspect entry point
- [ ] 9.4 Wire "re-inspect" to `POST /api/inspections/` with `batch_id`, feeding back into Phase 4's flow
- [ ] 9.5 Surface batch trend (`is_increasing`, `insight`) somewhere on the batch detail view
- [ ] 9.6 Verify: scan/enter a real batch_code → summary with latest result shown → re-inspect → new result includes a comparison against the previous one

## Phase 10 — End-to-end QA pass

- [ ] 10.1 Full manual walkthrough: register → login → create farm → new inspection → questions → analyze → save → history → batch → QR → re-inspect → comparison
- [ ] 10.2 Confirm no page still reads from `sessionStorage`/hardcoded mock data for anything now backed by a real endpoint
- [ ] 10.3 Cross-browser/session check: two different logged-in farmers cannot see each other's farms/inspections/batches from the UI

---

## Notes

- Each phase's UI rework stays scoped to wiring real data — no new visual design unless a decision subphase explicitly calls for it.
- Decision subphases block their phase; note the decision and date once made, same convention as the backend plan.
- Endpoint contracts (URLs, field names, response shapes) are fixed by the backend as already built — the frontend adapts to them, not the other way around, unless a decision subphase says otherwise.
