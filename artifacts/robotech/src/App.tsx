import { useState, useEffect, useRef } from "react";
import Home from "./pages/Home";
import Lab from "./pages/Lab";

type View = "home" | "lab";

const STORAGE_KEY_LAB = "robotech_last_lab";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [currentLab, setCurrentLab] = useState<string | null>(null);
  const [transitioning, setTransitioning] = useState(false);
  const mainRef = useRef<HTMLDivElement>(null);

  const fadeTransition = (cb: () => void) => {
    setTransitioning(true);
    setTimeout(() => {
      cb();
      setTransitioning(false);
    }, 280);
  };

  const openLab = (key: string) => {
    fadeTransition(() => {
      setCurrentLab(key);
      setView("lab");
      localStorage.setItem(STORAGE_KEY_LAB, key);
    });
  };

  const goHome = () => {
    fadeTransition(() => {
      setView("home");
    });
  };

  useEffect(() => {
    const lastLab = localStorage.getItem(STORAGE_KEY_LAB);
    if (lastLab) openLab(lastLab);
  }, []);

  return (
    <>
      {/* Animated Background */}
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
        <div className="blob blob-3" />
      </div>

      {/* Page Transition Overlay */}
      {transitioning && <div className="page-transition-overlay" />}

      {/* Header */}
      <header className="glass-header">
        <button
          className="logo-btn"
          onClick={goHome}
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <i className="fas fa-robot" style={{ fontSize: 26 }} />
          <span>RoboTech</span>
        </button>

        <nav>
          <ul className="nav-links">
            <li>
              <a href="#" onClick={(e) => { e.preventDefault(); goHome(); }}>
                <i className="fas fa-home" style={{ marginLeft: 5 }} />
                الرئيسية
              </a>
            </li>
            <li>
              <a href="#labs-section" onClick={(e) => { if (view === "lab") { e.preventDefault(); goHome(); } }}>
                <i className="fas fa-flask" style={{ marginLeft: 5 }} />
                المختبرات
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-book-open" style={{ marginLeft: 5 }} />
                دروسي
              </a>
            </li>
            <li>
              <a href="#">
                <i className="fas fa-info-circle" style={{ marginLeft: 5 }} />
                عن الأكاديمية
              </a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Views */}
      <div
        ref={mainRef}
        className={transitioning ? "view-fade-out" : "view-fade-in"}
      >
        {view === "home" && <Home onOpenLab={openLab} />}
        {view === "lab" && currentLab && (
          <Lab labKey={currentLab} onGoHome={goHome} />
        )}
      </div>
    </>
  );
}
