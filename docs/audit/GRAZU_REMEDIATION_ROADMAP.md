# GRAZU-AI Audit Consolidation & Remediation Roadmap (Phase 12G-6)

Date: 11 Oct 2026 · Planning only. No application code changed. Sources (all five present):
`GRAZU_FULL_AUDIT.md` (FA), `GRAZU_PHASE_12B_12E_AUDIT.md` (PA), `GRAZU_RBAC_AUDIT.md` (RA), `GRAZU_DATA_STATE_AUDIT.md` (DA), `GRAZU_USER_FLOW_AUDIT.md` (UA). Findings below are restated only as the source reports verified them; no new testing was performed.

## 1. Priority interpretation

GRAZU-AI is a frontend demo. "Unauthorized demo data exposure" is treated as P0 only where it was confirmed in a browser or is a default-open entry point. No report found real secrets stored (DA: credentials kept as `hasCredential` boolean, no localStorage) or conflicting AI/CS handler state (PA/UA: takeover, stale-reply, and closed guards all PASS).

## 2. Consolidated findings (deduplicated)

| ID | Prio | Finding | Status | Sources |
|---|---|---|---|---|
| F-01 | P0 | No guest actor; default role is Superadmin, so a fresh visitor opens `/app` and `/admin` with full access | FAIL (code, browser repro) | RA §6.1–2, UA §1 |
| F-02 | P0 | Client can open another organization's product by URL (`/app/use-cases/UC-002`) | FAIL (browser) | UA §2, RA §4, FA §2 |
| F-03 | P1 | Other `$id` / param routes unscoped: red-team run, repository, compliance assessment, risk `?product=` | FAIL (code), repo leak likely | RA §4, UA §2, FA §3 |
| F-04 | P1 | Adoption Analytics and Reports show all organizations to clients | FAIL (code) | FA §4, RA §4, UA §2 |
| F-05 | P1 | Compliance/review state resets moving between `/app` and `/admin` (two `ComplianceProvider` instances) | FAIL (code) | DA §4.1, UA §3 |
| F-06 | P1 | Endpoint/repository edit controls gated by `security.findings.read`, not `endpoints.manage` / `repositories.manage` | FAIL (code) | RA §3, §6.5 |
| F-07 | P1 | Identity duplication: three role vocabularies; CS staff (`demoCs`) and client (`client-demo`) have IDs unrelated to `admin-users.ts`; inactive CS still assignable | FAIL/PARTIAL | FA §5, PA 12D/12E, RA §5A, DA §4.7 |
| F-08 | P1 | Client org members are static `orgMembers`, diverging from admin user records | PARTIAL | PA 12E, DA §1, RA §6.12 |
| F-09 | P1 | Deleting endpoint/repository orphans runs/findings | FAIL (code) | DA §4.3 |
| F-10 | P2 | Ethics answers held in page state, lost on navigation | PARTIAL | FA, DA, UA |
| F-11 | P2 | Compliance assessments linked by array position; new products get none | PARTIAL | DA §4.5, FA §7, UA §7 |
| F-12 | P2 | Simulated scans never create findings; compliance evidence reads static list; red-team failures not findings | PARTIAL | DA §4.4, FA §2 |
| F-13 | P2 | Document, endpoint, repository, review, priority changes not audited | FAIL/PARTIAL | PA 12B/12E, DA §5 |
| F-14 | P2 | CS inbox shows all conversations regardless of `chat.read_assigned`; queue not sorted by priority | PARTIAL | RA §6.7, PA 12D |
| F-15 | P2 | Store actions lack permission checks; no last-superadmin / self-demotion guard; no `audit.read` permission | PARTIAL | RA §6.8, §6.10 |
| F-16 | P2 | `docPermissions` uses fixed role rules instead of grants | PARTIAL | RA §6.9 |
| F-17 | P2 | Reports offer PDF but only CSV is produced | PARTIAL | FA §4 |
| F-18 | P2 | Repository "Webhook Events" tab described as report ingestion | PARTIAL | PA 12C |
| F-19 | P2 | User status/role edits have no effect on demo session | FAIL | PA 12E, RA §6.6 |
| F-20 | P3 | `addUseCase` ID uses array length | PARTIAL | DA §4.8 |
| F-21 | P3 | Organizations keyed by name across 4 modules | PARTIAL | DA, RA §6.11 |
| F-22 | P3 | Settings page is still a placeholder | MISSING | FA §4 |
| F-23 | P3 | 2,021 ESLint prettier-formatting errors (auto-fixable) | Style | FA §6 |
| F-24 | P3 | No user delete; extension-only file validation; no review/scan notifications | Minor | PA, FA |
| F-25 | P3 | Browser coverage gaps (see §6) | UNVERIFIED | UA, FA |

