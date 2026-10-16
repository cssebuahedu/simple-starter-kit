# GRAZU-AI End-to-End User Flow Audit (Phase 12G-5)

Date: 11 Oct 2026 · Read-only. No source code changed.

## Method

| Evidence type | What was actually executed |
|---|---|
| **Browser** | One headless Chromium run (Playwright, 1280×1800) against the local preview: guest chat send + AI reply, client-side navigation to the CS inbox, route visits as Superadmin, role switch to Client, then route visits as Client. No console or page errors were recorded. State was kept by navigating inside the app, because a full reload resets every demo store. |
| **Unit/journey tests** | `bunx vitest run`: 16 files, 123 tests pass. The relevant ones are `guest-chat`, `lifecycle`, `handoff`, `operational-journey`, `documents`, `endpoint-config`, `github-integration`, `permissions`, `admin-users` and `data-integrity`. These exercise store logic, not the UI. |
| **Code inspection** | Route files and stores, as cited. |

A step is marked **PASS (browser)** only if it was clicked or visited in the browser run. **PASS (logic)** means only the store tests cover it. Steps that were neither clicked nor tested are **UNVERIFIED**, with steps to reproduce.

## 1. Guest journey

| Step | Result | Evidence |
|---|---|---|
| Landing `/` loads | PASS (browser) | Page loaded, no errors |
| Floating chat opens ("Bantuan GRAZU AI") | PASS (browser) | `guest-chat.tsx` L16; dialog rendered |
| Guest sends message → AI response | PASS (browser) | Reply "Terima kasih. GRAZU AI Assistant dapat menjelaskan…" shown under "GRAZU - AI Bot", status "Ditangani AI Bot" |
| Demo disclaimer | PASS (browser) | "Demo: percakapan tamu bersifat sementara, tidak disimpan…" |
| Conversation appears in CS inbox | PASS (browser) | Inbox body contained `Guest-` entry after in-app navigation |
| CS notification created | PASS (logic) / PARTIAL (browser) | `guest-chat.test.ts` L6; notification bell present, badge content not asserted |
| CS takeover | PASS (logic) / UNVERIFIED (browser) | `guest-chat.test.ts` L16 |
| CS reply visible to guest | UNVERIFIED (browser) | `csSend` guard tested; UI round-trip not clicked |
| AI resumes after handback | PASS (logic) / UNVERIFIED (browser) | `guest-chat.test.ts` L16 |
| Guest blocked from private routes | FAIL (code) | No guest actor; `/app` opens as Superadmin (`demo-roles.tsx` L97) |

**Repro (UNVERIFIED steps):** 1) Open `/`, click "Bantuan GRAZU AI", send a message. 2) Use the "Buka Dashboard" link (not reload) → sidebar "Layanan Pelanggan". 3) Select the Guest conversation, assign to the acting CS, click "Ambil Alih Percakapan", send a reply, click "Akhiri Bantuan CS". 4) Return to `/` via in-app link and reopen chat. Expected: CS reply visible, then AI replies again. Note: the guest widget is on `/`, the inbox in `/app`; both share one store only within the same page session.

**Repro (FAIL):** Open `/app/admin/users`… simply open `/admin` in a fresh tab without signing in → full Superadmin dashboard renders.

## 2. Client journey

Role switch to "Perwakilan Organisasi" executed in the browser (topbar "Peran demo" selector); profile shows "Anisa Putri".

| Step | Result | Evidence |
|---|---|---|
| Demo role switch | PASS (browser) | Sidebar reduced to client modules (screenshot) |
| Organisasi Saya | PASS (browser) | `/app/organization` allowed for client; denied for Superadmin (browser) |
| Use case registration wizard | UNVERIFIED (browser) / PASS (logic) | `use-cases.test.ts`; wizard not filled in browser |
| Proposal upload | UNVERIFIED (browser) / PASS (logic) | `documents.test.ts`; file chooser not exercised |
| Risk assessment | PARTIAL | Route allowed; `app.risk.tsx` L31 accepts any `?product=` (unscoped) |
| Ethics assessment | PARTIAL | Route allowed; answers not persisted (`app.ethics.tsx` L56) |
| Endpoint configuration | PASS (logic) | `endpoint-config.test.ts`; "Konektivitas endpoint belum diuji" disclaimer |
| Red teaming run | UNVERIFIED (browser) | Simulation not triggered |
| GitHub repository / DevSecOps | PASS (logic) / UNVERIFIED (browser) | `github-integration.test.ts` |
| Compliance | UNVERIFIED (browser) | Route visited only as Superadmin |
| AI Assistant with product context | PASS (logic) | `assistant.test.ts`; product selector scoped (`product-selector.tsx` L5) |
| Client blocked from `/admin/users`, `/app/support/inbox`, `/app/reviews`, `/app/settings` | PASS (browser) | Each showed "Akses tidak tersedia untuk peran demo ini" |
| Client cannot open another org's product | **FAIL (browser)** | `/app/use-cases/UC-002` rendered "Deteksi Anomali Transaksi · Bank Nusantara" with all tabs |
| Client cannot open another org's repository | UNVERIFIED | `/app/devsecops/repositories/repo-002` rendered without the text "Bank Nusantara"; `repositories.$id.tsx` L27 uses unscoped `useRepos()`, so a leak is likely |
| Reports scoped to client org | UNVERIFIED (browser) / FAIL (code) | `app.reports.tsx` L36 unscoped; page text did not include other orgs by default |
| Demo disclaimers | PASS (browser) | "MODE DEMO — Data, penilaian, dan izin akses merupakan simulasi; bukan pengamanan nyata." banner on every `/app` page |

