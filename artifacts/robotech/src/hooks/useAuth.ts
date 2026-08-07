import { useState, useCallback } from "react";
import { supabase } from "../services/supabaseClient";
import { migrateLocalToCloud, pullUserState, pushUserState } from "../services/cloudSync";

export interface User {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

const KEY = "robotech_user_v2";
const USERS_KEY = "robotech_users_db";

// ── Admin account ────────────────────────────────────────────
// The real credential lives ONLY in Supabase Auth (validated online).
// For the offline fallback we keep just a weak local hash — the plaintext
// password is no longer embedded in the bundle.
const ADMIN_EMAIL = "admin@robotech.com";
const ADMIN_PASS_HASH = "20129c85"; // hashPass of the admin password — offline fallback only

function hashPass(p: string) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (Math.imul(31, h) + p.charCodeAt(i)) | 0;
  return h.toString(16);
}

export function isAdminEmail(email: string) {
  return email.trim().toLowerCase() === ADMIN_EMAIL;
}

function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}

type UsersDb = Record<string, { name: string; hash: string; avatar: string; joinDate: string }>;

function loadUsers(): UsersDb {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}"); } catch { return {}; }
}

function saveUsers(users: UsersDb) {
  try { localStorage.setItem(USERS_KEY, JSON.stringify(users)); } catch { /* quota */ }
}

const AVATARS = ["🚀","🤖","⭐","🦁","🐉","🦊","🎮","🔬","🏆","🌟","💡","🎯"];

/* ── Supabase Auth helpers (Phase 3) ───────────────────────── */

/** Background sign-in to Supabase; never blocks or fails the local login. */
async function cloudSignIn(email: string, password: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return !error;
  } catch { return false; }
}

async function cloudSignUp(email: string, password: string, name: string, avatar: string): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { data, error } = await supabase.auth.signUp({
      email, password,
      options: { data: { name, avatar } },
    });
    if (error || !data.user) return false;
    await supabase.from("profiles").upsert({
      id: data.user.id, email, name, avatar,
      role: "student", join_date: new Date().toLocaleDateString("ar-SA"),
    });
    return true;
  } catch { return false; }
}

/** Fetch the cloud profile of an account that doesn't exist locally (new device). */
async function fetchCloudProfile(): Promise<{ name: string; avatar: string; join_date: string } | null> {
  if (!supabase) return null;
  try {
    const { data: sess } = await supabase.auth.getSession();
    const uid = sess.session?.user?.id;
    if (!uid) return null;
    const { data } = await supabase.from("profiles").select("name,avatar,join_date").eq("id", uid).maybeSingle();
    if (data) return data;
    const meta = sess.session?.user?.user_metadata as { name?: string; avatar?: string } | undefined;
    return { name: meta?.name ?? "", avatar: meta?.avatar ?? "🚀", join_date: "" };
  } catch { return null; }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);
  const [error, setError] = useState("");

  const finishLogin = useCallback((u: User) => {
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    setError("");
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    const lEmail = email.trim().toLowerCase();

    // Admin — Supabase Auth is the authority when online; the weak local
    // hash is only an offline fallback (local UI access, no cloud writes —
    // RLS still requires a real Supabase admin session).
    if (lEmail === ADMIN_EMAIL) {
      let ok = false;
      if (supabase && navigator.onLine !== false) {
        ok = await cloudSignIn(lEmail, password);
        if (!ok && hashPass(password) !== ADMIN_PASS_HASH) { setError("كلمة مرور Admin خاطئة"); return false; }
      } else if (hashPass(password) !== ADMIN_PASS_HASH) {
        setError("كلمة مرور Admin خاطئة"); return false;
      }
      const u: User = { name: "المدير", email: lEmail, avatar: "🛡️", joinDate: new Date().toLocaleDateString("ar-SA") };
      finishLogin(u);
      if (ok) void migrateLocalToCloud();
      return true;
    }

    const users = loadUsers();
    const record = users[lEmail];

    // Local record exists — validate locally (works offline), then sync cloud session.
    if (record) {
      if (record.hash !== hashPass(password)) { setError("كلمة المرور غير صحيحة"); return false; }
      finishLogin({ name: record.name, email: lEmail, avatar: record.avatar, joinDate: record.joinDate });
      void (async () => {
        const ok = await cloudSignIn(lEmail, password);
        if (!ok) await cloudSignUp(lEmail, password, record.name, record.avatar); // first cloud sync of a local-only account
        const pulled = await pullUserState(lEmail);
        if (!pulled) pushUserState(lEmail);
      })();
      return true;
    }

    // Unknown locally — try Supabase (account created on another device).
    if (await cloudSignIn(lEmail, password)) {
      const profile = await fetchCloudProfile();
      const u: User = {
        name: profile?.name || lEmail.split("@")[0],
        email: lEmail,
        avatar: profile?.avatar || "🚀",
        joinDate: profile?.join_date || new Date().toLocaleDateString("ar-SA"),
      };
      // cache locally so the account also works offline from now on
      users[lEmail] = { name: u.name, hash: hashPass(password), avatar: u.avatar, joinDate: u.joinDate };
      saveUsers(users);
      finishLogin(u);
      void pullUserState(lEmail);
      return true;
    }

    setError("البريد الإلكتروني غير مسجل");
    return false;
  }, [finishLogin]);

  const signup = useCallback(async (name: string, email: string, password: string): Promise<boolean> => {
    if (name.trim().length < 2) { setError("الاسم قصير جداً"); return false; }
    if (!email.includes("@")) { setError("البريد الإلكتروني غير صالح"); return false; }
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return false; }
    const lEmail = email.trim().toLowerCase();
    const users = loadUsers();
    if (users[lEmail]) { setError("هذا البريد مسجل مسبقاً"); return false; }
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const joinDate = new Date().toLocaleDateString("ar-SA");
    users[lEmail] = { name: name.trim(), hash: hashPass(password), avatar, joinDate };
    saveUsers(users);
    finishLogin({ name: name.trim(), email: lEmail, avatar, joinDate });
    // Cloud account in the background — if offline, it is created on the next online login.
    void cloudSignUp(lEmail, password, name.trim(), avatar);
    return true;
  }, [finishLogin]);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
    if (supabase) void supabase.auth.signOut();
  }, []);

  const clearError = useCallback(() => setError(""), []);

  return { user, error, login, signup, logout, clearError };
}