## 3. Fix batches (one Lovable prompt each)

### Batch 1 — Guest default & entry gate (F-01) · P0
- Files: `src/lib/demo-roles.tsx`, `src/components/grazu/app-shell.tsx`, `src/routes/signin.tsx`/`auth-page.tsx`, `src/test/demo-roles.test.ts`.
- Issue: initial role `superadmin`; no guest role.
- Expected: add `guest` role (default); `canAccessDemoRoute` denies `/app` and `/admin` for guest; shell shows a "pilih peran demo / masuk" state; sign-in mockup sets a role.
- Acceptance: fresh load of `/admin` and `/app` shows gate, not data; selecting a role restores current behavior; tests updated and passing.
- Risks: existing tests and journey tests assume superadmin default; SSR snapshot uses `"superadmin"` server value — must change consistently to avoid hydration mismatch.
- Dependencies: none. Order: 1.

### Batch 2 — Resource ownership guard (F-02, F-03) · P0/P1
- Files: `src/lib/scope.ts`, `app.use-cases.$id.tsx`, `app.red-teaming.runs.$id.tsx`, `app.devsecops.repositories.$id.tsx`, `app.compliance.assessments.$id.tsx`, `app.risk.tsx`, new test.
- Issue: detail routes read unscoped stores.
- Expected: one `useOwnedResource(kind, id)` helper; non-owned IDs render the same not-found state as missing IDs.
- Acceptance: as client, `/app/use-cases/UC-002` and other-org run/repo/assessment show not-found; risk `?product=` ignores foreign IDs; admin/superadmin unchanged.
- Risks: product-detail related links, assistant product context, notification links.
- Dependencies: none (Batch 1 independent). Order: 2.

### Batch 3 — Scope analytics & reports (F-04, F-17) · P1
- Files: `app.analytics.adoption.tsx`, `app.reports.tsx`, `src/lib/adoption.ts` (if helpers take a list).
- Expected: client sees own org only; PDF option hidden or labeled "segera hadir".
- Acceptance: client CSV contains only own-org rows; totals match own registry.
- Risks: shared derivations used by national pages must keep unscoped input for admin.
- Dependencies: Batch 2 helper optional. Order: 3.

### Batch 4 — Single compliance state (F-05, F-11) · P1/P2
- Files: `src/lib/compliance.tsx`, `src/routes/app.tsx`, `src/routes/admin.tsx`.
- Expected: compliance state as a module store (pattern used elsewhere) or one provider; assessments looked up/created by `productId`.
- Acceptance: review decision survives `/app` → `/admin` → back; newly registered product gets an assessment.
- Risks: `useCompliance` consumers; deterministic seed IDs (CMP-00n) referenced by tests.
- Dependencies: none. Order: 4.

### Batch 5 — Action-level permission guards (F-06, F-16, F-15 partial) · P1
- Files: `demo-roles.tsx` (add `useCan(permission)`), red-teaming and DevSecOps index/detail routes, `endpoint-form.tsx`, `repo-form.tsx`, `documents.ts`/`documents-panel.tsx`, `admin.users.tsx`.
- Expected: edit/delete/credential buttons require the matching grant; docs use grants; last-superadmin and self-demotion blocked.
- Acceptance: admin without `endpoints.manage` sees read-only endpoints; toggling the grant in `/admin/permissions` enables controls.
- Risks: client flows that currently rely on edit buttons.
- Dependencies: Batch 1 (role set). Order: 5.

### Batch 6 — Identity unification (F-07, F-08, F-19) · P1
- Files: `src/lib/admin-users.ts`, `src/lib/assistant.ts` (`demoCs`, `demoParticipant`), `src/lib/organization.ts`, `app.organization.tsx`, `admin.permissions.tsx`, `app.support.inbox.tsx`.
- Expected: CS list and client participant derived from `admin-users.ts` IDs; one role-label map; client members derived from users; inactive users not assignable.
- Acceptance: deactivating U-003 removes them from CS assignment; org member list matches admin org panel.
- Risks: largest batch — chat tests (`handoff`, `lifecycle`, `operational-journey`, `notifications`) reference `cs-*` IDs. Split into 6a (CS) and 6b (members/roles) if needed.
- Dependencies: Batch 1. Order: 6.

