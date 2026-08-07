import { useState } from "react";
import type { T, Lang } from "../hooks/useLang";

interface Props {
  onLogin: (email: string, password: string) => Promise<boolean>;
  onSignup: (name: string, email: string, password: string) => Promise<boolean>;
  error: string;
  clearError: () => void;
  t: T;
  lang: Lang;
  setLang: (l: Lang) => void;
}

const FLOATERS = ["🌟","🚀","⭐","🤖","💡","🎯","🏆","🌈","✨","💫","🔥","🎮"];
const LANG_FLAGS: Record<string, string> = { ar: "🇸🇦", en: "🇬🇧", fr: "🇫🇷" };

export default function Login({ onLogin, onSignup, error, clearError, t, lang, setLang }: Props) {
  const [mode, setMode]       = useState<"login" | "signup">("login");
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [showPass, setShowP]  = useState(false);
  const [loading, setLoading] = useState(false);
  const [shake, setShake]     = useState(false);

  const triggerShake = () => { setShake(true); setTimeout(() => setShake(false), 500); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));
    const ok = mode === "login"
      ? await onLogin(email, password)
      : await onSignup(name, email, password);
    setLoading(false);
    if (!ok) triggerShake();
  };

  const switchMode = () => {
    setMode(m => m === "login" ? "signup" : "login");
    clearError();
    setName(""); setEmail(""); setPass("");
  };

  return (
    <div className="login-scene">
      {FLOATERS.map((e, i) => (
        <div key={i} className="login-floater" style={{
          left: `${(i * 8.5) % 100}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${4 + (i % 3)}s`,
          fontSize: `${18 + (i % 3) * 6}px`,
        }}>{e}</div>
      ))}

      {/* Language switcher at top */}
      <div className="login-lang-row">
        {(["ar", "en", "fr"] as Lang[]).map(l => (
          <button
            key={l}
            className={`login-lang-btn${lang === l ? " active" : ""}`}
            onClick={() => setLang(l)}
          >
            {LANG_FLAGS[l]} {l === "ar" ? "عربي" : l === "en" ? "EN" : "FR"}
          </button>
        ))}
      </div>

      <div className={`login-card${shake ? " shake" : ""}`}>
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">أكاديمية RoboTech</h1>
          <p className="login-subtitle">
            {mode === "login" ? t.loginWelcomeBack : t.loginJoin}
          </p>
        </div>

        <div className="login-tabs">
          <button
            className={`login-tab${mode === "login" ? " active" : ""}`}
            onClick={() => { setMode("login"); clearError(); }}
          >
            <i className="fas fa-sign-in-alt" /> {t.loginTab}
          </button>
          <button
            className={`login-tab${mode === "signup" ? " active" : ""}`}
            onClick={() => { setMode("signup"); clearError(); }}
          >
            <i className="fas fa-user-plus" /> {t.signupTab}
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "signup" && (
            <div className="login-field">
              <label><i className="fas fa-child" /> {t.nameLabel}</label>
              <input
                type="text"
                placeholder={t.namePlaceholder}
                value={name}
                onChange={e => { setName(e.target.value); clearError(); }}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-field">
            <label><i className="fas fa-envelope" /> {t.emailLabel}</label>
            <input
              type="email"
              placeholder="example@email.com"
              value={email}
              onChange={e => { setEmail(e.target.value); clearError(); }}
              required
              autoComplete="email"
              dir="ltr"
            />
          </div>

          <div className="login-field">
            <label><i className="fas fa-lock" /> {t.passLabel}</label>
            <div className="pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? t.passPlaceholder6 : "••••••••"}
                value={password}
                onChange={e => { setPass(e.target.value); clearError(); }}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                dir="ltr"
              />
              <button type="button" className="pass-eye" onClick={() => setShowP(v => !v)}>
                <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
              </button>
            </div>
          </div>

          {error && (
            <div className="login-error">
              <i className="fas fa-exclamation-circle" /> {error}
            </div>
          )}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? (
              <><span className="login-spinner" /> {t.checking}</>
            ) : mode === "login" ? (
              <><i className="fas fa-rocket" /> {t.loginBtn}</>
            ) : (
              <><i className="fas fa-star" /> {t.signupBtn}</>
            )}
          </button>
        </form>

        <p className="login-switch">
          {mode === "login" ? t.noAccount : t.hasAccount}
          {" "}
          <button onClick={switchMode} className="login-switch-btn">
            {mode === "login" ? t.signupFree : t.doLogin}
          </button>
        </p>

        <div className="login-demo">
          <i className="fas fa-lightbulb" />
          <span>{t.demoHint}</span>
        </div>
      </div>
    </div>
  );
}
