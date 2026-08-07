/**
 * Supabase client (Phase 3).
 *
 * Single shared client. When the environment variables are missing (e.g. a
 * fork without a configured project) the client is null and every store
 * silently keeps its localStorage-only behavior — that IS the offline
 * fallback required by the Phase 3 brief.
 */
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

/** True when a Supabase project is configured (does not guarantee network). */
export function cloudEnabled(): boolean {
  return supabase !== null;
}

/** Best-effort online check (navigator.onLine is optimistic but cheap). */
export function isOnline(): boolean {
  return typeof navigator === "undefined" || navigator.onLine !== false;
}
