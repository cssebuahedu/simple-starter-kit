# GRAZU-AI API Contract Draft

Documentation only — no endpoints exist. All routes under `/api/v1`, JSON, authenticated with a bearer session unless marked Public. Tenant scope is derived from the session, never from request bodies. Permissions match `permissionGroups` in `src/lib/demo-roles.tsx`.

## Auth & Users
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| POST | `/auth/signup` | Create account (name, email, password) | Public | Email verification |
| POST | `/auth/signin` | Start session | Public | Google OAuth alternative |
| GET | `/me` | Current user, roles, org, granted permissions | any | Drives sidebar |
| GET | `/admin/users` | List users | `users.manage` | Paginated |
| POST/PATCH | `/admin/users[/:id]` | Create/update role, status | `users.manage` | Audited |
| GET | `/admin/permissions` | Role × permission matrix | `roles.manage` | |
| PUT | `/admin/permissions/:role` | Replace grants | `roles.manage` | Critical permissions immutable |

## Organizations
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| POST | `/organizations` | Onboarding: create org + owner membership | authenticated | Status `Menunggu Verifikasi` |
| GET/PATCH | `/organizations/me` | View/edit own profile | member | |
| GET | `/organizations/me/members` | List members | member | |
| POST | `/organizations/me/invitations` | Invite member | org owner | Email |
| GET | `/admin/organizations` | List with status | `organizations.manage` | |
| POST | `/admin/organizations/:id/status` | Verify / request fix / deactivate + note | `organizations.manage` | Audited |

## Use Cases & Documents
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| GET | `/use-cases` | List (filters: q, sector, risk, status) | `usecases.read` | Client scoped to org |
| POST | `/use-cases` | Register product (wizard payload) | `usecases.create` | Status `Diajukan` |
| GET/PATCH | `/use-cases/:id` | Detail / update | `usecases.read` / `usecases.update` | |
| GET | `/public/use-cases` | Public transparency projection | Public | No personal/sensitive fields |
| POST | `/use-cases/:id/documents/upload-url` | Signed upload URL | `usecases.update` | PDF/DOCX/TXT ≤10 MB |
| POST | `/use-cases/:id/documents` | Register uploaded document metadata | `usecases.update` | Triggers virus scan job |
| GET | `/use-cases/:id/documents` | List with timeline | `usecases.read` | |
| PATCH/DELETE | `/documents/:id` | Edit metadata / delete draft | `usecases.update` | |
| POST | `/documents/:id/status` | Review transition + note | `usecases.review` | Audited |

## Risk & Ethics
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| POST | `/use-cases/:id/risk-assessments` | Start NLP risk classification | `usecases.read` | Async job → `202 {jobId}` |
| GET | `/use-cases/:id/risk-assessments/latest` | Indicators, level, model version | `usecases.read` | |
| PUT | `/use-cases/:id/ethics-assessment` | Save checklist answers | `usecases.update` | |

## Red Teaming
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| GET/POST | `/endpoints` | List / create endpoint config | `endpoints.manage` | Credential write-only |
| PATCH/DELETE | `/endpoints/:id` | Update / remove | `endpoints.manage` | |
| POST | `/endpoints/:id/verify` | Ownership challenge | `endpoints.manage` | DNS/well-known |
| POST | `/endpoints/:id/test-connection` | Structural + live check | `endpoints.manage` | Rate limited |
| GET | `/red-team/tests` | Test catalog | `security.findings.read` | |
| POST | `/red-team/runs` | Start run (endpointId, testIds) | `redteam.run` | Async job; requires verified endpoint |
| GET | `/red-team/runs[/:id]` | Run list / report | `security.findings.read` | Poll or realtime |

## DevSecOps
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| GET/POST | `/repositories` | List / link repo to product | `repositories.manage` | org derived from product |
| PATCH/DELETE | `/repositories/:id` | Update scanners, branch / remove | `repositories.manage` | |
| POST | `/repositories/:id/scans` | Trigger scan | `repositories.manage` | Async via GitHub Actions |
| GET | `/repositories/:id/runs` | Pipeline runs | `security.findings.read` | |
| GET | `/repositories/:id/findings` | Findings | `security.findings.read` | |
| PATCH | `/findings/:id` | Status (Terbuka/Ditinjau/Diperbaiki) | `repositories.manage` | |
| POST | `/public/webhooks/github` | Workflow + SARIF ingestion | HMAC signature | Verify inside handler; idempotent by delivery ID |

## Compliance & Review
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| GET | `/compliance/assessments` | List with summary | `compliance.read` | |
| GET/PATCH | `/compliance/assessments/:id` | Detail / update control status, notes, evidence | `compliance.read` / `compliance.review` | Pins regulation version |
| GET | `/reviews` | Review queue | `usecases.review` | |
| POST | `/reviews/:id/decision` | Approve / request revision / reject | `compliance.review` | Audited |
| GET | `/regulations` | Regulation references + versions | any | |

## Assistant & CS Chat
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| GET/POST | `/conversations` | List own / create (optional productId) | `chat.read_own` | |
| POST | `/public/guest-sessions` | Issue temporary Guest ID | Public | Short TTL, rate limited |
| GET | `/conversations/:id/messages` | History | owner or assigned CS | |
| POST | `/conversations/:id/messages` | Send message | owner / `chat.reply_as_cs` | AI reply streamed when `AI_ACTIVE`; rejected when closed |
| POST | `/conversations/:id/handoff` | Request human CS | owner | Status `WAITING_HUMAN` |
| POST | `/conversations/:id/assign` | Assign CS (no takeover) | `chat.read_assigned` | Audited |
| POST | `/conversations/:id/takeover` | Start human handling | `chat.takeover` | Atomic compare-and-set |
| POST | `/conversations/:id/release` / `/close` | Return to AI / close | `chat.takeover` / `chat.close` | |
| WS | `/realtime/conversations/:id` | Live messages + status | same as read | |

## Notifications, Analytics, Reports, Audit
| Method | Endpoint | Purpose | Permission | Notes |
|---|---|---|---|---|
| GET | `/notifications` | Own notifications | any | Realtime push |
| POST | `/notifications/read` | Mark read | any | |
| GET | `/analytics/adoption` | Own/national adoption | `analytics.read_own` / `analytics.read_national` | Scope by permission |
| GET | `/analytics/geospatial` | Province aggregates | `analytics.read_national` | |
| GET | `/analytics/forecast` | Projection series | `analytics.read_national` | Batch job, labeled simulation |
| GET | `/policy/recommendations` | Policy items | `policy.read` | |
| POST | `/reports` | Generate report (template, filters, format) | module read perms | Async for PDF |
| GET | `/admin/audit` | Audit trail | superadmin | Append-only, filterable |
