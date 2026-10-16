# GRAZU-AI RBAC & Resource Access Audit (Phase 12G-3)

Date: 11 Oct 2026 · Read-only. No source code changed.

> **Important:** Frontend RBAC is **not a security boundary**. Every rule in `src/lib/demo-roles.tsx`, `src/lib/scope.ts`, and the app shell guard only controls what is *shown*. Any visitor can switch roles, and all data ships to the browser. Every rule below must be enforced again by backend authorization (server-side checks per operation) and database row-level policies.

Legend: PASS / FAIL / PARTIAL / UNVERIFIED. "Demo" = correct as presentation only.

## 1. Role-to-permission matrix

Source: `demo-roles.tsx` `defaultGrants` (L38–42), `criticalPermissions` (L36).

| Permission | superadmin | admin (CS/reviewer) | client | guest |
|---|---|---|---|---|
| platform.settings.manage 🔒 | ✓ | — | — | — |
| users.manage 🔒 | ✓ | — | — | — |
| roles.manage 🔒 | ✓ | — | — | — |
| organizations.manage 🔒 | ✓ | — | — | — |
| usecases.create / read / update | ✓ | ✓ | ✓ | — |
| usecases.review | ✓ | ✓ | — | — |
| endpoints.manage | ✓ | — | ✓ | — |
| redteam.run | ✓ | ✓ | ✓ | — |
| repositories.manage | ✓ | — | ✓ | — |
| security.findings.read | ✓ | ✓ | ✓ | — |
| compliance.read | ✓ | ✓ | ✓ | — |
| compliance.review | ✓ | ✓ | — | — |
| chat.read_own | ✓ | ✓ | ✓ | — |
| chat.read_assigned / takeover / reply_as_cs / close | ✓ | ✓ | — | — |
| analytics.read_own | ✓ | ✓ | ✓ | — |
| analytics.read_national / policy.read | ✓ | ✓ | — | — |

🔒 = locked; toggling refused in `grantActions.toggle` L82. Guest has no role entry; guest capability is implicit (public routes + guest chat).

## 2. Route-to-role matrix

Source: `canAccessDemoRoute` L53–73, `modulePermissions` L44–51, `clientModules` L14–18.

| Route | superadmin | admin | client | guest |
|---|---|---|---|---|
| `/`, `/explore`, `/knowledge/*`, `/signin`, `/signup` | ✓ | ✓ | ✓ | ✓ |
| `/app` | ✓ | ✓ | ✓ | ✓ ⚠ (no guest concept; opens as superadmin) |
| `/app/onboarding`, `/app/organization` | — | — | ✓ | — |
| `/app/use-cases/*`, risk, ethics, red-teaming, devsecops, compliance, assistant, reports, analytics/adoption | ✓ | ✓ | ✓ | ⚠ |
| `/app/reviews` | ✓ | ✓ | — | ⚠ |
| `/app/analytics/geospatial`, `/forecast`, `/app/policy` | ✓ | ✓ | — | ⚠ |
| `/app/support/inbox` | ✓ | ✓ | — | ⚠ |
| `/app/settings` | ✓ | — | — | ⚠ |
| `/admin`, `/admin/*` | ✓ | — | — | ⚠ |

⚠ = default demo role is `superadmin` (`demo-roles.tsx` L97, L103), so an unauthenticated visitor reaching `/app` or `/admin` sees everything.

## 3. Permission-to-action matrix

| Action | Permission | UI check | Store check | Result |
|---|---|---|---|---|
| Change user role / data | users.manage | `/admin/users` route only | none in `adminUserActions.update` | PARTIAL |
| Deactivate user | users.manage | route only | none in `setStatus` | PARTIAL |
| Organization status change | organizations.manage | route only | none in `admin-orgs.ts` | PARTIAL |
| Toggle permission | roles.manage | route only | critical + superadmin column locked (L82) | PASS (demo) |
| Platform configuration | platform.settings.manage | `/app/settings` (placeholder) | n/a | UNVERIFIED (no feature) |
| Endpoint credential edit | endpoints.manage | module gated by `security.findings.read`, not `endpoints.manage` | none | FAIL |
| Repository CRUD | repositories.manage | same as above | none | FAIL |
| Document upload/review | usecases.update / review | `docPermissions` (role-based, not grant-based) | none | PARTIAL |
| CS takeover | chat.takeover | inbox: assigned CS only (inbox L65) | `takeOver` checks status only | PARTIAL |
| CS reply | chat.reply_as_cs | inbox L197 | `csSend` requires HUMAN_ACTIVE + assigned CS (assistant.ts L420) | PASS |
| Close / reopen chat | chat.close | inbox L169–170 | status checks only | PARTIAL |
| Audit log access | (none defined) | `/admin/audit` superadmin route | n/a | PARTIAL — no dedicated `audit.read` permission |

