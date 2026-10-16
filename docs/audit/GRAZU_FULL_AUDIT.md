# GRAZU-AI Full Implementation Audit (Phase 12G-1)

Date: 11 Oct 2026 · Read-only audit of the current codebase. No source changes made.

## 1. Project inventory

| Area | Finding (evidence) |
|---|---|
| Framework | TanStack Start 1.168 + TanStack Router 1.170 file routes, React 19, Vite 8, Tailwind v4 (`package.json`, `src/routes/`) |
| Layouts | `__root.tsx`; `/app` and `/admin` both render `AppShell` wrapped in `DemoRoleProvider` + `ComplianceProvider` (`routes/app.tsx`, `routes/admin.tsx`); public pages use `components/grazu/public-layout.tsx`; auth pages share `auth-page.tsx` |
| Routes | 43 route files: 9 public, 29 `/app/*`, 5 `/admin/*` |
| Shared UI | `components/grazu/*` (app-shell, assistant, floating/guest chat, notification-center, profile-menu, product-selector, forms, documents panel, github-integration, compliance-ui, analytics-ui, placeholder-page) + shadcn `components/ui/*` |
| Demo data | One module per entity in `src/lib/` (`use-cases`, `red-teaming`, `devsecops`, `documents`, `compliance`, `assistant`, `organization`, `admin-users`, `admin-orgs`, `audit`, `adoption`, `policy`, `knowledge`) |
| State management | Module-level `useSyncExternalStore` stores (11) + 2 React contexts (`DemoRoleProvider`, `ComplianceProvider`). No competing library |
| Roles/permissions | `lib/demo-roles.tsx`: 3 roles, 22 permissions, 4 locked critical permissions, `canAccessDemoRoute`, editable grants. Presentation only |
| Chat/CS | `lib/assistant.ts` single store: statuses `AI_ACTIVE`/`HUMAN_ACTIVE`/`CLOSED`, sender-tagged messages, `assignedCsId`, events, notifications, guest IDs |

## 2. Phase completion matrix

Priority: P1 = fix before backend, P2 = should fix, P3 = nice to have.

