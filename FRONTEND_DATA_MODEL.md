# GRAZU-AI Frontend Data Model

All data is in-memory demo state (no persistence). Each entity has exactly one authoritative module; other modules link by ID.

## Entities & identifiers

| Entity | Source module | Stable ID | Links to |
|---|---|---|---|
| Organization | `admin-orgs.ts` (status, type) · `organization.ts` (client profile) | org key = name string (e.g. `Kementerian Pelayanan Publik`) | — |
| User | `admin-users.ts` | `U-###` | `org` → Organization key |
| Organization membership | `organization.ts` `orgMembers` (client org) · derived from `AdminUser.org` | email | Organization, User (by email) |
| AI Product (Use Case) | `use-cases.ts` | `UC-###` | `org` → Organization key |
| Proposal Document | `documents.ts` | `DOC-###` | `productId` |
| Risk Assessment | `assessments.ts` (derived, deterministic) | product ID | `UseCase` |
| Ethics Assessment | `app.ethics.tsx` local state (derived per product) | product ID | `UseCase` |
| AI Endpoint | `red-teaming.ts` | `EP-###` | `productId` |
| Red Teaming Run | `red-teaming.ts` | `RUN-###` | `endpointId` |
| Red Teaming Test | `red-teaming.ts` `redTests` | `RT-##` | — |
| GitHub Repository | `devsecops.ts` | `repo-###` | `productId`; `org` is copied from the product on save |
| DevSecOps Scan (pipeline run) | `devsecops.ts` | `run-###` | `repoId` |
| Security Finding | `devsecops.ts` `findings` | `F-####` | `repoId` (red-team failures are derived from `Run.results`) |
| Compliance Assessment / Review | `compliance.tsx` | `CMP-###` / `REV-###` | `productId` / `assessmentId`; evidence by `runId` / `repoId` |
| Chat Conversation | `assistant.ts` | conversation ID | `participantId` (user or Guest ID), optional `productId`, `assignedCsId` |
| Chat Message | `assistant.ts` (nested in conversation) | message ID | sender type + sender ID |
| CS Assignment | `assistant.ts` `assignedCsId` | CS user ID | separate from handler `status` |
| Audit Event | `audit.ts` | event ID | target label |

## Relationships

```text
Organization 1─* User
Organization 1─* UseCase 1─* Document
                         1─* Endpoint 1─* RedTeamRun
                         1─* Repository 1─* PipelineRun
                                        1─* Finding
                         1─1 ComplianceAssessment 1─* Review
Conversation *─1 Participant (User | Guest), *─0..1 UseCase, *─0..1 CS user
```

## Shared UI state ownership

| State | Owner |
|---|---|
| Current demo role & permissions | `demo-roles.tsx` (`useDemoRole`, `useGrants`) |
| Active (client) organization | `organization.ts` (`org.key` = `demoClientOrg`) |
| Active AI product | URL search param `?product=` per module; assistant keeps `productId` in `assistant.ts` |
| Current conversation, handler status, CS assignment, notifications | `assistant.ts` |
| Compliance edits & reviews | `ComplianceProvider` in `compliance.tsx` |
| Client data scope | `useScopedUseCases()` in `scope.ts` (wraps `accessibleProducts`) |

## Integrity rules (covered by `src/test/data-integrity.test.ts`)

- Every product and user references a known organization.
- Endpoints, repositories, documents, assessments and conversation product contexts reference existing products.
- Runs reference existing endpoints/repositories; findings reference existing repositories.
- A repository's organization always follows its linked product.
- Client role lists (registry, red teaming, DevSecOps, compliance, product pickers) only show its own organization.

## Known limitations

- Organizations are keyed by display name, not a numeric ID; the client profile keeps `key` fixed so renames don't relink.
- Memberships for non-client organizations are derived from `AdminUser.org`; there is no membership table.
- Risk and ethics results are computed, not stored records.
- Red-team findings are derived from run results rather than stored as `Finding` rows.
- Detail pages reached by direct URL are not scoped by role (presentation-only access rules).
- All state resets on page reload.