## 4. Resource ownership rules (intended)

| Resource | Owner key | Client rule | Admin rule | Current implementation | Result |
|---|---|---|---|---|---|
| Organization | `UseCase.org` / `OrgProfile.key` (name) | own org only | read all | name string, `demoClientOrg` constant | PARTIAL |
| Product (use case) | `org` | own org | all | lists scoped via `scope.ts`; detail `app.use-cases.$id.tsx` uses unscoped `useUseCases()` | FAIL |
| Proposal document | `productId` → org | own products | review all | `docPermissions` hides manage, `view` computed but product page itself unscoped | PARTIAL |
| Endpoint | `productId` → org | own | read | list scoped; run detail `runs.$id.tsx` L20 unscoped | FAIL |
| Repository / findings | `productId` → org | own | read | list scoped; `repositories.$id.tsx` L27 unscoped | FAIL |
| Compliance assessment | `productId` → org | own | review | `assessments.$id.tsx` L20–21 unscoped | FAIL |
| Risk `?product=` | product | own | all | `app.risk.tsx` L31 unscoped | FAIL |
| Reports / adoption analytics | org | own | all | `app.reports.tsx` L36, `app.analytics.adoption.tsx` L17 unscoped | FAIL |
| Conversation | `participantId` | own | assigned/all CS | `assistant.tsx` L70, L226 filter by `demoParticipant.id` | PASS (demo) |
| User ↔ organization | `AdminUser.org` (name) | — | — | admin org members derived from users; client page uses static `orgMembers` | PARTIAL |

## 5. Findings by audit area

### A. Role definitions
| Check | Result | Evidence |
|---|---|---|
| Roles defined centrally | PARTIAL | `demoRoles` in `demo-roles.tsx`, but `userRoles` in `admin-users.ts` L6 and labels in `admin.permissions.tsx` are separate vocabularies |
| Permission keys consistent | PASS | single `permissionGroups` const, typed `Permission` |
| Duplicate role systems | FAIL | Three unmapped role vocabularies; editing a user's role does not affect the demo session |
| Role vs membership separated | PASS (demo) | role and `org` are separate fields; no role on org records |
| Guest role defined | FAIL | No `guest` in `demoRoles`; guest is implicit |

### B. Navigation
| Check | Result | Evidence |
|---|---|---|
| Sidebar role-aware | PASS | `app-shell.tsx` L19–20 filters by `can(item.path)` |
| Admin menus hidden from client | PASS | `/admin/*` requires superadmin (L58–61) |
| Admin menus hidden from guest | FAIL | Guest defaults to superadmin view on `/app` |
| Role switch updates navigation | PASS | `useSyncExternalStore` role store; `demo-roles.test.ts` |
| Nav reflects edited grants | PASS | `useGrants` consumed in `useDemoRole` L110 |

### C. Direct route access
| Check | Result | Evidence |
|---|---|---|
| Client → `/admin/users` blocked | PASS (demo) | `canAccessDemoRoute` L59 + shell L139 |
| Admin → `/app/settings`, `/admin/*` blocked | PASS (demo) | L71, L59 |
| Guest → private routes blocked | FAIL | No sign-in gate; default role superadmin |
| Access-denied state shown | PASS | `app-shell.tsx` L139–141 "Akses tidak tersedia untuk peran demo ini" |

### D. Resource ownership
| Check | Result | Evidence |
|---|---|---|
| Client changes product URL ID | FAIL | `app.use-cases.$id.tsx` reads unscoped list |
| Documents / endpoints / repos / findings scoped | PARTIAL | lists scoped; detail routes and reports not |
| User–org associations consistent | PARTIAL | name keys; static `orgMembers` vs `admin-users.ts` |