| Phase | Feature | Status | Route | Source files | Gaps / defects | Prio |
|---|---|---|---|---|---|---|
| 1 | Landing page | COMPLETE | `/` | `routes/index.tsx` | — | — |
| 1 | App shell, sidebar collapse/drawer, MODE DEMO | COMPLETE | `/app` | `app-shell.tsx`, `grazu-navigation.ts` | Mobile drawer UNVERIFIED at runtime this pass | P3 |
| 1 | Dashboard KPIs, latest use cases, activity | COMPLETE | `/app` | `app.index.tsx` | — | — |
| 2 | Registry list + filters | COMPLETE | `/app/use-cases` | `app.use-cases.index.tsx`, `use-cases.ts` | — | — |
| 2 | Registration wizard | COMPLETE | `/app/use-cases/new` | `app.use-cases.new.tsx` | — | — |
| 2 | Product detail tabs | PARTIAL | `/app/use-cases/$id` | `app.use-cases.$id.tsx` | Not role-scoped: client can open other orgs' products by URL | P1 |
| 3 | Risk assessment (simulated) | COMPLETE | `/app/risk` | `app.risk.tsx`, `assessments.ts` | Keyword simulation only; `?product=` of other org not blocked | P2 |
| 4 | Ethics checklist | PARTIAL | `/app/ethics` | `app.ethics.tsx` | Answers held in page state, lost on navigation | P2 |
| 5 | Red teaming endpoints, catalog, simulation, run report | COMPLETE | `/app/red-teaming`, `/runs/$id` | `app.red-teaming.*`, `red-teaming.ts`, `endpoint-form.tsx` | Run detail not role-scoped by URL | P2 |
| 6 | DevSecOps repos, scans, findings, workflow template | COMPLETE | `/app/devsecops`, `/repositories/$id` | `app.devsecops.*`, `devsecops.ts`, `repo-form.tsx` | Repo detail not role-scoped by URL; red-team failures not stored as findings | P2 |
| 7 | Compliance dashboard + editable assessment | COMPLETE | `/app/compliance`, `/assessments/$id` | `compliance.tsx`, `compliance-ui.tsx` | Assessment detail not role-scoped by URL | P2 |
| 7 | Human review queue | COMPLETE | `/app/reviews` | `app.reviews.tsx` | — | — |
| 8 | AI Assistant page + topbar drawer | COMPLETE | `/app/assistant` | `assistant.tsx`, `assistant.ts` | Scripted replies (by design) | — |
| 9 | Adoption analytics | PARTIAL | `/app/analytics/adoption` | `app.analytics.adoption.tsx` | Client role (has access) sees all organizations' data; uses unscoped `useUseCases()` | P1 |
| 9 | Geospatial, forecast | COMPLETE | `/app/analytics/*` | `adoption.ts`, analytics routes | Simulation labelled | — |
| 9 | Policy recommendations | COMPLETE | `/app/policy` | `app.policy.tsx`, `policy.ts` | — | — |
| 9 | Reports + CSV export | PARTIAL | `/app/reports` | `app.reports.tsx` | PDF option shown but only CSV exports; client can report on all orgs' products | P1 |
| 9 | Public explore & knowledge | COMPLETE | `/explore`, `/knowledge/*` | `explore.tsx`, `knowledge.ts` | — | — |
| 10 | Settings | MISSING | `/app/settings` | `app.settings.tsx` | Still `PlaceholderPage` only | P3 |
| 11A | Demo roles + switcher + nav filtering | COMPLETE | all | `demo-roles.tsx`, `app-shell.tsx` | Presentation only | — |
| 11B | Unified AI/CS chat store | COMPLETE | `/app/assistant`, inbox | `assistant.ts` | — | — |
| 11C | CS takeover / release / close | COMPLETE | `/app/support/inbox` | `app.support.inbox.tsx`, `assistant.ts` (closed guard L306, L352) | Covered by `handoff.test.ts`, `operational-journey.test.ts` | — |
| 11D | Floating chat | COMPLETE | `/` | `floating-chat.tsx` | — | — |
| 11E | Guest chat with temporary IDs | COMPLETE | `/` | `guest-chat.tsx`, `assistant.ts` | — | — |
| 11F | Profile dropdown | COMPLETE | shell | `profile-menu.tsx` | — | — |
| 12A | Client onboarding + Organisasi Saya | COMPLETE | `/app/onboarding`, `/app/organization` | `organization.ts`, `org-form.tsx` | Member list is static (`orgMembers`), no add/remove | P3 |
| 12B | Proposal documents | COMPLETE | product detail, wizard | `documents.ts`, `upload-document-dialog.tsx`, `documents-panel.tsx` | Files stay in browser (by design) | — |
| 12C | Endpoint configuration | COMPLETE | `/app/red-teaming` | `endpoint-form.tsx`, `red-teaming.ts` | Structural validation only | — |
| 12C/D | GitHub integration (demo) | COMPLETE | repo detail | `github-integration.tsx` | Template + simulated events only | — |
| 12D | CS management (assign, queue) | PARTIAL | `/app/support/inbox` | `assistant.ts` `demoCs` | CS staff list duplicates `admin-users.ts` (see §5) | P2 |
| 12D | Notifications | COMPLETE | shell | `notification-center.tsx`, `assistant.ts` | Chat events only; no notifications for reviews/scans | P3 |
| 12E | Superadmin dashboard + user management | COMPLETE | `/admin`, `/admin/users` | `admin-users.ts` | Users not linked to demo role switcher | P3 |
| 12E | RBAC matrix | COMPLETE | `/admin/permissions` | `admin.permissions.tsx`, `demo-roles.tsx` | — | — |
| 12E | Organization administration | COMPLETE | `/admin/organizations` | `admin-orgs.ts` | — | — |
| 12E | Audit log | COMPLETE | `/admin/audit` | `audit.ts` | — | — |
| 12F-1/2 | Client and admin journeys | COMPLETE | — | `operational-journey.test.ts`, `lifecycle.test.ts` | — | — |
| 12F-3 | Data integrity + client list scoping | PARTIAL | list pages | `scope.ts`, `data-integrity.test.ts` | Scoping applied to list pages only, not detail/analytics/reports | P1 |
| 12F-4 | Backend readiness docs | COMPLETE | — | `BACKEND_READINESS.md`, `API_CONTRACT_DRAFT.md`, `UI_FEATURE_FREEZE.md` | — | — |

