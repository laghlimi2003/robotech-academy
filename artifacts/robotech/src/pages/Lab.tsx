import { useState, useRef, useEffect, useCallback } from "react";
import { labConfigs, Lesson } from "../data/labs";

interface LabProps {
  labKey: string;
  onGoHome: () => void;
}

export default function Lab({ labKey, onGoHome }: LabProps) {
  const config = labConfigs[labKey];

  const [currentLessonIndex, setCurrentLessonIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [simulatorLoaded, setSimulatorLoaded] = useState(false);
  const [doneTasks, setDoneTasks] = useState<Set<number>>(new Set());

  const videoRef = useRef<HTMLVideoElement>(null);
  const embedRef = useRef<HTMLIFrameElement>(null);
  const simIframeRef = useRef<HTMLIFrameElement>(null);

  const currentLesson: Lesson | undefined = config?.lessons[currentLessonIndex];

  const hasVideo = !!(currentLesson?.src && currentLesson.src.trim() !== "");
  const isEmbed = currentLesson?.type === "embed";
  const isVideo = currentLesson?.type === "video";

  const pauseMedia = useCallback(() => {
    if (videoRef.current) {
      try { videoRef.current.pause(); } catch (_) {}
      videoRef.current.removeAttribute("src");
      videoRef.current.load();
    }
    if (embedRef.current) {
      embedRef.current.src = "";
    }
  }, []);

  const loadLesson = useCallback((index: number) => {
    pauseMedia();
    setCurrentLessonIndex(index);

    const lesson = config?.lessons[index];
    if (!lesson) return;

    setTimeout(() => {
      if (lesson.type === "video" && lesson.src && videoRef.current) {
        videoRef.current.src = lesson.src;
      }
      if (lesson.type === "embed" && lesson.src && embedRef.current) {
        embedRef.current.src = lesson.src;
      }
    }, 50);
  }, [config, pauseMedia]);

  const handleGoHome = useCallback(() => {
    pauseMedia();
    if (simIframeRef.current) {
      simIframeRef.current.src = "";
    }
    onGoHome();
  }, [pauseMedia, onGoHome]);

  useEffect(() => {
    setLoading(true);
    setSimulatorLoaded(false);
    setDoneTasks(new Set());
    setCurrentLessonIndex(0);
    pauseMedia();

    const lesson = config?.lessons[0];
    if (lesson?.type === "video" && lesson.src && videoRef.current) {
      videoRef.current.src = lesson.src;
    }
    if (lesson?.type === "embed" && lesson.src && embedRef.current) {
      embedRef.current.src = lesson.src;
    }

    if (simIframeRef.current && config?.simulatorUrl) {
      simIframeRef.current.src = config.simulatorUrl;
    }
  }, [labKey, config, pauseMedia]);

  const reloadSimulator = () => {
    if (simIframeRef.current && config?.simulatorUrl) {
      setLoading(true);
      setSimulatorLoaded(false);
      simIframeRef.current.src = config.simulatorUrl;
    }
  };

  const handleSimLoad = () => {
    setLoading(false);
    setSimulatorLoaded(true);
  };

  const toggleTask = (idx: number) => {
    setDoneTasks((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  if (!config) return null;

  return (
    <div className="lab-overlay">
      <div className="lab-container">
        <div className="lab-header">
          <button className="btn-back" onClick={handleGoHome}>
            <i className="fas fa-arrow-right" />
            العودة للرئيسية
          </button>

          <h2>{config.title}</h2>

          <div className="lab-actions">
            <button
              className="btn-open"
              onClick={() => window.open(config.externalUrl, "_blank", "noopener,noreferrer")}
            >
              <i className="fas fa-up-right-from-square" />
              فتح في نافذة جديدة
            </button>
            <button className="btn-reload" onClick={reloadSimulator}>
              <i className="fas fa-sync-alt" />
              إعادة تحميل
            </button>
          </div>
        </div>

        <div className="lab-grid">
          {/* ===== SIDE PANEL ===== */}
          <aside className="lessons-panel">
            <div className="lessons-header">
              <h3><i className="fas fa-circle-play" /> فيديوهات الشرح</h3>
              <p className="lessons-subtitle">اختر درسًا من القائمة وسيظهر هنا.</p>
            </div>

            {/* Video Player */}
            <div className="video-card">
              <div className="video-wrapper">
                {/* Local video */}
                <video
                  ref={videoRef}
                  style={{ display: hasVideo && isVideo ? "block" : "none" }}
                  controls
                  preload="metadata"
                  playsInline
                />

                {/* Embed */}
                <iframe
                  ref={embedRef}
                  style={{ display: hasVideo && isEmbed ? "block" : "none" }}
                  title="مشغل فيديو الدرس"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />

                {/* Placeholder */}
                {!hasVideo && (
                  <div className="video-placeholder">
                    <div className="video-placeholder-icon">🎬</div>
                    <h4>هنا ستظهر فيديوهات الشرح</h4>
                    <p>
                      اختر درسًا من القائمة. يمكنك تعديل روابط الفيديو من ملف{" "}
                      <strong>labs.ts</strong>.
                    </p>
                  </div>
                )}
              </div>

              <div className="lesson-details">
                <span className="lesson-badge">
                  الدرس {currentLessonIndex + 1}
                </span>
                <h4>{currentLesson?.title ?? "لم يتم اختيار درس"}</h4>
                <p>
                  {currentLesson?.description ??
                    "اختر أحد الدروس من القائمة الجانبية لبدء العرض."}
                </p>
              </div>
            </div>

            {/* Lesson List */}
            <div className="lesson-list-card">
              <div className="lesson-list-head">
                <h4>قائمة الدروس</h4>
                <span>
                  {config.lessons.length}{" "}
                  {config.lessons.length === 1 ? "درس" : "دروس"}
                </span>
              </div>

              <div className="lesson-list-scroll">
                {config.lessons.length === 0 ? (
                  <div className="lesson-empty">
                    لا توجد دروس بعد. أضف الدروس من ملف{" "}
                    <strong>labs.ts</strong>.
                  </div>
                ) : (
                  config.lessons.map((lesson, idx) => (
                    <button
                      key={idx}
                      className={`lesson-item${idx === currentLessonIndex ? " active" : ""}`}
                      onClick={() => loadLesson(idx)}
                    >
                      <div className="lesson-item-top">
                        <span className="lesson-name">{lesson.title}</span>
                        <span className="lesson-index">{idx + 1}</span>
                      </div>
                      <div className="lesson-meta">
                        <span className="lesson-type-badge">
                          {lesson.type === "embed" ? "Embed" : "Video"}
                        </span>
                        <span>{lesson.duration || "—"}</span>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Hero Tasks */}
            <div className="tasks-panel">
              <h4>🏆 قائمة مهام البطل</h4>
              {config.heroTasks.map((task, idx) => (
                <div
                  key={idx}
                  className="task-item"
                  onClick={() => toggleTask(idx)}
                >
                  <div className={`task-check${doneTasks.has(idx) ? " done" : ""}`}>
                    {doneTasks.has(idx) && "✓"}
                  </div>
                  <span className={`task-label${doneTasks.has(idx) ? " done" : ""}`}>
                    {task}
                  </span>
                </div>
              ))}
            </div>
          </aside>

          {/* ===== SIMULATOR ===== */}
          <div className="sim-frame-wrapper">
            {loading && !simulatorLoaded && (
              <div className="sim-loader">
                <span className="spin">⟳</span>
                <span>جاري تحميل المختبر...</span>
              </div>
            )}
            <iframe
              ref={simIframeRef}
              className="sim-iframe"
              title={`${config.title} Simulator`}
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals"
              allow="fullscreen"
              onLoad={handleSimLoad}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
