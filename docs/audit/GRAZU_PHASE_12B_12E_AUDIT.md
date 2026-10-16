# GRAZU-AI Deep Audit — Phases 12B–12E (Phase 12G-2)

Date: 11 Oct 2026 · Read-only. No application code changed. Evidence from current source; test suite: 16 files / 123 tests pass (`bunx vitest run`). No browser run in this pass, so purely visual behavior is marked UNVERIFIED where logic alone cannot prove it.

## Phase 12B — Proposal Documents

| Requirement | Result | Evidence | Reason |
|---|---|---|---|
| Product document tab | PASS | `routes/app.use-cases.$id.tsx` L83, L98 | "Dokumen Proposal" tab renders `DocumentsPanel product={uc}` |
| File selection & validation | PASS | `upload-document-dialog.tsx` L28, L72; `documents.ts` `validateFile` | Picked file is validated before submit; empty file rejected |
| PDF/DOCX/TXT restriction | PASS | `documents.ts` `acceptedFormats`; dialog `accept=".pdf,.docx,.txt"` | Both input filter and extension check enforced (extension only, no MIME check — acceptable for demo) |
| 10 MB limit | PASS | `documents.ts` `maxFileBytes = 10*1024*1024` | Checked in `validateFile`; covered by `documents.test.ts` |
| Metadata CRUD | PASS | `documentActions.add/update/remove`; panel L73–74 | Edit limited to title/description/category; delete revokes object URL |
| Product ID association | PASS | `ProposalDoc.productId`, `add(productId, …)` | Seeds use valid `UC-00x` IDs |
| Wizard integration | PASS | `app.use-cases.new.tsx` L62, L69, L164 | Attachments held locally, attached to new `uc.id` on submit |
| Review status & reviewer notes | PASS | `documents.ts` `setStatus`, `DocEvent.note`; panel L140 | Five statuses, timeline with optional note; reviewer gated by `docPermissions.review` |
| No fake permanent upload claims | PASS | `demoUploadNotice`; dialog L54 | Copy states files are not sent to the server |
| Document actions audited | FAIL | `documents.ts` has no `logAudit` | Upload/review/delete not in shared audit trail |
| Document access scoping | PARTIAL | `docPermissions` | Presentation-only; product detail itself reachable by URL for other orgs (see 12G-1 P1) |

## Phase 12C — AI & GitHub Integration

| Requirement | Result | Evidence | Reason |
|---|---|---|---|
| Endpoint configuration | PASS | `endpoint-form.tsx`, `red-teaming.ts` `saveEndpoint` | Name, URL, method, env, body, paths, content type |
| Auth type selection | PASS | `endpoint-form.tsx` L102 | None / Bearer Token / API Key Header |
| Masked credentials | PASS | `endpoint-form.tsx` L104–111 | Existing credential shown as `••••••••`; only `hasCredential` boolean stored (L74) |
| Request JSON template | PASS | `bodyTemplate`, `openAiExample` | Template with `{{prompt}}` placeholder |
| Response JSON path | PASS | `validateEndpointConfig` L46 | Regex-validated path |
| Local configuration validation | PASS | `validateEndpointConfig`; form L137 | States "Konektivitas endpoint belum diuji" |
| Endpoint-to-product relationship | PASS | `Endpoint.productId`, validation L41 | Product required |
| Repository configuration | PASS | `devsecops.ts` `saveRepo` L142–148 | Org derived from product, preventing mismatch |
| Scanner category selection | PASS | `scanners`, `toggleScanner` L156 | Configuration status requires ≥1 scanner |
| GitHub Actions template | PASS | `github-integration.tsx` L7–9 | Generated from repo scanners; explicitly non-functional |
| Webhook vs scan ingestion separated | PARTIAL | `github-integration.tsx` L70–76 vs `repositories.$id.tsx` L70, L162 | Integration panel separates them, but the repo "Webhook Events" tab describes itself as "penerimaan laporan" — conflates the concepts |
| No real credential storage / API calls | PASS | `rg "fetch("` in lib/components: none | Credential string stays in component state only |

## Phase 12D — Customer Service

