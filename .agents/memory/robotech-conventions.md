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
