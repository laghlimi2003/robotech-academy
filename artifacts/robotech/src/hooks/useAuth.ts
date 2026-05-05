import { useState, useCallback } from "react";

export interface User {
  name: string;
  email: string;
  avatar: string;
  joinDate: string;
}

const KEY = "robotech_user_v2";
const USERS_KEY = "robotech_users_db";

function hashPass(p: string) {
  let h = 0;
  for (let i = 0; i < p.length; i++) h = (Math.imul(31, h) + p.charCodeAt(i)) | 0;
  return h.toString(16);
}

function loadUser(): User | null {
  try { return JSON.parse(localStorage.getItem(KEY) ?? "null"); } catch { return null; }
}

function loadUsers(): Record<string, { name: string; hash: string; avatar: string; joinDate: string }> {
  try { return JSON.parse(localStorage.getItem(USERS_KEY) ?? "{}"); } catch { return {}; }
}

const AVATARS = ["🚀","🤖","⭐","🦁","🐉","🦊","🎮","🔬","🏆","🌟","💡","🎯"];

export function useAuth() {
  const [user, setUser] = useState<User | null>(loadUser);
  const [error, setError] = useState("");

  const login = useCallback((email: string, password: string): boolean => {
    const users = loadUsers();
    const record = users[email.toLowerCase()];
    if (!record) { setError("البريد الإلكتروني غير مسجل"); return false; }
    if (record.hash !== hashPass(password)) { setError("كلمة المرور غير صحيحة"); return false; }
    const u: User = { name: record.name, email: email.toLowerCase(), avatar: record.avatar, joinDate: record.joinDate };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    setError("");
    return true;
  }, []);

  const signup = useCallback((name: string, email: string, password: string): boolean => {
    if (name.trim().length < 2) { setError("الاسم قصير جداً"); return false; }
    if (!email.includes("@")) { setError("البريد الإلكتروني غير صالح"); return false; }
    if (password.length < 6) { setError("كلمة المرور يجب أن تكون 6 أحرف على الأقل"); return false; }
    const users = loadUsers();
    if (users[email.toLowerCase()]) { setError("هذا البريد مسجل مسبقاً"); return false; }
    const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
    const joinDate = new Date().toLocaleDateString("ar-SA");
    users[email.toLowerCase()] = { name: name.trim(), hash: hashPass(password), avatar, joinDate };
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    const u: User = { name: name.trim(), email: email.toLowerCase(), avatar, joinDate };
    localStorage.setItem(KEY, JSON.stringify(u));
    setUser(u);
    setError("");
    return true;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(KEY);
    setUser(null);
  }, []);

  const clearError = useCallback(() => setError(""), []);

  return { user, error, login, signup, logout, clearError };
}
