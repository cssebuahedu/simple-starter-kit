# GRAZU-AI Backend Readiness

Status: frontend complete as an in-memory demo. No backend, auth, persistence, LLM, GitHub or scanning integration exists. See `FRONTEND_DATA_MODEL.md` for entities and `API_CONTRACT_DRAFT.md` for proposed operations.

## 1. Route inventory

Access follows `canAccessDemoRoute` in `src/lib/demo-roles.tsx` (presentation only, not enforced).
C = Client, A = Admin/CS, S = Superadmin.

| Route | Module | Access |
|---|---|---|
| `/` | Landing + guest chat | Public |
| `/explore` | Public transparency registry | Public |
| `/knowledge`, `/knowledge/$slug` | Knowledge base | Public |
| `/signin`, `/signup` | Account mockups | Public |
| `/app` | Dashboard (role-specific KPIs) | C A S |
| `/app/onboarding` | Client onboarding wizard | C |
| `/app/organization` | Organisasi Saya | C |
| `/app/use-cases`, `/new`, `/$id` | AI Use Case Registry, wizard, product detail + documents | C A S |
| `/app/risk` | Risk assessment (simulated NLP) | C A S |
| `/app/ethics` | Ethics checklist | C A S |
| `/app/red-teaming`, `/runs/$id` | Endpoints, tests, runs | C A S |
| `/app/devsecops`, `/repositories/$id` | Repositories, scans, findings | C A S |
| `/app/compliance`, `/assessments/$id` | Compliance assessments | C A S |
| `/app/reviews` | Human review queue | A S |
| `/app/analytics/adoption` | Adoption analytics | C A S |
| `/app/analytics/geospatial`, `/forecast` | National analytics | A S |
| `/app/policy` | Policy recommendations | A S |
| `/app/assistant` | GRAZU AI Assistant (+ topbar drawer) | C A S |
| `/app/support/inbox` | CS inbox, assignment, takeover | A S |
| `/app/reports` | Report center + CSV export | C A S |
| `/app/settings` | Platform settings | S |
| `/app/ai-consultation` | Redirect to `/app/assistant` | all |
| `/admin` | Admin dashboard | S |
| `/admin/users`, `/permissions`, `/organizations`, `/audit` | User, RBAC, org verification, audit | S |

Admin/CS and Client access to permission-gated modules can change via `/admin/permissions`.

## 2. Backend capability per module

| Module | Current demo source | Required backend capability |
|---|---|---|
| Auth & RBAC | `demo-roles.tsx`, signin/signup mockups | Identity provider (email + Google), sessions, roles in a separate role table, server-side permission checks per operation |
| Organizations & membership | `organization.ts`, `admin-orgs.ts`, `admin-users.ts` | Org table with UUID (replace name keys), memberships, verification workflow, invitations |
| Use Case Registry | `use-cases.ts` | CRUD with tenant scoping, status workflow, public projection for `/explore` |
| Proposal documents | `documents.ts` (metadata only) | Private object storage, signed URLs, virus scan, versioning, review timeline |
| Risk assessment | `assessments.ts` keyword rules | NLP/LLM classification job, stored results with model version and human override |
| Ethics assessment | page-local checklist | Persisted answers, reviewer sign-off |
| Endpoints & credentials | `red-teaming.ts` | Encrypted credential vault, ownership verification, connectivity test |
| Red teaming | deterministic `simulate()` | Async job queue, sandboxed runner, rate limits, result storage |
| GitHub & DevSecOps | `devsecops.ts`, YAML template | GitHub App install, signed webhooks, scan result ingestion (SARIF), finding lifecycle |
| Compliance & review | `compliance.tsx` provider | Persisted control results, evidence links, reviewer decisions, regulation versions |
| Assistant & CS chat | `assistant.ts` scripted replies | LLM gateway with RAG, realtime channel, CS assignment/takeover with locking |
| Notifications | `assistant.ts` notifications | Persisted per-user notifications, realtime push, optional email |
| Analytics & forecast | `adoption.ts` simulation helpers | Aggregation views/materialized tables, forecasting job |
| Reports | client-side CSV | Server-generated exports (CSV/PDF) respecting tenant scope |
| Audit | `audit.ts` | Append-only audit log written server-side |

## 3. Security requirements

- **Tenant isolation:** every tenant-owned row carries `organization_id`; row-level policies restrict clients to their membership. Today's `useScopedUseCases` filter is UI-only.
- **RBAC:** roles stored in a dedicated table, checked server-side via a security-definer function; never trust client role state. Critical permissions (`platform.settings.manage`, `users.manage`, `roles.manage`, `organizations.manage`) stay superadmin-only.
- **Credential encryption:** endpoint tokens/API keys encrypted at rest, write-only from the UI (UI already shows only `hasCredential`), never returned to browsers.
- **Secret manager:** platform secrets (LLM keys, GitHub App key, webhook secrets) in a managed secret store, read only inside server handlers.
- **Endpoint ownership verification:** DNS TXT or well-known file challenge before any red-team run against a URL.
- **Safe red teaming:** run only against verified endpoints, isolated workers, rate and budget limits, no destructive payloads, timeouts, Production env requires explicit approval.
- **Webhook authentication:** verify GitHub HMAC signatures, reject replays (delivery ID + timestamp), webhook routes verify caller inside handler.
- **CS chat concurrency:** optimistic lock / single active handler per conversation; takeover is an atomic compare-and-set on `status` + `handlerId`; closed conversations reject new messages server-side.
- **Audit trails:** append-only, server-written for admin, permission, org, review, CS, and credential actions.
- **Regulatory document versioning:** immutable regulation versions; assessments reference the version they were evaluated against.
- **Personal data protection (UU PDP):** data minimization, encryption, retention limits for chat and guest sessions, access logging, data subject export/deletion.

## 4. Integration order (suggested)

1. Auth, organizations, memberships, roles.
2. Use case registry + documents storage.
3. Compliance/review persistence and audit log.
4. Assistant LLM + realtime CS chat + notifications.
5. Endpoint vault + red-team job runner.
6. GitHub App + scan ingestion.
7. Analytics aggregates and forecasting.

## 5. Known limitations / unresolved

- Organizations keyed by name; migrate to UUIDs.
- Detail routes reached by direct URL are not role-scoped.
- Red-team findings derived from run results, not stored rows.
- Risk and ethics results computed on the fly.
- All state resets on reload; uploaded files stay in the browser only.
- Role access is presentation-only and switchable by any visitor.
