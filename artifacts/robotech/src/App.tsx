import { useState } from "react";
import Home from "./pages/Home";
import Lab  from "./pages/Lab";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Particles from "./components/Particles";
import PwaInstall from "./components/PwaInstall";
import XPBar from "./components/XPBar";
import RewardToast from "./components/RewardToast";
import Leaderboard from "./pages/Leaderboard";
import AdminPanel from "./pages/AdminPanel";
import { useAuth, isAdminEmail } from "./hooks/useAuth";
import { useTheme } from "./hooks/useTheme";
import { useLang } from "./hooks/useLang";
import { useReminder, requestNotificationPermission } from "./hooks/useReminder";
import { useGamification } from "./hooks/useGamification";

type View = "home" | "lab" | "dashboard" | "leaderboard";
const LAST_LAB_KEY = "robotech_last_lab_v2";

const LANG_FLAGS: Record<string, string> = { ar: "🇸🇦", en: "🇬🇧", fr: "🇫🇷" };

export default function App() {
  const { user, error, login, signup, logout, clearError } = useAuth();
  const { theme, toggle: toggleTheme } = useTheme();
  const { lang, setLang, t } = useLang();

  const [view, setView]     = useState<View>("home");
  const [labKey, setLabKey] = useState<string | null>(null);
  const [fading, setFading] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [notifState, setNotifState] = useState<NotificationPermission | "unsupported">(
    typeof Notification === "undefined" ? "unsupported" : Notification.permission
  );

  useReminder(t, user?.name);
  const gam = useGamification(user?.email, user?.name ?? "", user?.avatar ?? "🤖", lang);

  const enableNotifications = async () => {
    const res = await requestNotificationPermission();
    setNotifState(res);
  };

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

  const goHome        = () => transition(() => setView("home"));
  const goDashboard   = () => transition(() => setView("dashboard"));
  const goLeaderboard = () => transition(() => setView("leaderboard"));
  const goLabs      = () => {
    transition(() => setView("home"));
    setTimeout(() => {
      document.getElementById("labs")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 320);
  };

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
          t={t}
          lang={lang}
          setLang={setLang}
        />
      </>
    );
  }

  /* ── ADMIN → لوحة الإدارة مباشرة ── */
  if (isAdminEmail(user.email)) {
    return <AdminPanel onLogout={logout} theme={theme} />;
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

      {/* Header — home and dashboard views */}
      {(view === "home" || view === "dashboard" || view === "leaderboard") && (
        <header className="site-header">
          <button className="logo-btn" onClick={goHome} aria-label={t.home}>
            <div className="logo-icon">🤖</div>
            <span className="logo-text">RoboTech</span>
          </button>

          <nav>
            <ul className="nav-links">
              <li>
                <a href="#" className={view === "home" ? "active" : ""} onClick={(e) => { e.preventDefault(); goHome(); }}>
                  <i className="fas fa-home" /> {t.home}
                </a>
              </li>
              <li>
                <a href="#labs" onClick={(e) => { e.preventDefault(); if (view !== "home") { goHome(); } else { document.getElementById("labs")?.scrollIntoView({ behavior: "smooth" }); } }}>
                  <i className="fas fa-flask" /> {t.labs}
                </a>
              </li>
              <li>
                <a href="#" className={view === "dashboard" ? "active" : ""} onClick={(e) => { e.preventDefault(); goDashboard(); }}>
                  <i className="fas fa-chart-bar" /> {t.dashboard}
                </a>
              </li>
              <li>
                <a href="#" className={view === "leaderboard" ? "active" : ""} onClick={(e) => { e.preventDefault(); goLeaderboard(); }}>
                  <i className="fas fa-trophy" /> {t.xpLeaderboard}
                </a>
              </li>
            </ul>
          </nav>

          <div className="header-right">
            <XPBar xp={gam.xp} level={gam.level} streak={gam.streak} lang={lang} t={t} compact onClick={goLeaderboard} />

            {/* Language Selector */}
            <div className="lang-selector">
              <button
                className="lang-btn"
                onClick={() => setShowLangMenu(v => !v)}
                title={t.langLabel}
              >
                {LANG_FLAGS[lang]} {lang.toUpperCase()}
                <i className="fas fa-chevron-down" style={{ fontSize: 10 }} />
              </button>
              {showLangMenu && (
                <div className="lang-dropdown">
                  {(["ar", "en", "fr"] as const).map(l => (
                    <button
                      key={l}
                      className={`lang-option${lang === l ? " active" : ""}`}
                      onClick={() => { setLang(l); setShowLangMenu(false); }}
                    >
                      {LANG_FLAGS[l]} {l === "ar" ? "العربية" : l === "en" ? "English" : "Français"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme Toggle */}
            <button className="theme-toggle" onClick={toggleTheme} aria-label="toggle theme">
              {theme === "dark"
                ? <><i className="fas fa-sun" /> {t.light}</>
                : <><i className="fas fa-moon" /> {t.dark}</>}
            </button>

            {/* User Menu */}
            <div className="user-chip" title={`${user.name} — ${user.email}`}>
              <span className="user-avatar">{user.avatar}</span>
              <span className="user-name">{user.name}</span>
              <button className="logout-btn" onClick={logout} title={t.logout}>
                <i className="fas fa-sign-out-alt" />
              </button>
            </div>
          </div>
        </header>
      )}

      {view === "home"      && <Home onOpenLab={openLab} user={user} theme={theme} t={t} lang={lang} />}
      {view === "dashboard" && <Dashboard user={user} t={t} lang={lang} onOpenLab={openLab} />}
      {view === "leaderboard" && (
        <Leaderboard
          currentEmail={user.email}
          earnedBadges={gam.badges}
          resolveBadge={gam.resolveBadge}
          lang={lang}
          t={t}
          theme={theme}
        />
      )}
      {view === "lab"  && labKey && (
        <Lab
          labKey={labKey}
          onGoHome={goLabs}
          theme={theme}
          toggleTheme={toggleTheme}
          t={t}
          lang={lang}
          setLang={setLang}
          user={user}
          gam={gam}
        />
      )}

      <RewardToast rewards={gam.rewards} onDismiss={gam.dismissReward} lang={lang} t={t} />
      <PwaInstall t={t} />

      {view === "dashboard" && notifState === "default" && (
        <button className="notif-enable-fab" onClick={enableNotifications}>
          <i className="fas fa-bell" /> {t.pwaEnableNotifs}
        </button>
      )}
    </>
  );
}
