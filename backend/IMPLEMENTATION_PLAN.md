# Backend Implementation Plan

Source of truth for phase/subphase progress. Governed by [project_explain.txt](../project_explain.txt) — do not add fields, entities, or endpoints beyond what's confirmed there or explicitly approved in chat.

Structure: **domain-by-domain vertical slices**, in the model order fixed by the spec (`accounts → farms → inspections → batches → results → recommendations`), then frontend integration, then AI integration. Each domain phase moves through the same layer sequence:

```
1. Models        — fields (confirmed only) + migration + admin registration + verification
2. Selectors     — read/query logic
3. Services      — business operations, state changes
4. Serializers   — API input/output validation
5. Permissions   — authorization rules (ownership, auth)
6. Views & URLs  — API endpoints, per finalized API design (never invented)
7. Tests         — unit/integration coverage for the above
```

A subphase is checked off only after verification (Django `check`, migration applied, or a passing test/shell smoke test). Legend: `[x]` done, `[~]` in progress, `[ ]` not started.

---

## Phase 1 — `accounts`

- [x] 1.1 Models — custom `User` (phone-based auth, `full_name`), migration applied, admin registered
- [x] 1.2 Selectors — `get_user_by_id`, `get_user_by_phone_number`
- [x] 1.3 Services — `register_user` (phone + password, uniqueness + Django password validation)
- [x] 1.4 Serializers — `RegisterSerializer` (write), `UserSerializer` (read)
- [x] 1.5 Permissions — `IsSelf` (object-level, farmer can only access own account)
- [x] 1.6 Views & URLs — `register`/`login`/`logout`/`me` at `/api/accounts/`, session auth
- [x] 1.7 Tests — 11 tests covering manager, selectors, service, permission, and API flow

## Phase 2 — `farms`

- [x] 2.1 Models — `Farm` (owner OneToOne, farm_name, location), migration applied, admin registered
- [x] 2.2 Selectors — `get_farm_by_owner`, `get_farm_by_id`
- [x] 2.3 Services — `create_farm` (one-per-farmer enforced), `update_farm`
- [x] 2.4 Serializers — `FarmSerializer`
- [x] 2.5 Permissions — `IsFarmOwner` (object-level)
- [x] 2.6 Views & URLs — `GET/POST/PATCH /api/farms/me/`
- [x] 2.7 Tests — 12 tests covering selectors, service, permission, and API flow

## Phase 3 — `inspections`

- [x] 3.1 Models — `Inspection` (owner, type, material, duration, DRAFT/SAVED status) + `InspectionImage`, migration applied, admin registered
- [x] 3.2 Selectors — `get_inspection_by_id`, `list_inspections_by_owner`, `list_images_by_inspection`
- [x] 3.3 Services — `create_draft_inspection`, `add_inspection_image`, `save_inspection` (DRAFT→SAVED)
- [x] 3.4 Serializers — `InspectionSerializer` (read, nested images), `InspectionImageSerializer`, `CreateInspectionSerializer`
- [x] 3.5 Permissions — `IsInspectionOwner` (object-level)
- [x] 3.6 Views & URLs — list/create, detail, image upload, save at `/api/inspections/`
- [x] 3.7 Tests — 14 tests covering selectors, services, permission, and API flow

## Phase 4 — `batches`

- [x] 4.1 Models — `Batch` (owner, label, inherited type fields, nullable quantity_kg), migration applied, admin registered; added nullable `Inspection.batch` FK (migration `inspections.0002`)
- [x] 4.2 Selectors — `get_batch_by_id`, `list_batches_by_owner`
- [x] 4.3 Services — `create_batch_from_inspection`, `ensure_batch_for_inspection` (idempotent), `update_batch`
- [x] 4.4 Serializers — `BatchSerializer`
- [x] 4.5 Permissions — `IsBatchOwner` (object-level)
- [x] 4.6 Views & URLs — `GET /api/batches/`, `GET/PATCH /api/batches/{id}/`; `InspectionSaveView` auto-creates/attaches batch on save
- [x] 4.7 Tests — 11 tests covering selectors, services, permission, and API flow (incl. auto-create-on-save integration)

## Phase 5 — `results`

- [x] 5.1 Models — `Result` (OneToOne to Inspection, risk_category, summary, confidence, findings JSON, requires_lab_testing), migration applied, admin registered
- [x] 5.2 Selectors — `get_result_by_inspection`
- [x] 5.3 Services — `record_result` (SAVED-only, one result per inspection)
- [x] 5.4 Serializers — `ResultSerializer` (read-only)
- [x] 5.5 Permissions — `IsResultOwner` (via inspection.owner)
- [x] 5.6 Views & URLs — `GET /api/results/{inspection_id}/` (read-only, owner-checked, no public write yet)
- [x] 5.7 Tests — 10 tests covering selectors, services, permission, and API flow

## Phase 6 — `recommendations`

- [x] 6.1 Models — `Recommendation` (result FK, text), migration applied, admin registered
- [x] 6.2 Selectors — `list_recommendations_by_result`
- [x] 6.3 Services — `create_recommendation`
- [x] 6.4 Serializers — `RecommendationSerializer`; nested into `ResultSerializer.recommendations`
- [x] 6.5 Permissions — N/A, access gated through `Result`'s existing ownership check
- [x] 6.6 Views & URLs — N/A, exposed only via nested `ResultSerializer` in `/api/results/{inspection_id}/`
- [x] 6.7 Tests — 5 tests covering selector, service, and nested-in-result API output