| Requirement | Result | Evidence | Reason |
|---|---|---|---|
| Shared chat state | PASS | `assistant.ts` single store, `useAssistant` | Page, drawer, guest chat, inbox read the same state |
| Client & guest sessions | PASS | `assistant.ts` L306–316, `guestRespond` | Temporary Guest IDs, `guest-chat.test.ts` |
| CS inbox & assignments | PASS | `assign` L352–357; inbox L56–78 | Filters, reassign confirmation; assignment does not start handling |
| CS availability | PASS | `setAvailability` L347; `assign` L353 | Non-"Tersedia" CS cannot be assigned |
| Conversation priority | PARTIAL | `setPriority` L363 | Settable, but no evidence the queue sorts by priority; change not audited |
| AI→human takeover | PASS | `takeOver` L390–401 | Only from `AI_ACTIVE`; clears pending; system notice + event |
| AI suspended during CS | PASS | `send` L322 | Returns before AI reply when `HUMAN_ACTIVE` |
| Human→AI handback | PASS | L404–413 | Only the assigned CS can hand back |
| Close/reopen lifecycle | PASS | `close` L364–374, `reopen` L377–386; closed guard L306 | Reopen never triggers AI reply |
| Role-aware notifications | PASS | `visibleNotifications` L252–254 | Clients see none; `targetCsId` scoping |
| No duplicate messages | PASS | `pending` guard L306; `handoff.test.ts` | Second send blocked while pending |
| No stale AI reply after takeover | PASS | `generation` check L328 | Timer drops reply if status/generation changed |
| CS identity consistency | PARTIAL | `demoCs` vs `admin-users.ts` U-002/U-003 | Same staff, different IDs; Rizky (Nonaktif) not reflected in CS list |
| CS actions audited | UNVERIFIED | `assistant.ts` imports `logAudit` | Not traced per action in this pass |

## Phase 12E — Administration

| Requirement | Result | Evidence | Reason |
|---|---|---|---|
| Superadmin dashboard | PASS | `routes/admin.index.tsx`; `canAccessDemoRoute` L58–61 | Superadmin only |
| User management CRUD | PARTIAL | `adminUserActions` add/update/setStatus | No delete action (deactivate only); acceptable but not full CRUD |
| Account statuses | PASS | `userStatuses` (Aktif/Nonaktif/Menunggu Verifikasi) | Changes audited L49 |
| Role & permission matrix | PASS | `demo-roles.tsx` `permissionGroups`, `grantActions` | Toggle + reset, both audited |
| Critical permissions superadmin-only | PASS | `grantActions.toggle` L82; `criticalPermissions` | Superadmin column and critical rows not editable; `permissions.test.ts` |
| Organization administration | PASS | `admin-orgs.ts` `orgStatuses`, notes; audited | Confirmed status actions |
| Organization membership | PARTIAL | `admin.organizations.tsx` L53 vs `app.organization.tsx` L58 | Admin derives members from users; client page uses static `orgMembers` — two sources can diverge |
| Audit events | PARTIAL | `logAudit` in users, orgs, permissions, assistant | Documents, reviews, endpoints, repos not audited |
| Restricted admin routes | PASS (demo) | `canAccessDemoRoute` L58; `app-shell.tsx` Outlet guard | Presentation-only: role is switchable by any visitor (by design) |
| Users ↔ role switcher | FAIL | `demoRoles` vs `userRoles` | Status changes (e.g. deactivating Anisa) have no effect on the client demo session |

## Remediation list

**P0 Critical** — none for a demo. Before any backend: replace presentation-only roles with server-side authorization (all access checks today are UI-only).

**P1 High**
1. Scope product, run, repository, and assessment detail routes so clients cannot open other organizations' records by URL (affects document tab).
2. Unify client membership: `app.organization.tsx` should derive members from `admin-users.ts`.
3. Map `demoCs` to `admin-users.ts` IDs; inactive users must not be assignable.

**P2 Medium**
4. Append document upload/review/delete, endpoint, and repository changes to `audit.ts`.
5. Relabel repository "Webhook Events" tab to keep webhook events distinct from scan-report ingestion.
6. Sort or filter the CS queue by priority; audit priority changes.
7. Link user status/role to the demo role session (deactivated user cannot act).

**P3 Low**
8. Add user delete (or document deactivate-only as intended).
9. Add MIME-type check alongside extension validation.
10. Run a browser pass for mobile layouts of inbox, document dialog, and permission matrix.
