import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Lab  from "./pages/Lab";
import Particles from "./components/Particles";

type View = "home" | "lab";
const LAST_LAB_KEY = "robotech_last_lab_v2";

export default function App() {
  const [view, setView]        = useState<View>("home");
  const [labKey, setLabKey]    = useState<string | null>(null);
  const [fading, setFading]    = useState(false);

  const transition = (cb: () => void) => {
    setFading(true);
    setTimeout(() => { cb(); setFading(false); }, 320);
  };

  const openLab = (key: string) => {
    transition(() => {
      setLabKey(key);
      setView("lab");
      localStorage.setItem(LAST_LAB_KEY, key);
    });
  };

  const goHome = () => {
    transition(() => setView("home"));
  };

  useEffect(() => {
    const last = localStorage.getItem(LAST_LAB_KEY);
    if (last) openLab(last);
  }, []);

  return (
    <>
      {/* Animated particle canvas */}
      <Particles />

      {/* Dark background layers */}
      <div className="bg-scene" aria-hidden="true">
        <div className="bg-gradient" />
        <div className="bg-grid" />
      </div>

      {/* Page-transition overlay */}
      {fading && <div className="page-transition" />}

      {/* ── HEADER (only on home) ── */}
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
        </header>
      )}

      {/* ── VIEWS ── */}
      {view === "home" && <Home onOpenLab={openLab} />}
      {view === "lab"  && labKey && <Lab labKey={labKey} onGoHome={goHome} />}
    </>
  );
}
