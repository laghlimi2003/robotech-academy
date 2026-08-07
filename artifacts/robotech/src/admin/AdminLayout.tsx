import { useState } from "react";
import { ADMIN_MODULES, findModule } from "./modules";
import type { User } from "../hooks/useAuth";
import { ROLE_LABELS, type Role } from "./roles";

interface AdminLayoutProps {
  user: User;
  role: Role;
  activeId: string;
  onNavigate: (id: string) => void;
  onLogout: () => void;
  theme: "dark" | "light";
  children: React.ReactNode;
}

/**
 * Admin Dashboard shell: sidebar + top bar + breadcrumb + content area.
 * Responsive: sidebar collapses to an off-canvas drawer below 900px.
 */
export default function AdminLayout({ user, role, activeId, onNavigate, onLogout, theme, children }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const active = findModule(activeId);

  const navigate = (id: string) => {
    onNavigate(id);
    setSidebarOpen(false);
  };

  return (
    <div className="admin-panel admin-shell" data-theme={theme}>
      {/* Sidebar */}
      <aside className={`admin-sidebar${sidebarOpen ? " open" : ""}`}>
        <div className="admin-sidebar-logo">
          <span>🛡️</span>
          <div>
            <strong>RoboTech</strong>
            <span>لوحة الإدارة</span>
          </div>
        </div>
        <nav className="admin-nav">
          {ADMIN_MODULES.map(m => (
            <button
              key={m.id}
              className={`admin-nav-item${m.id === activeId ? " active" : ""}`}
              onClick={() => navigate(m.id)}
            >
              <i className={`fas ${m.icon}`} />
              <span>{m.title}</span>
              {m.placeholder && <span className="admin-nav-soon">2B</span>}
            </button>
          ))}
        </nav>
        <div className="admin-sidebar-footer">
          <button className="admin-logout" onClick={onLogout}>
            <i className="fas fa-sign-out-alt" /> تسجيل خروج
          </button>
        </div>
      </aside>
      {sidebarOpen && <div className="admin-sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      {/* Main column */}
      <div className="admin-content-col">
        {/* Top bar */}
        <header className="admin-header admin-topbar">
          <div className="admin-topbar-right">
            <button className="admin-burger" onClick={() => setSidebarOpen(v => !v)} aria-label="فتح القائمة">
              <i className="fas fa-bars" />
            </button>
            {/* Breadcrumb */}
            <nav className="admin-breadcrumb" aria-label="breadcrumb">
              <span className="crumb-root"><i className="fas fa-shield-halved" /> الإدارة</span>
              {active && (
                <>
                  <i className="fas fa-angle-left crumb-sep" />
                  <span className="crumb-current">{active.title}</span>
                </>
              )}
            </nav>
          </div>
          <div className="admin-header-right">
            <span className="admin-badge">{ROLE_LABELS[role]}</span>
            <div className="admin-user-chip" title={user.email}>
              <span>{user.avatar}</span>
              <span className="admin-user-name">{user.name}</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="admin-main admin-module-main">{children}</main>
      </div>
    </div>
  );
}
