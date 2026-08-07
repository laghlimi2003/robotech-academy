import { isAdminEmail } from "../hooks/useAuth";

/**
 * Role system foundation (Phase 2A).
 * Only "admin" is active today; "teacher" and "student" are placeholders
 * that will be wired to the database in a later phase.
 */
export type Role = "admin" | "teacher" | "student";

export const ROLE_LABELS: Record<Role, string> = {
  admin: "مدير",
  teacher: "معلّم",
  student: "طالب",
};

/** Resolve the role for an email. DB-backed roles arrive in Phase 2B+. */
export function getRole(email: string): Role {
  if (isAdminEmail(email)) return "admin";
  return "student";
}

/** Central access check for the Admin Panel. */
export function canAccessAdmin(role: Role): boolean {
  return role === "admin";
}
