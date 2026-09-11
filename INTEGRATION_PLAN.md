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

## Phase 3 — Farm service integration ✅

Smallest real surface — good first end-to-end proof once auth works.

- [x] 3.1 **Decision**: add `total_cattle` to the backend `Farm` model (migration `farms.0002_farm_total_cattle`); `milkingCows`/`dailyFodderRequirementKg` stay UI-derived (75%/20kg-per-head) from that one real number rather than becoming separate backend fields
- [x] 3.2 `farmService`: `getMyFarm()` (maps a 404 to `null` — no farm yet is a normal state), `createFarm()`, `updateFarm()` wired to `/api/farms/me/` ([services/farm/farmService.js](frontend/src/services/farm/farmService.js))
- [x] 3.3 `FarmPage` rebuilt off real data — loads the farm on mount, shows a create form when none exists yet, edit form otherwise; herd stats now derive from the real `total_cattle` instead of `DashboardContext`'s local mock state
- [x] 3.4 Verify: scripted flow against the live dev server — `getMyFarm()` → 404/null before creation, `createFarm()` → 201 with `total_cattle` persisted, `getMyFarm()` after creation returns it, `updateFarm()` partial patch preserves other fields. All 4 steps passed. Backend: 15/15 farms tests, full suite unaffected. Frontend: lint/build clean (same 19 pre-existing baseline errors, zero new).

## Phase 4 — Inspection creation + image capture ✅

- [x] 4.1 Added a "basic info" step to `NewInspectionPage` (inspection_type, material_type + material_type_other, storage_duration_days) shown before the camera flow — creates the DRAFT inspection immediately on submit
- [x] 4.2 `inspectionService`: `create()`, `uploadImage()`, `deleteImage()` wired to `POST /api/inspections/`, `POST /api/inspections/{id}/images/`, `DELETE /api/inspections/{id}/images/{image_id}/` ([services/inspection/inspectionService.js](frontend/src/services/inspection/inspectionService.js))
- [x] 4.3 The 4-step camera flow (front/side/macro/storage) now uploads for real on every capture (both the simulated canvas capture and the gallery file picker convert to a `File`/`Blob` and call `uploadImage`), tagged with the matching `image_type` per step
- [x] 4.4 Retake button now calls `deleteImage()` against the real uploaded image id before clearing the local preview
- [x] 4.5 Verify: scripted flow against the live dev server — create → 201 DRAFT, all 4 images uploaded with correct `image_type` per step, retake-delete → 204, image count drops to 3, re-upload → back to 4. All steps passed. Lint/build clean (same 19 pre-existing baseline errors, zero new).

## Phase 5 — Dynamic AI questionnaire ✅

Replaces `InspectionQuestionnairePage`'s fixed 5-question form — the backend generates its own questions from what Gemini sees in the photos.

- [x] 5.1 `inspectionService`: `generateQuestions()`, `submitAnswers()`, `updateContext()` wired to `/questions/`, `/questions/answer/`, `/context/`
- [x] 5.2 `InspectionQuestionnairePage` rebuilt to render whatever questions `followup_qa` returns (dynamic count/content) — reads the real `inspectionId` from `sessionStorage` (set by `NewInspectionPage` in Phase 4), calls the AI endpoint on load, renders one textarea per returned question
- [x] 5.3 Added an "optional context" section: storage condition (GOOD/FAIR/POOR), moisture exposure yes/no, a free-text observation field, and a "use my location" button (`navigator.geolocation`) that feeds real GPS coordinates into `updateContext()` so the backend fetches real weather
- [x] 5.4 Verify: live end-to-end against the real dev server with real API keys — a real Gemini call returned 3 genuinely tailored follow-up questions from the uploaded images (not canned), answers submitted and persisted, and `updateContext` with real coordinates returned real fetched temperature/humidity from OpenWeatherMap. Lint went from 19 → 18 pre-existing baseline errors (fixed one in passing), zero new. Build clean.

## Phase 6 — Analyze + Results (split: Analyze done, Results deferred)

**Deferred on request**: `ResultsPage`/report UI is still being actively designed by the frontend team — 6.3/6.4 (rebuilding that page) are intentionally on hold until it's ready to receive real data, so as not to integrate against a moving target.

- [x] 6.1 Explicit "Analyze" trigger added — at the end of `InspectionQuestionnairePage`'s flow (after answers/context are submitted), a button calls the real endpoint
- [x] 6.2 `inspectionService.analyze()` wired to `POST /api/inspections/{id}/analyze/`
- [ ] 6.3 Rebuild `ResultsPage` off the real `Result` shape (`risk_category`, `risk_score`, `headline`, `action_label`, `summary`, `confidence`, `findings`, `requires_lab_testing`, `recommendations[]`, `comparison`) — **on hold**, page not ready
- [ ] 6.4 Surface `comparison` (the re-inspection advisory) in the UI when present — **on hold**, depends on 6.3
- [x] 6.5 Verify (Analyze only): live end-to-end against the real dev server with a real Gemini call — `analyze()` returns a full `Result` (risk category/score/headline/action/summary/recommendations), and correctly flagged plain-color test images as atypical rather than returning canned output. Duplicate-analyze correctly rejected (400), matching the backend's one-result-per-inspection rule. Until 6.3 lands, `InspectionQuestionnairePage` renders a plain temporary raw-data view of the result after analyzing — explicitly not the final report, just proof the pipeline is fully wired for whenever the real report page is ready to plug in. Lint/build clean, 18 pre-existing baseline errors, zero new.

