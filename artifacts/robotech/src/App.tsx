import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Lab from "./pages/Lab";

type View = "home" | "lab";

const STORAGE_KEY_LAB = "robotech_last_lab";
const STORAGE_KEY_LESSON = "robotech_last_lesson";

export default function App() {
  const [view, setView] = useState<View>("home");
  const [currentLab, setCurrentLab] = useState<string | null>(null);

  const openLab = (key: string) => {
    setCurrentLab(key);
    setView("lab");
    localStorage.setItem(STORAGE_KEY_LAB, key);
  };

  const goHome = () => {
    setView("home");
  };

  useEffect(() => {
    const lastLab = localStorage.getItem(STORAGE_KEY_LAB);
    if (lastLab) {
      openLab(lastLab);
    }
  }, []);

  return (
    <>
      {/* Animated Background */}
      <div className="bg-blobs" aria-hidden="true">
        <div className="blob blob-1" />
        <div className="blob blob-2" />
      </div>

      {/* Header */}
      <header className="glass-header">
        <button
          className="logo-btn"
          onClick={goHome}
          aria-label="العودة إلى الصفحة الرئيسية"
        >
          <span>🤖</span>
          <span>RoboTech</span>
        </button>

        <nav>
          <ul className="nav-links">
            <li>
              <a
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  goHome();
                }}
              >
                الرئيسية
              </a>
            </li>
            <li>
              <a href="#labs-section">المختبرات</a>
            </li>
            <li>
              <a href="#">دروسي</a>
            </li>
            <li>
              <a href="#">عن الأكاديمية</a>
            </li>
          </ul>
        </nav>
      </header>

      {/* Views */}
      {view === "home" && <Home onOpenLab={openLab} />}
      {view === "lab" && currentLab && (
        <Lab labKey={currentLab} onGoHome={goHome} />
      )}
    </>
  );
}