## Phase 7 — Frontend integration

Wire the existing empty `frontend/src/services/<feature>/<feature>Service.js` placeholders to the real endpoints built above.

**Owned by another team member** — not tracked here for now. Backend endpoints for `accounts`, `farms`, `inspections`, `batches`, `results` are complete and ready to integrate against.

- [ ] 7.1 `authService`
- [ ] 7.2 `farmService`
- [ ] 7.3 `inspectionService`
- [ ] 7.4 `batchService`
- [ ] 7.5 `historyService`

## Phase 8 — AI integration

Spec finalized against real UI mockups (detailed inspection report + quick result screen) shared by the user — this supersedes the earlier "placeholder pending AI spec" caveat on `results`/`recommendations`.

- [x] 8.1 Model updates for the finalized report shape:
  - `Result`: added `risk_score` (0-100), `headline`, `action_label`
  - `Recommendation`: added `action_type` (GENERAL/SELL_FEED/LAB_TEST/VET_SUPPORT), `urgency` (IMMEDIATE/CORRECTIVE/VERIFICATION)
  - `Inspection`: added `followup_qa` JSONField (AI-generated Q&A, stage 1 of the two-stage analysis)
  - `record_result` no longer requires `SAVED` status — analysis happens while DRAFT, save happens after (matches architecture.txt flow order)
  - Migrations applied; serializers/admin updated; 63/63 tests passing
- [x] 8.2 `backend/ai/` package — Gemini client (`generate_followup_questions`, `analyze_material`), reads `GEMINI_KEY`/`GEMINI_MODEL` from env; verified against the live Gemini API with the user's real key
- [x] 8.3 Django Risk Engine — `classify_risk(findings)`, `default_recommendations_for_category(risk_category)` (deterministic v1 rules); verified LOW/CAUTION/HIGH/UNCERTAIN thresholds and default recommendation sets
- [x] 8.4 Services — `inspections.generate_followup_questions`/`submit_followup_answers`/`read_inspection_images`; `results.analyze_inspection` orchestration (AI → Risk Engine → record_result → default recommendations). Verified full pipeline live against real Gemini API + real DB. Switched default model to stable `gemini-3.5-flash` after `gemini-3.6-flash` proved unreliable (503s under normal load)
- [x] 8.5 Views & URLs — `POST /api/inspections/{id}/questions/`, `POST /api/inspections/{id}/questions/answer/`, `POST /api/inspections/{id}/analyze/`. Full HTTP flow verified live end-to-end (create → image → questions → answer → analyze → result), including one-result-per-inspection and cross-owner rejection
- [x] 8.6 Tests — 27 new tests (risk engine, mocked AI client, mocked service orchestration, mocked view flow); 90/90 total passing, zero real network calls in the suite

## Phase 9 — Extended inspection context, weather, and trend-aware Risk Engine

Farmer-provided + weather data for the "Storage & Environment" / "Farmer Information" report sections, plus feeding batch history into the Risk Engine's actual decision (per the user's Risk Engine input diagram: visual evidence + farmer observations + temperature + humidity + storage duration + storage condition + historical observations → risk score + confidence → action).

- [x] 9.1 Model additions — `Inspection`: `latitude`, `longitude`, `temperature_celsius`, `humidity_percent`, `storage_condition` (GOOD/FAIR/POOR), `moisture_exposure`, `farmer_observation` (all nullable/optional); `InspectionImage`: `image_type` (FRONT_GENERAL/SIDE_DEPTH/MACRO/STORAGE, default FRONT_GENERAL). Migration applied, admin updated, verified.
- [x] 9.2 `backend/weather/` package — `fetch_current_weather(latitude, longitude)` via OpenWeatherMap (`OPENWEATHER_KEY`). Verified live against the real API; fixed an error-message key leak found during testing (requests embeds the API key in its exception text — now redacted)
- [x] 9.3 Services — `update_inspection_context` (farmer fields + weather fetch, failure-tolerant); `add_inspection_image` gains `image_type`; `classify_risk` gains `history` param with one-level trend escalation (capped at HIGH, excluded for UNCERTAIN); `list_results_by_batch` selector; `analyze_inspection` gathers batch history + passes storage_condition/moisture_exposure/farmer_observation/temperature/humidity into the Gemini prompt. Verified live end-to-end across two inspections on the same batch (90/90 existing tests still pass).
- [x] 9.4 Serializers/Views — `PATCH /api/inspections/{id}/context/` (lat/lon-together validation, weather-failure-tolerant); `image_type` on `POST /api/inspections/{id}/images/`. Verified over HTTP, including the real weather fetch working end-to-end after the key was updated.
- [x] 9.5 Tests — 18 new tests (weather client incl. key-leak regression guard, Risk Engine trend escalation, context service/endpoint, image_type); 108/108 total passing, zero real network calls in the suite

## Phase 10 — Batch risk trend (small, follow-up to Phase 8)

- [ ] 10.1 Read endpoint aggregating a batch's saved inspections' results (risk_score + headline, ordered by date) for the "Risk Trend" report section

---

## Notes

- Model field lists are proposed and confirmed with the user per-app before writing code — the spec forbids inventing fields.
- API endpoints (Phase X.6 per domain) require the finalized API design before implementation — the spec forbids inventing endpoints.
- Each subphase stays isolated: no mixing layers, no jumping ahead, per [project_explain.txt § 28](../project_explain.txt).
