---
name: RoboTech Supabase sync
description: How the Phase 3 Supabase backend works — write-through design, provisioning path, and gotchas.
---

- Architecture: localStorage/IndexedDB stay the synchronous source of all reads; `src/services/cloudSync.ts` mirrors writes to Supabase in the background (queue in `robotech_sync_queue_v1`, latest-wins per key, flush on online). Pulls only run at startup and skip if the queue has unpushed edits.
  **Why:** service interfaces had to stay synchronous (components read stores in render) and offline fallback was required.
- Provisioning is done via the Supabase **management API** with the `SUPABASE_ACCESS_TOKEN` secret (project ref `qlabyqbajxwbcnljjaxs`): `/v1/projects/{ref}/database/query` runs DDL, `/v1/projects/{ref}/api-keys` returns anon/service keys. The repo copy of the schema is `artifacts/robotech/supabase/setup.sql`.
- **Gotcha:** tables created via the management query endpoint get NO default grants — anon/authenticated hit `42501` until you `grant ... on all tables in schema public` (included in setup.sql).
- The Replit Supabase connector proxy does NOT inject the apikey header (401 "No API key found") — don't rely on it; use the anon key client-side (`artifacts/robotech/.env`, safe to commit) or the PAT server-side.
- Bucket creation fails with 413 if `file_size_limit` exceeds the plan cap — omit the field.
- Admin auth: Supabase Auth is the online authority (auth user + profiles.role='admin'); a weak local hash is the offline fallback only. RLS gates all cloud writes via `public.is_admin()`; per-user rows are keyed by JWT email.
- Cross-device staleness gotchas (fixed once, keep in mind): a stuck queue entry must never block pulls or later queue entries (skip-per-kind, not whole-pull; iterate whole queue per flush); first-login migration must seed each kind only when the cloud has nothing for it; `data/labs.ts` exports `labConfigs`/`labsList` as module-level snapshots — they are refreshed in place on the cloud-updated event, don't add new frozen snapshot exports.
- Auth config: `mailer_autoconfirm=true` (no SMTP; kids' accounts). Student accounts are created lazily via background signUp on login/signup.
