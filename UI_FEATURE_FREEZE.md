# GRAZU-AI UI Feature Freeze

Effective Phase 12F-4. The frontend demo is feature-complete; further work is backend integration.

## Frozen (do not redesign)
- All routes listed in `BACKEND_READINESS.md` §1, their layouts, navigation groups, and Bahasa Indonesia labels.
- Design system tokens in `src/styles.css` (teal/cyan/sky, Inter).
- Demo flows: onboarding, registration wizard, document upload, risk/ethics simulation, endpoint config, red-team simulation, repository/scan simulation, compliance editing, review decisions, assistant with AI→CS handoff, CS inbox assignment/takeover/close, guest chat, admin users/permissions/organizations/audit, reports CSV.
- State transition rules: AI/human handoff, closed-conversation restrictions, assignment ≠ takeover, locked critical permissions, client product scoping.

## Allowed changes
- Replace a module's in-memory store with server calls behind the same hook/actions signature (e.g. `useUseCases`, `assistantActions`).
- Add loading, error, and empty states required by real data.
- Remove "MODE DEMO"/simulation labels per module once that module is truly integrated.
- Bug fixes and accessibility fixes.

## Integration rules
- One store module per entity stays the single source (see `FRONTEND_DATA_MODEL.md`).
- Keep existing IDs as display references; add database UUIDs alongside.
- Keep `src/test/*` passing; update fixtures only when the backend replaces them.

## Verification at freeze
- 16 test files / 123 tests pass, typecheck and build OK.
- No backend, auth, LLM, GitHub, or scanning integration present.
- No demo features removed in this phase.

## Open issues carried forward
- Direct-URL detail pages are not role-scoped.
- Organizations keyed by name.
- Demo role switcher allows any visitor any role (intended for demo only).
- State resets on reload.
