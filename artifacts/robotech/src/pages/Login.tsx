import { useState } from "react";
import type { User } from "../hooks/useAuth";

interface Props {
  onLogin: (email: string, password: string) => boolean;
  onSignup: (name: string, email: string, password: string) => boolean;
  error: string;
  clearError: () => void;
}

const AVATARS = ["🚀","🤖","⭐","🦁","🐉","🦊","🎮","🔬","🏆","🌟","💡","🎯"];
const FLOATERS = ["🌟","🚀","⭐","🤖","💡","🎯","🏆","🌈","✨","💫","🔥","🎮"];

export default function Login({ onLogin, onSignup, error, clearError }: Props) {
  const [mode, setMode] = useState<"login" | "signup">("login");
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
    await new Promise(r => setTimeout(r, 600));
    const ok = mode === "login"
      ? onLogin(email, password)
      : onSignup(name, email, password);
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
      {/* Floating emojis */}
      {FLOATERS.map((e, i) => (
        <div key={i} className="login-floater" style={{
          left: `${(i * 8.5) % 100}%`,
          animationDelay: `${i * 0.4}s`,
          animationDuration: `${4 + (i % 3)}s`,
          fontSize: `${18 + (i % 3) * 6}px`,
        }}>{e}</div>
      ))}

      <div className={`login-card${shake ? " shake" : ""}`}>
        {/* Header */}
        <div className="login-header">
          <div className="login-logo">🤖</div>
          <h1 className="login-title">أكاديمية RoboTech</h1>
          <p className="login-subtitle">
            {mode === "login" ? "أهلاً بعودتك يا بطل! 🌟" : "انضم إلى عالم الروبوتيك! 🚀"}
          </p>
        </div>

        {/* Tab switcher */}
        <div className="login-tabs">
          <button
            className={`login-tab${mode === "login" ? " active" : ""}`}
            onClick={() => { setMode("login"); clearError(); }}
          >
            <i className="fas fa-sign-in-alt" /> تسجيل الدخول
          </button>
          <button
            className={`login-tab${mode === "signup" ? " active" : ""}`}
            onClick={() => { setMode("signup"); clearError(); }}
          >
            <i className="fas fa-user-plus" /> حساب جديد
          </button>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {mode === "signup" && (
            <div className="login-field">
              <label><i className="fas fa-child" /> اسمك (ماذا نناديك؟)</label>
              <input
                type="text"
                placeholder="مثال: محمد البطل"
                value={name}
                onChange={e => { setName(e.target.value); clearError(); }}
                required
                autoComplete="name"
              />
            </div>
          )}

          <div className="login-field">
            <label><i className="fas fa-envelope" /> البريد الإلكتروني</label>
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
            <label><i className="fas fa-lock" /> كلمة المرور</label>
            <div className="pass-wrap">
              <input
                type={showPass ? "text" : "password"}
                placeholder={mode === "signup" ? "6 أحرف على الأقل" : "••••••••"}
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
              <><span className="login-spinner" /> جاري التحقق...</>
            ) : mode === "login" ? (
              <><i className="fas fa-rocket" /> ابدأ المغامرة!</>
            ) : (
              <><i className="fas fa-star" /> أنشئ حسابي!</>
            )}
          </button>
        </form>

        <p className="login-switch">
          {mode === "login" ? "ليس لديك حساب؟" : "لديك حساب بالفعل؟"}
          {" "}
          <button onClick={switchMode} className="login-switch-btn">
            {mode === "login" ? "سجّل مجاناً" : "سجّل دخولك"}
          </button>
        </p>

        {/* Demo hint */}
        <div className="login-demo">
          <i className="fas fa-lightbulb" />
          <span>جرب: أي بريد + أي كلمة مرور (6 أحرف) للتسجيل السريع</span>
        </div>
      </div>
    </div>
  );
}