**Repro (FAIL – cross-org product):** Open `/`, click "Buka Dashboard", set "Peran demo" to "Perwakilan Organisasi", then change the URL in-app to `/app/use-cases/UC-002` (or link from any list without reload). Expected: denied/not found. Actual: Bank Nusantara product details and all tabs shown.

**Repro (UNVERIFIED – full client chain):** As client: Registrasi Use Case → "Daftarkan" wizard → attach a PDF ≤10 MB in "Dokumen Pendukung" → submit → open new product → Dokumen Proposal tab shows file → Penilaian Risiko and Etika AI from product links → AI Red Teaming: add endpoint for the new product, run simulation → AI DevSecOps: add repository, run scan → Kepatuhan Regulasi: check whether the new product has an assessment (code suggests none: `compliance.tsx` L45 positional seeds) → Tanya GRAZU AI Assistant.

## 3. Admin / CS journey

| Step | Result | Evidence |
|---|---|---|
| CS inbox route (Superadmin) | PASS (browser) | `/app/support/inbox` loaded with conversations |
| CS inbox route (Admin role) | PASS (logic) | `operational-journey.test.ts` L57; admin role not switched in browser |
| Assignment (availability-aware) | PASS (logic) | `operational-journey.test.ts` L7; `assign` L353 |
| Assignment notification targeted | PASS (logic) | `notifications.test.ts` |
| Takeover / manual reply / handback | PASS (logic) | `operational-journey.test.ts` L7, `lifecycle.test.ts` L11, L53 |
| Only assigned CS can reply | PASS (logic) | `csSend` guard L420 |
| Close / reopen | PASS (logic) | `operational-journey.test.ts` L7 |
| Assessment review (`/app/reviews`) | PASS (browser, route) / UNVERIFIED (decision) | Route loaded as Superadmin; review decision not clicked |
| Review state survives `/app` → `/admin` | FAIL (code) | `ComplianceProvider` mounted separately in `routes/app.tsx` and `routes/admin.tsx` |
| All inbox actions via UI | UNVERIFIED (browser) | Not clicked |

**Repro (UNVERIFIED UI):** Set role "Operator Layanan" → Layanan Pelanggan → select an AI-active conversation → assign to the acting CS → confirm "Ambil Alih" → send reply → "Akhiri Bantuan CS" → "Tutup Percakapan" → "Buka Kembali". Check timeline events and the client's view in GRAZU AI Assistant.

**Repro (FAIL – review reset):** As Superadmin, record a decision in Review & Audit → open Admin Dashboard (`/admin`) via sidebar → return to Review & Audit. Expected: decision kept. Code indicates it resets.

## 4. Superadmin journey

| Step | Result | Evidence |
|---|---|---|
| Admin Dashboard `/admin` | PASS (browser) | Loaded, demo banner present |
| User Management `/admin/users` | PASS (browser, route) / PASS (logic, CRUD) | `admin-users.test.ts` |
| Role Permissions `/admin/permissions` | PASS (browser, route) / PASS (logic) | `permissions.test.ts`; critical locks L82 |
| Organization Management `/admin/organizations` | PASS (browser, route) / UNVERIFIED (actions) | Status change not clicked |
| Audit Logs `/admin/audit` | PASS (browser, route) / PASS (logic) | `operational-journey.test.ts` |
| Admin pages blocked for client | PASS (browser) | `/admin/users` denied |
| Admin pages blocked for admin role | PASS (logic) | `operational-journey.test.ts` L50 |
| Audit entries appear after actions in UI | UNVERIFIED (browser) | No UI action performed |

**Repro (UNVERIFIED):** `/admin/users` → "Tambah Pengguna" → save → `/admin/permissions` toggle a non-critical client permission → `/admin/organizations` change a status with confirmation → `/admin/audit`. Expect three new entries in order.

## 5. Additional observations (browser)

- Unknown path `/app/admin-x` as client did not show the access-denied message. It showed the not-found handling instead (not inspected further). — UNVERIFIED
- No console or page errors during the run.

## 6. Summary

| Journey | Result | Main blockers |
|---|---|---|
| Guest | PARTIAL | CS round-trip not clicked in browser; no guest actor protects `/app` |
| Client | PARTIAL | Cross-organization product access confirmed in browser; long chain not exercised end-to-end |
| Admin / CS | PARTIAL | Logic fully tested; UI actions not clicked; review state reset across shells |
| Superadmin | PARTIAL | All routes load and are restricted; actions not clicked in browser |

## 7. Remediation (ordered)

- **P0:** No guest/unauthenticated gate; default role Superadmin.
- **P1:** Ownership-scope `$id` routes (use case confirmed, repository/run/assessment likely); scope reports and adoption analytics.
- **P1:** Mount compliance state once for both shells.
- **P2:** Create compliance assessments for newly registered products; persist ethics answers.
- **P3:** Add automated browser tests for the CS UI round-trip, client registration chain, and admin actions.
