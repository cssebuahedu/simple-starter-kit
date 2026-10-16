# GRAZU-AI Data Relationship & State Audit (Phase 12G-4)

Date: 11 Oct 2026 · Read-only. No source code changed. Evidence from current source and `src/test/data-integrity.test.ts` (all suites pass).

## 1. Entity relationship inventory

| Relationship | Link field | Source | Result | Evidence / reason |
|---|---|---|---|---|
| Organization → Users | `AdminUser.org` (name) | `admin-users.ts` | PARTIAL | Name string, not ID; admin org panel derives members from users (`admin.organizations.tsx` L53) |
| Organization → Memberships (client view) | none | `organization.ts` `orgMembers` | FAIL | Static list unrelated to `admin-users.ts`; members can disagree |
| Organization → AI Products | `UseCase.org` = `OrgProfile.key` | `use-cases.ts`, `organization.ts` | PASS | Stable `key`; edits never relink (`updateOrg` keeps key) |
| Organization status | keyed by name | `admin-orgs.ts` L20–27 | PARTIAL | Third place an org is identified by name; `orgTypeByKey` duplicates org type |
| Product → Proposal Documents | `ProposalDoc.productId` | `documents.ts` | PASS | Seeds reference UC-001/002; wizard attaches to new `uc.id` |
| Product → Risk assessment | computed from product text | `assessments.ts`, `app.risk.tsx` L31 | PARTIAL | No stored result; recomputed every render |
| Product → Ethics assessment | none | `app.ethics.tsx` L56–57 `useState` | FAIL | Answers live in page state, lost on navigation; no product link stored |
| Product → Endpoints | `Endpoint.productId` | `red-teaming.ts` | PASS | Required by validation |
| Endpoint → Red Team Runs | `Run.endpointId` | `red-teaming.ts` | PARTIAL | `deleteEndpoint` (L140) leaves runs orphaned |
| Product → Repositories | `Repository.productId`, `org` | `devsecops.ts` `saveRepo` L144 | PASS | Org derived from product |
| Repository → Scans / Findings | `repoId` | `devsecops.ts` L92, L166 | PARTIAL | `deleteRepo` (L152) orphans findings and runs; simulated scans add runs but never findings (`findings` is a static const) |
| Assessment → Product | `Assessment.productId` | `compliance.tsx` L45–46 | PARTIAL | Positional: CMP-00n ↔ UC-00n for first 8 seeds only; new products get no assessment |
| Findings / Runs → Compliance evidence | derived | `compliance.tsx` `useComplianceEvidence` L100–120 | PASS | Live derivation from endpoints/runs/repos; but reads static `findings`, so new scans never appear |
| Red-team failures → Findings | none | — | FAIL | Run failures exist only as evidence rows, not findings |
| User → Conversations | `participantId` | `assistant.ts` L209 | PARTIAL | Uses `client-demo`, not user `U-004` |
| Conversation → Messages | embedded array | `assistant.ts` | PASS | Single store; messages carry sender type/id |
| Conversation → CS assignment | `assignedCsId` | `assistant.ts` L352 | PARTIAL | `demoCs` IDs (`cs-ayulia`…) unrelated to `admin-users.ts` U-002/U-003 |
| Conversation → AI Product | optional `productId` | `assistant.ts` L39, `setProduct` | PASS | Switching sessions restores product context |

## 2. Verification checks

| Check | Result | Evidence |
|---|---|---|
| Stable unique IDs | PARTIAL | `addUseCase` uses `state.length + 1` (`use-cases.ts` L79) — collides if a delete is ever added; endpoints/runs/repos use max+1 (safe); conversations use `Date.now()`/`randomUUID` |
| No orphaned references (seed) | PASS | `data-integrity.test.ts` L15–33 |
| No orphaned references (after edits) | FAIL | Endpoint and repository deletes do not cascade |
| No duplicate sources of truth | FAIL | Org identity ×4 (use-cases, organization, admin-orgs, admin-users); members ×2; CS staff ×2; client user ×3 (`demoParticipant`, U-004, organization account); role vocabularies ×3 |
| Client data scoped | PARTIAL | Lists via `scope.ts`; detail routes, reports, adoption analytics unscoped (see `GRAZU_RBAC_AUDIT.md`) |
| Product selector consistency | PASS | `product-selector.tsx` L5 uses `useScopedUseCases` |
| Shared Assistant / CS Inbox state | PASS | Single `assistant.ts` store for page, drawer, guest chat, inbox |
| Compliance state shared across shells | FAIL | `ComplianceProvider` uses `useState` (L66–68) and is mounted separately in `routes/app.tsx` and `routes/admin.tsx`; moving between `/app` and `/admin` resets review decisions |
| Local updates after forms | PASS | Use case, endpoint, repo, document, user, org stores emit on change |
| Local updates after simulations | PARTIAL | Red-team runs and scan runs update; scans do not produce findings; risk/ethics not stored |
| No real API calls | PASS | Only `fetch` is in `prompt-input.tsx` L83 converting local blob URLs, and `server.ts` request handler |
| No credential persistence | PASS | Endpoints store `hasCredential` boolean only; no `localStorage`/`sessionStorage` use in `src` |