## 3. Verified source-code evidence (highlights)

- Route guard: `app-shell.tsx` L139 renders `<Outlet />` only when `can(path)`; sidebar filtered L19.
- Client filter: `assistant.ts` L90 `accessibleProducts`; used via `scope.ts` in registry, red teaming, DevSecOps, compliance, product selector, forms.
- Unscoped reads by client-accessible pages: `app.analytics.adoption.tsx` L17, `app.reports.tsx` L36, `app.use-cases.$id.tsx` L37.
- Admin dashboard intentionally unscoped (`app.index.tsx` L91, admin-only).
- Compatibility redirect: `app.ai-consultation.tsx` L4 → `/app/assistant`.
- Placeholder: only `app.settings.tsx` uses `PlaceholderPage`.

## 4. Missing / broken features

No BROKEN items: typecheck passes and all tests pass.
- MISSING: Settings page content.
- PARTIAL (data leak in demo): client sees other organizations in Adoption Analytics, Reports, and by direct URL on product/run/repo/assessment detail pages.
- PARTIAL: Reports PDF format selectable but not produced.
- PARTIAL: Ethics answers not persisted across navigation.
- UNVERIFIED: mobile drawer and responsive layouts (not re-run in this pass).

## 5. Duplicate / conflicting implementations

| Item | Finding |
|---|---|
| Chat stores | One (`assistant.ts`). No duplicate |
| Conversation records | Single array in store. No duplicate |
| Role definitions | Two vocabularies: `demoRoles` (`superadmin/admin/client`) and `userRoles` ("Superadmin", "Admin / Customer Service", "Client") in `admin-users.ts`; plus a third label set in `admin.permissions.tsx` L17. Not conflicting, but unmapped |
| CS staff | `demoCs` (`cs-ayulia`, `cs-rina`, …) in `assistant.ts` vs CS users `U-002`/`U-003` in `admin-users.ts`; same people, different IDs |
| Client identity | `demoParticipant` (`client-demo`) in `assistant.ts` vs `U-004` Anisa Putri in `admin-users.ts` vs `organization.ts` account |
| Product fixtures | One (`use-cases.ts`). Compliance assessments derive IDs positionally (`UC-00{i+1}`) |
| Organizations | Keyed by name across 4 modules; `orgTypeByKey` duplicates type info also in `organization.ts` for the client org |
| Navigation | No duplicate entries; "Organisasi" title used in both Utama and Administrasi (different paths) |
| Placeholder pages | `/app/settings` only |
| Deprecated routes | `/app/ai-consultation` (redirect, kept intentionally) |
| Layout routes | `app.use-cases.tsx`, `app.devsecops.tsx`, `app.compliance.tsx`, `app.red-teaming.tsx`, `knowledge.tsx` are Outlet-only layouts (expected) |

## 6. Build results

| Check | Result |
|---|---|
| TypeScript (`tsgo --noEmit`) | Pass, 0 errors |
| Vitest | 16 files, 123 tests passed |
| Preview build log | build OK |
| ESLint | 2,021 errors, all `prettier/prettier` formatting (auto-fixable), e.g. `src/test/use-cases.test.ts`. No logic lint errors reported |

## 7. Prioritized remediation backlog

1. **P1** Apply `useScopedUseCases` to Adoption Analytics and Reports; block other-org IDs on product/run/repository/assessment detail pages for the client role.
2. **P1** Unify identities: map `demoCs` and `demoParticipant` to `admin-users.ts` IDs; one role-label map shared by admin users and permissions.
3. **P2** Persist ethics answers in a store keyed by product ID.
4. **P2** Hide or label the PDF report option until implemented.
5. **P2** Link compliance assessments to products explicitly instead of by index.
6. **P3** Run `eslint --fix` (formatting only) in a dedicated change.
7. **P3** Implement Settings page or mark it as out of scope; add notifications for reviews/scans; editable org members.
8. **P3** Runtime verification of mobile drawer and responsive layouts.
