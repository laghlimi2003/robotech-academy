import { useState } from "react";

interface AdminLoginProps {
  onLogin: (email: string, password: string) => Promise<boolean>;
  error: string;
  clearError: () => void;
  onBack: () => void;
}

/**
 * Dedicated Admin login screen (Phase 2A).
 * Auth still runs through useAuth (localStorage); the structure is ready to
 * swap for server-side authentication in a later phase.
 */
export default function AdminLogin({ onLogin, error, clearError, onBack }: AdminLoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    void onLogin(email, password);
  };

  return (
    <div className="admin-panel admin-login-page">
      <form className="admin-login-card" onSubmit={submit} dir="rtl">
        <div className="admin-login-icon">🛡️</div>
        <h1>دخول الإدارة</h1>
        <p>هذه الصفحة مخصّصة لمديري أكاديمية RoboTech فقط.</p>

        <label>
          <i className="fas fa-envelope" /> البريد الإلكتروني
          <input
            type="email"
            value={email}
            onChange={e => { setEmail(e.target.value); clearError(); }}
            placeholder="admin@..."
            autoComplete="username"
            required
          />
        </label>

        <label>
          <i className="fas fa-lock" /> كلمة المرور
          <div className="admin-pass-wrap">
            <input
              type={showPass ? "text" : "password"}
              value={password}
              onChange={e => { setPassword(e.target.value); clearError(); }}
              autoComplete="current-password"
              required
            />
            <button type="button" onClick={() => setShowPass(v => !v)} aria-label="إظهار كلمة المرور">
              <i className={`fas ${showPass ? "fa-eye-slash" : "fa-eye"}`} />
            </button>
          </div>
        </label>

        {error && <div className="admin-login-error"><i className="fas fa-circle-exclamation" /> {error}</div>}

        <button type="submit" className="admin-login-submit">
          <i className="fas fa-right-to-bracket" /> دخول
        </button>

        <button type="button" className="admin-login-back" onClick={onBack}>
          <i className="fas fa-arrow-right" /> العودة لموقع الطلاب
        </button>
      </form>
    </div>
  );
}