## 3. State ownership by module

| Store | Type | Owns | Survives navigation | Backend migration |
|---|---|---|---|---|
| `use-cases.ts` | module store | products | yes | Required |
| `organization.ts` | module store | client org profile, account, onboarding | yes | Required |
| `admin-orgs.ts` | module store | org status, notes | yes | Required (merge with org table) |
| `admin-users.ts` | module store | users | yes | Required (identity + memberships) |
| `documents.ts` | module store | document metadata, review timeline | yes (object URLs browser-only) | Required + object storage |
| `red-teaming.ts` | module store | endpoints, runs | yes | Required + credential vault + job queue |
| `devsecops.ts` | module store + static `findings` | repos, scan runs | yes | Required + scan ingestion |
| `compliance.tsx` | React `useState` in provider | assessments, reviews, history | **no** across `/app`↔`/admin` | Required |
| `app.ethics.tsx` | page `useState` | answers, notes | **no** | Required |
| `assessments.ts` | pure functions | risk scoring | n/a | Replace with stored results |
| `assistant.ts` | module store | conversations, messages, notifications, CS availability | yes | Required + realtime |
| `audit.ts` | module store | audit events | yes | Required, append-only, server-written |
| `demo-roles.tsx` | module store | role, grants | yes | Replace with server roles |
| `adoption.ts`, `policy.ts`, `knowledge.ts` | derived / static | analytics, policy, articles | n/a | Aggregations / CMS |

All state resets on page reload.

## 4. Identified inconsistencies

1. Compliance state resets when switching between `/app` and `/admin` (two provider instances). — FAIL
2. Ethics answers lost on navigation. — FAIL
3. Deleting an endpoint or repository orphans runs/findings. — FAIL
4. Simulated scans never create findings; compliance evidence reads a static list. — PARTIAL
5. Compliance assessments linked by position; new products have none. — PARTIAL
6. Org identified by name in four modules; members in two. — FAIL
7. Same people with different IDs (CS staff, client user). — FAIL
8. `addUseCase` ID based on array length. — PARTIAL

## 5. Missing relationships

- `organizationId` (stable ID) on users, products, org status.
- Membership entity linking users ↔ organizations (with org role).
- `userId` on conversations and CS staff (`assignedCsId` → user).
- Stored risk and ethics assessment records per product.
- Red-team failures → findings; scans → findings.
- Compliance assessment created per product rather than per seed index.
- Audit entries for document, endpoint, repository, and review changes.

## 6. Recommended minimal fixes (frontend, when approved)

| Prio | Fix |
|---|---|
| P1 | Mount `ComplianceProvider` once above both shells (or convert to a module store) |
| P1 | Derive `orgMembers` from `admin-users.ts`; map `demoCs` and `demoParticipant` to user IDs |
| P1 | Cascade or block deletes of endpoints/repositories with runs/findings |
| P2 | Move ethics answers to a module store keyed by `productId` |
| P2 | Make findings a store; let simulated scans append findings |
| P2 | Look up/create compliance assessment by `productId`, not index |
| P3 | Use max+1 for use case IDs; introduce org IDs alongside name keys |

## 7. Backend migration risks

- **Name-keyed organizations:** renaming breaks links; requires UUID migration and backfill.
- **Duplicate identities:** CS staff, client user, and roles must be merged into one user/membership/role model before data import.
- **Derived-only data:** risk, ethics, red-team findings, and compliance evidence have no stored form; backend must define tables and decide recompute vs. persist (with model/regulation version).
- **Positional assessment IDs:** cannot be migrated as-is.
- **Orphan behavior:** backend needs explicit foreign keys and delete policies (cascade vs. restrict).
- **Browser-only files:** document object URLs cannot migrate; uploads require storage and re-upload.
- **Chat concurrency:** single in-memory store hides race conditions; takeover/reply need atomic server checks and realtime sync.
- **Client-trusted state:** roles, grants, audit log, and org scoping are all mutable in the browser and must be re-implemented server-side.
