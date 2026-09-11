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

- [ ] 2.1 Models
- [ ] 2.2 Selectors
- [ ] 2.3 Services
- [ ] 2.4 Serializers
- [ ] 2.5 Permissions
- [ ] 2.6 Views & URLs
- [ ] 2.7 Tests

## Phase 3 — `inspections`

- [ ] 3.1 Models
- [ ] 3.2 Selectors
- [ ] 3.3 Services
- [ ] 3.4 Serializers
- [ ] 3.5 Permissions
- [ ] 3.6 Views & URLs
- [ ] 3.7 Tests

## Phase 4 — `batches`

- [ ] 4.1 Models
- [ ] 4.2 Selectors
- [ ] 4.3 Services
- [ ] 4.4 Serializers
- [ ] 4.5 Permissions
- [ ] 4.6 Views & URLs
- [ ] 4.7 Tests

## Phase 5 — `results`

- [ ] 5.1 Models
- [ ] 5.2 Selectors
- [ ] 5.3 Services
- [ ] 5.4 Serializers
- [ ] 5.5 Permissions
- [ ] 5.6 Views & URLs
- [ ] 5.7 Tests

## Phase 6 — `recommendations`

- [ ] 6.1 Models
- [ ] 6.2 Selectors
- [ ] 6.3 Services
- [ ] 6.4 Serializers
- [ ] 6.5 Permissions
- [ ] 6.6 Views & URLs
- [ ] 6.7 Tests

## Phase 7 — Frontend integration

Wire the existing empty `frontend/src/services/<feature>/<feature>Service.js` placeholders to the real endpoints built above.

- [ ] 7.1 `authService`
- [ ] 7.2 `farmService`
- [ ] 7.3 `inspectionService`
- [ ] 7.4 `batchService`
- [ ] 7.5 `historyService`

## Phase 8 — AI integration

- [ ] 8.1 `ai/` area scaffolding, decoupled from Django domain layer
- [ ] 8.2 Gemini request/response contract (images + context in, structured findings out)
- [ ] 8.3 Django Risk Engine (structured findings → LOW/CAUTION/HIGH/UNCERTAIN)
- [ ] 8.4 Wire into `results` / `recommendations` services

---

## Notes

- Model field lists are proposed and confirmed with the user per-app before writing code — the spec forbids inventing fields.
- API endpoints (Phase X.6 per domain) require the finalized API design before implementation — the spec forbids inventing endpoints.
- Each subphase stays isolated: no mixing layers, no jumping ahead, per [project_explain.txt § 28](../project_explain.txt).