## Phase 7 — Save flow ✅

- [x] 7.1 Explicit "Save" action added to `InspectionQuestionnairePage`'s temporary result view (after Analyze) — `inspectionService.save()` wired to `POST /api/inspections/{id}/save/`
- [x] 7.2 On save, the returned `batch` id is used to fetch and surface the real `batch_code` (`batchService.getBatch()`, new minimal method — full batch surface still comes in Phase 9); `sessionStorage`'s inspection-id handoff is cleared once saved
- [x] 7.3 Verify: live end-to-end — save flips status DRAFT→SAVED and attaches a batch, the real `batch_code` (`PC-XXXXXXXX`) is fetched and displayed, duplicate save correctly rejected (400). Lint/build clean, 18 pre-existing baseline errors, zero new.

## Phase 8 — History ✅

- [x] 8.1 `historyService`: `listSaved()` wired to `GET /api/inspections/?status=SAVED`, `getResult()` wired to `GET /api/results/{id}/`
- [x] 8.2 `HistoryPage` rebuilt off the real list — filter pills now match `inspection_type` directly (SILAGE/FEED); since the real report page (Phase 6.3) is on hold, clicking a card expands an inline raw summary (risk category/headline/summary) fetched on demand, rather than navigating to the still-mock `ResultsPage`
- [x] 8.3 Verify: live — only the SAVED inspection appears in the list, the DRAFT one is excluded; fetching a result for a not-yet-analyzed SAVED inspection correctly 404s and the UI shows a graceful "no analysis yet" fallback instead of erroring. Lint/build clean, 18 pre-existing baseline errors, zero new.

## Phase 9 — Batches + QR ✅

- [x] 9.1 **Decision**: dropped `BatchesPage`'s manual "+ नया बैच" add-batch form entirely — batches only ever appear after a real inspection is saved against them
- [x] 9.2 `batchService`: `list()`, `getBatch()`, `updateBatch()`, `getTrend()`, `getQrObjectUrl()`, `resolveByCode()` wired to the full `/api/batches/*` surface. QR is fetched as a credentialed blob (`responseType: 'blob'` → `URL.createObjectURL`) rather than a plain `<img src>` — a direct cross-origin `<img>` tag would drop the session cookie under `SameSite=Lax` and 403.
- [x] 9.3 `BatchesPage` rebuilt off real batches — each card shows label/type/material/quantity/batch_code with QR-reveal and trend-reveal toggles; a "resolve by code" form at the top lets a farmer type/scan a `batch_code` and see the batch summary + latest result before re-inspecting
- [x] 9.4 "Re-inspect" wired — `NewInspectionPage` now reads an optional `batchId` query param and passes it through to `create()`'s `batch_id`, both from `BatchesPage`'s per-card "जाँचें" button and the resolve-by-code flow
- [x] 9.5 Batch trend (`is_increasing`, `insight`) surfaced per-batch via a toggle on each card
- [x] 9.6 Verify: live end-to-end — batch appears in `list()` after save, QR endpoint returns a genuine PNG (verified magic bytes + content-type), trend fetch works, `updateBatch()` (quantity) persists, `resolveByCode()` finds the real batch and correctly 404s→null for an unknown code. Lint/build clean, 18 pre-existing baseline errors, zero new. (The re-inspection → comparison end-to-end check is deferred along with Phase 6.3/6.4 — comparison only surfaces through the `Result` shape, which isn't rendered anywhere yet since the report page is on hold.)

## Phase 10 — End-to-end QA pass (partially complete)

- [ ] 10.1 Full manual click-through walkthrough — **not completed**: this session has no working Browser tool (a naming-conflict error blocks it every attempt), so every phase above was instead verified with scripted HTTP calls that exactly mirror each service method's request/response contract, plus lint/build checks. That's real proof the wiring is correct, but it is not the same as clicking through the actual rendered UI. Worth doing manually from your machine before considering the integration done.
- [x] 10.2 Audited every page for leftover mock/`sessionStorage` reads: only `ResultsPage.jsx` still reads stale keys (`pashuchaara_temp_images`/`pashuchaara_temp_type`) — expected and correct, since that page's rebuild (Phase 6.3) is deliberately on hold. `NewInspectionPage` no longer writes those keys at all (writes the real `pashuchaara_inspection_id` instead), so `ResultsPage` is now unambiguously 100% mock with no fake real-looking data leaking in. Every other page (Farm, History, Batches, Questionnaire) reads only from real service calls now.
- [x] 10.3 Cross-user isolation — verified via the existing backend test suite rather than a new check: 13 dedicated cross-owner-denial tests already exist and pass across `accounts`/`farms`/`inspections`/`results`/`batches` (e.g. `test_other_user_cannot_access_batch`, `test_farms_are_isolated_per_owner`, `test_resolve_by_code_denies_other_user`). This is the layer that actually enforces isolation — the frontend has no separate access-control logic, so real backend coverage is the correct place to prove this, not a UI-level re-test. Full suite: **151/151 passing**.

---

## Notes

- Each phase's UI rework stays scoped to wiring real data — no new visual design unless a decision subphase explicitly calls for it.
- Decision subphases block their phase; note the decision and date once made, same convention as the backend plan.
- Endpoint contracts (URLs, field names, response shapes) are fixed by the backend as already built — the frontend adapts to them, not the other way around, unless a decision subphase says otherwise.