### E. Chat permissions
| Check | Result | Evidence |
|---|---|---|
| Client cannot see other clients' chats | PASS (demo) | `assistant.tsx` L70, L226 |
| Guest cannot see private history | PASS (demo) | guest chat uses own Guest ID session; private history only in `/app` |
| Admin sees permitted CS chats | PARTIAL | inbox shows all conversations to any admin; `chat.read_assigned` not applied per conversation |
| Only assigned CS replies in HUMAN_ACTIVE | PASS | `csSend` guard L420; `handoff.test.ts` |
| Superadmin override of assignment | PARTIAL | reassign with confirmation exists, but available equally to admin; no superadmin-specific override rule |
| Notifications role-scoped | PASS | `visibleNotifications` L252 |

### F. Critical actions
| Action | Result | Reason |
|---|---|---|
| Role changes | PARTIAL | Route-gated, audited; store functions have no permission check; admin could change a user to Superadmin if they reached the action |
| User deactivation | PARTIAL | Audited; no guard against self-deactivation or deactivating the last Superadmin |
| Organization deactivation | PARTIAL | Confirmation + audit; route-gated only |
| Platform configuration | UNVERIFIED | Settings page is a placeholder |
| Security credentials | PASS (demo) | Credentials never stored; only `hasCredential`; write-only placeholder |
| Audit log access | PARTIAL | Superadmin-only by route; no dedicated permission; log is client-mutable memory |

## 6. Identified violations (ordered)

**P0 Critical (backend blockers)**
1. Frontend-only RBAC; role switchable by any visitor; default role is superadmin.
2. No guest actor; unauthenticated visitors can open `/app` and `/admin`.

**P1 High**
3. Detail routes not ownership-scoped: use case, red-team run, repository, compliance assessment, risk `?product=`.
4. Reports and adoption analytics expose all organizations to clients.
5. Endpoint/repository management gated by `security.findings.read` instead of `endpoints.manage` / `repositories.manage` — admin (lacking manage grants) still sees and can use edit controls.
6. Three unmapped role vocabularies; user role edits do not affect access.

**P2 Medium**
7. Admin inbox shows all conversations regardless of `chat.read_assigned`.
8. Store actions (`adminUserActions`, `admin-orgs`, `takeOver`, `close`) have no permission checks.
9. `docPermissions` uses fixed role rules instead of grants.
10. No `audit.read` permission; no last-superadmin / self-demotion guard.

**P3 Low**
11. Organization keys are names, not IDs.
12. Static `orgMembers` duplicates membership data.

## 7. Missing access checks

- Ownership check on every `$id` route and `?product=` param.
- Org filter on reports, adoption analytics, assistant product context (already scoped), notification links.
- Action-level permission checks (`can(permission)`) for edit/delete/review/credential buttons.
- Guest gate for `/app` and `/admin`.
- Superadmin-target protection when editing users.

## 8. Recommended frontend guard structure

```text
DemoRoleProvider (role incl. "guest")
 └─ AppShell
     ├─ Route guard:   canAccessDemoRoute(role, path, grants)   -> access-denied state
     ├─ Resource guard: useOwnedResource(kind, id)               -> not-found / denied state
     │                  (single helper in scope.ts, used by every $id route)
     ├─ Action guard:   useCan(permission)                       -> hide/disable controls
     └─ Data scope:     useScopedUseCases / useScoped<Entity>()  -> lists, reports, analytics
```

Rules: one permission vocabulary mapped from user records; default actor `guest`; deny by default; resource guard returns "not found" rather than revealing existence. These remain UX conveniences only.

## 9. Future backend enforcement requirements

- Identity provider sessions; role stored in a dedicated `user_roles` table, never on profiles or in client storage.
- Security-definer `has_role` / `has_permission` functions used by row-level policies.
- `organization_id` (UUID) on every tenant-owned row; policies restrict clients to memberships.
- Server-side checks on every mutation (user role change, deactivation, org status, grants, credentials, CS takeover/reply/close).
- Atomic CS takeover (compare-and-set on status + handler) and assignment-scoped conversation reads.
- Credentials encrypted, write-only, never returned to browsers.
- Append-only, server-written audit log; read restricted to an `audit.read` permission.
- Guest sessions isolated, short retention, no access to authenticated data.
- Protection against last-superadmin removal and self-escalation.
