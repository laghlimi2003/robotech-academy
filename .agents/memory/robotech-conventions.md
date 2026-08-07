---
name: RoboTech Academy conventions
description: Durable decisions for the robotech artifact (routing, auth, phases)
---

- App is 100% localStorage (no backend used); api-server exists but only /api/healthz. Admin auth/roles are client-side by design — documented demo limitation until a server phase adds real auth.
- No react-router: student views use `view` state in App.tsx; the Admin Panel uses hash routes `#/admin/<module>` (strictly validated against the module registry, invalid → replaceState to `#/admin/dashboard`). Keep this split; don't introduce a router.
- Phased delivery agreed with user: Phase 1 = stabilization (done), Phase 2A = admin foundation with 12 modules (only Users is real — the pre-existing management screen; rest are "قادم في المرحلة 2B" placeholders), Phase 2B = real CRUD/CMS.
- **Why:** user drives work via pasted architect briefs that forbid scope creep (no redesign, no new features outside the brief). Follow the brief literally.
- UI/admin language is Arabic (RTL); student site is trilingual ar/en/fr via useLang.
- Per-user progress keys: `robotech_progress_v3:<email>`; legacy shared v2 key is claimed once via `robotech_progress_v3_migrated` marker — never re-copy legacy data to other accounts.

## Phase 2B-1 CMS conventions (Aug 2026)
- Content services: `src/services/labStore.ts` (labs/lessons/quizzes/tasks, key `robotech_cms_labs_v1`) and `siteStore.ts` (news/settings/XP overrides). All CRUD goes through them; Phase 3 swaps load/persist for API calls only.
- `data/labs.ts` seeds the store (`defaultLabConfigs`) and re-exports effective `labConfigs`/`labsList` (hidden filtered, sim-disabled blanked) — student pages unchanged.
- Lab keys are immutable and deleted keys are permanently blocked from reuse (`robotech_cms_deleted_keys_v1`) because progress/XP records are keyed by lab key.
- persist() must return failure on localStorage write errors — never confirm a save that didn't happen.
- Simulator/external buttons in Lab.tsx are gated on non-empty URLs; new labs default simEnabled = has URL.
- XP_REWARDS in levels.ts merges CMS overrides at module load; changes apply on student page reload (whole app reads CMS data at load, not reactively — accepted until Phase 3).

## Phase 2B-2 media/settings conventions (Aug 2026)
- Media Library stores blobs in IndexedDB (`mediaStore.ts`, provider-swappable for Supabase in Phase 3); content refers to files as `media://<id>` refs, resolved to object URLs via `useMediaUrl`.
- Object-URL cache is bounded LRU with revocation + in-flight dedupe; IndexedDB writes resolve only on transaction completion; uploads enforce category↔MIME compatibility (browser `accept` is advisory).
- Site settings apply live: `saveSettings` dispatches the settings-changed event; UI reads via `useSiteSettings` hook (never module-load reads). Published-only news via `getPublishedNews`.
- Theme: system preference on first visit, stored key wins; toggle exists in both student nav and admin topbar; never hardcode `data-theme`.
- Testing gotcha: a logged-in student at `#/admin` sees the access-denied page BY DESIGN — the admin login only shows when nobody is signed in (logout first). Not a bug; don't "fix" it.
