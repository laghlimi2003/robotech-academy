import { useEffect, useState } from "react";
import AdminLayout from "./AdminLayout";
import ModulePlaceholder from "./ModulePlaceholder";
import UsersModule from "./modules/UsersModule";
import { DEFAULT_MODULE_ID, findModule } from "./modules";
import { getRole, canAccessAdmin } from "./roles";
import type { User } from "../hooks/useAuth";

interface AdminAppProps {
  user: User;
  onLogout: () => void;
  theme: "dark" | "light";
}

/**
 * Read the module id from a protected hash route.
 * Only exact `#/admin` or `#/admin/<registered-id>` are valid; anything else
 * returns null so the caller can normalize the URL to the default route.
 */
function moduleFromHash(): string | null {
  const hash = window.location.hash;
  if (hash === "#/admin" || hash === "#/admin/") return DEFAULT_MODULE_ID;
  const m = hash.match(/^#\/admin\/([\w-]+)$/);
  if (m && findModule(m[1])) return m[1];
  return null;
}

/**
 * Admin Panel root (Phase 2A foundation).
 * - Access control: only the "admin" role may render anything here.
 * - Hash-based protected routes (#/admin/<module>) without touching student views.
 */
export default function AdminApp({ user, onLogout, theme }: AdminAppProps) {
  const role = getRole(user.email);
  const [activeId, setActiveId] = useState<string>(() => moduleFromHash() ?? DEFAULT_MODULE_ID);

  useEffect(() => {
    const sync = () => {
      const id = moduleFromHash();
      if (id === null) {
        // Invalid or missing admin route → replace with the canonical default
        window.history.replaceState(null, "", `#/admin/${DEFAULT_MODULE_ID}`);
        setActiveId(DEFAULT_MODULE_ID);
      } else {
        setActiveId(id);
      }
    };
    sync(); // normalize on entry
    window.addEventListener("hashchange", sync);
    return () => window.removeEventListener("hashchange", sync);
  }, []);

  // ── Access control: non-admins never see admin pages ──
  if (!canAccessAdmin(role)) {
    return (
      <div className="admin-panel admin-denied" data-theme={theme}>
        <i className="fas fa-lock" />
        <h2>غير مصرّح</h2>
        <p>هذه الصفحة مخصّصة لمديري الأكاديمية فقط.</p>
        <button className="admin-login-back" onClick={() => { window.location.hash = ""; }}>
          <i className="fas fa-arrow-right" /> العودة لموقع الطلاب
        </button>
      </div>
    );
  }

  const navigate = (id: string) => {
    window.location.hash = `#/admin/${id}`;
    setActiveId(id);
  };

  const module = findModule(activeId) ?? findModule(DEFAULT_MODULE_ID)!;

  return (
    <AdminLayout
      user={user}
      role={role}
      activeId={module.id}
      onNavigate={navigate}
      onLogout={() => { window.location.hash = ""; onLogout(); }}
      theme={theme}
    >
      {module.id === "users" ? <UsersModule /> : <ModulePlaceholder module={module} />}
    </AdminLayout>
  );
}