### Batch 7 — Delete integrity & findings store (F-09, F-12) · P1/P2
- Files: `src/lib/red-teaming.ts`, `src/lib/devsecops.ts`, `src/lib/compliance.tsx`, `src/test/data-integrity.test.ts`.
- Expected: deletes blocked with message (or cascade) when runs/findings exist; findings become a store; simulated scans append findings shown in evidence.
- Acceptance: integrity test passes after deletes; new scan finding appears in compliance evidence.
- Risks: compliance evidence derivation; repository detail tabs.
- Dependencies: Batch 4. Order: 7.

### Batch 8 — Ethics persistence (F-10) · P2
- Files: new store in `src/lib/` (or extend `assessments.ts`), `app.ethics.tsx`.
- Acceptance: answers per product survive navigation away and back.
- Risks: low. Dependencies: none. Order: 8.

### Batch 9 — Audit coverage (F-13) · P2
- Files: `documents.ts`, `red-teaming.ts`, `devsecops.ts`, `compliance.tsx`, `assistant.ts` (`setPriority`).
- Acceptance: each action produces one `/admin/audit` entry.
- Risks: duplicate entries in tests counting audit length. Dependencies: Batch 4, 7. Order: 9.

### Batch 10 — CS inbox scoping & priority (F-14) · P2
- Files: `app.support.inbox.tsx`, `assistant.ts`.
- Expected: admin without override sees assigned + unassigned only; queue sorted by priority.
- Dependencies: Batch 6. Order: 10.

### Batch 11 — Low-priority polish (F-18, F-20, F-22, F-24) · P3
- Relabel webhook tab; max+1 use case IDs; Settings decision (build minimal or mark out of scope); MIME check. Order: 11.

### Batch 12 — Formatting (F-23) · P3
- `eslint --fix` only, in its own change to keep diffs reviewable. Order: last.

### Batch 13 — Browser verification (F-25) · P3
- Automated Playwright/visual pass for items in §6; no code fixes in the same batch.

## 4. Confirmed completed features
Landing, app shell/sidebar, dashboard, use case registry + wizard, risk (simulated), red teaming (endpoints, catalog, runs), DevSecOps (repos, scans, workflow template), compliance dashboard + editable assessment, review queue, AI Assistant page + drawer, unified AI/CS chat store with takeover/handback/close/reopen guards, floating and guest chat, profile menu, onboarding + Organisasi Saya, proposal documents (validation, 10 MB, review timeline), endpoint configuration with masked credentials, GitHub integration (demo), notifications (chat), admin dashboard, user management, permission matrix with critical locks, organization administration, audit log, geospatial/forecast/policy, public explore and knowledge, backend readiness docs. Typecheck and 123 tests passed at audit time (FA §6).

## 5. Features requiring fixes
Product/run/repo/assessment detail scoping, adoption analytics, reports (scope + PDF), ethics, compliance cross-shell state and product linkage, endpoint/repository management guards, CS management identities and inbox scoping, organization membership, user-role ↔ session link, audit coverage, delete integrity, scan findings, Settings (placeholder).

## 6. Still unverified (browser)
Mobile drawer and responsive layouts; guest → CS round-trip in UI; client full chain (wizard with file, risk, ethics, red-team run, DevSecOps, compliance); repository cross-org leak in browser; CS inbox actions via UI; admin actions producing audit entries in UI; review decision click; unknown `/app/*` path behavior; per-action CS audit (PA 12D).

## 7. Backend readiness blockers
1. Presentation-only RBAC → server roles in a dedicated roles table, `has_role`/permission checks, row-level policies.
2. Name-keyed organizations → UUID `organization_id` on every tenant row plus memberships.
3. Duplicate identities (CS, client, roles) must be merged first (Batch 6).
4. Derived-only data (risk, ethics, findings, evidence) needs stored tables and versioning.
5. Positional compliance IDs cannot migrate (Batch 4).
6. Delete policies (cascade vs restrict) undefined (Batch 7).
7. Browser-only document files need storage and re-upload.
8. CS takeover needs atomic server compare-and-set and realtime.
9. Audit log must be append-only and server-written.
10. Credentials must be encrypted, write-only.

## 8. Recommended next implementation prompt

> Continue GRAZU-AI. Phase 12H-1 — Remediation Batch 1 + 2 (see `docs/audit/GRAZU_REMEDIATION_ROADMAP.md`).
> 1. Add a `guest` demo role as the default. Guests cannot open `/app` or `/admin`; show a gate in the shell with a role picker and link to `/signin`. Keep server and client initial role identical.
> 2. Add one `useOwnedResource(kind, id)` helper in `src/lib/scope.ts` and use it on use case, red-team run, repository, and compliance assessment detail routes and the risk `?product=` param. Non-owned IDs show the existing not-found state.
> 3. Update affected tests and add tests for both. Do not change other modules, data, or styling. No new dependencies.
