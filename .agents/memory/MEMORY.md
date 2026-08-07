# Memory Index

- [RoboTech conventions](robotech-conventions.md) — localStorage-only app, hash-only admin routes (#/admin/*), phased briefs forbid scope creep, per-user progress key scheme.
- [RoboTech Supabase sync](supabase-sync.md) — Phase 3 write-through mirror: localStorage stays the sync read source, cloudSync queue pushes to Supabase; provisioning via management API + PAT; grants gotcha.
