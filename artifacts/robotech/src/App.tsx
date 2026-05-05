import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Lab  from "./pages/Lab";
import Login from "./pages/Login";
import Particles from "./components/Particles";
import { useAuth } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";

type View = "home" | "lab";
const LAST_LAB_KEY = "robotech_last_lab_v2";

export default function App() {
  const { user, error, login, signup, logout, clearError } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();

  const [view, setView]     = useState<View>("home");
  const [labKey, setLabKey] = useState<string | null>(null);
  const [fading, setFading] = useState(false);

  const transition = (cb: () => void) => {
    setFading(true);
    setTimeout(() => { cb(); setFading(false); }, 280);
  };

  const openLab = (key: string) => {
    transition(() => {
      setLabKey(key);
      setView("lab");
      localStorage.setItem(LAST_LAB_KEY, key);
    });
  };

  const goHome = () => transition(() => setView("home"));

  // Restore last lab only if logged in
  useEffect(() => {
    if (!user) return;
    const last = localStorage.getItem(LAST_LAB_KEY);
    if (last) openLab(last);
  }, [user]);

  /* ── NOT LOGGED IN → show Login ── */
  if (!user) {
    return (
      <>
        <div className="bg-scene" aria-hidden="true">
          <div className="bg-gradient" />
          <div className="bg-grid" />
        </div>
        <Particles />
        <Login
          onLogin={login}
          onSignup={signup}
          error={error}
          clearError={clearError}
        />
      </>
    );
  }

  /* ── LOGGED IN ── */
  return (
    <>
      <Particles />
      <div className="bg-scene" aria-hidden="true">
        <div className="bg-gradient" />
        <div className="bg-grid" />
      </div>

      {fading && <div className="page-transition" />}

      {/* Header — home view only */}
      {view === "home" && (
        <header className="site-header">
          <button className="logo-btn" onClick={goHome} aria-label="الرئيسية">
            <div className="logo-icon">🤖</div>
            <span className="logo-text">RoboTech</span>
          </button>

          <nav>
            <ul className="nav-links">
              <li>
                <a href="#" className="active" onClick={(e) => { e.preventDefault(); goHome(); }}>
                  <i className="fas fa-home" /> الرئيسية
                </a>
              </li>
              <li>
                <a href="#labs" onClick={(e) => { e.preventDefault(); document.getElementById("labs")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <i className="fas fa-flask" /> المختبرات
                </a>
              </li>
              <li>
                <a href="#how" onClick={(e) => { e.preventDefault(); document.getElementById("how")?.scrollIntoView({ behavior: "smooth" }); }}>
                  <i className="fas fa-question-circle" /> كيف نعمل؟
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-right">
            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="تغيير الوضع">
              {theme === "dark"
                ? <><i className="fas fa-sun" /> فاتح</>
                : <><i className="fas fa-moon" /> داكن</>}
            </button>

            {/* User Menu */}
            <div className="user-chip" title={`${user.name} — ${user.email}`}>
              <span className="user-avatar">{user.avatar}</span>
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={logout} title="تسجيل الخروج">
                <i className="fas fa-sign-out-alt" />
              </button>
            </div>
          </div>
        </header>
      )}

      {view === "home" && <Home onOpenLab={openLab} user={user} theme={theme} />}
      {view === "lab"  && labKey && (
        <Lab labKey={labKey} onGoHome={goHome} theme={theme} toggleTheme={toggleTheme} />
      )}
    </>
  );
}
