import { useState, useRef, useEffect, useCallback } from "react";
import { labConfigs } from "../data/labs";
import { useProgress } from "../hooks/useProgress";
import ProgressRing from "../components/ProgressRing";
import BadgeToast from "../components/BadgeToast";
import Confetti from "../components/Confetti";

interface LabProps {
  labKey: string;
  onGoHome: () => void;
}

export default function Lab({ labKey, onGoHome }: LabProps) {
  const config = labConfigs[labKey];
  const [lessonIdx, setLessonIdx] = useState(0);
  const [simLoading, setSimLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [toast, setToast] = useState({ visible: false, msg: "" });
  const [prevTaskCount, setPrevTaskCount] = useState(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const embedRef = useRef<HTMLIFrameElement>(null);
  const simRef   = useRef<HTMLIFrameElement>(null);

  const { doneTasks, completedLessons, taskPercent, lessonPercent, overallPercent,
          isAllTasksDone, toggleTask, markLesson } = useProgress(
    labKey, config?.heroTasks.length ?? 0, config?.lessons.length ?? 0
  );

  const lesson = config?.lessons[lessonIdx];
  const hasMedia = !!(lesson?.src && lesson.src.trim() !== "");
  const isEmbed  = lesson?.type === "embed";
  const isVideo  = lesson?.type === "video";

  const pauseMedia = useCallback(() => {
    try { videoRef.current?.pause(); } catch (_) {}
    if (videoRef.current) { videoRef.current.removeAttribute("src"); videoRef.current.load(); }
    if (embedRef.current) embedRef.current.src = "";
  }, []);

  const applyLesson = useCallback((idx: number) => {
    pauseMedia();
    const l = config?.lessons[idx];
    if (!l) return;
    setTimeout(() => {
      if (l.type === "video" && l.src && videoRef.current) videoRef.current.src = l.src;
      if (l.type === "embed" && l.src && embedRef.current) embedRef.current.src = l.src;
    }, 60);
  }, [config, pauseMedia]);

  useEffect(() => {
    setSimLoading(true);
    setLessonIdx(0);
    pauseMedia();
    applyLesson(0);
    if (simRef.current && config?.simulatorUrl) simRef.current.src = config.simulatorUrl;
  }, [labKey]);

  useEffect(() => {
    const newCount = doneTasks.length;
    if (newCount > prevTaskCount) {
      if (isAllTasksDone && newCount >= (config?.heroTasks.length ?? 0)) {
        setShowConfetti(true);
        setToast({ visible: true, msg: "أنجزت جميع مهام البطل! أنت خارق 🎉" });
      } else {
        setToast({ visible: true, msg: `تم إنجاز المهمة رقم ${newCount} — رائع! ⭐` });
      }
    }
    setPrevTaskCount(newCount);
  }, [doneTasks.length]);

  const selectLesson = (idx: number) => {
    setLessonIdx(idx);
    applyLesson(idx);
    markLesson(idx);
  };

  const handleGoHome = () => {
    pauseMedia();
    if (simRef.current) simRef.current.src = "";
    onGoHome();
  };

  const reloadSim = () => {
    if (simRef.current && config?.simulatorUrl) {
      setSimLoading(true);
      simRef.current.src = config.simulatorUrl;
    }
  };

  if (!config) return null;

  return (
    <div className="lab-view">
      {showConfetti && <Confetti onDone={() => setShowConfetti(false)} />}
      <BadgeToast message={toast.msg} visible={toast.visible} onHide={() => setToast(t => ({ ...t, visible: false }))} />

      {/* ── TOP BAR ── */}
      <div className="lab-bar">
        <button className="lb-btn back" onClick={handleGoHome}>
          <i className="fas fa-arrow-right" />
          الرئيسية
        </button>

        <div className="lab-bar-icon" style={{ background: config.gradient }}>
          <i className={`fas ${config.faIcon}`} />
        </div>
        <span className="lab-bar-title">{config.title}</span>

        <div className="lab-bar-actions">
          <span style={{ fontSize: 13, color: "var(--text-muted)", fontWeight: 700 }}>
            <i className="fas fa-chart-pie" style={{ marginLeft: 5, color: config.color }} />
            {overallPercent}% مكتمل
          </span>
          <button className="lb-btn reload" onClick={reloadSim}>
            <i className="fas fa-sync-alt" />
            إعادة تحميل
          </button>
          <button className="lb-btn open" onClick={() => window.open(config.externalUrl, "_blank", "noopener,noreferrer")}>
            <i className="fas fa-up-right-from-square" />
            فتح منفصلاً
          </button>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="lab-body">

        {/* ════ SIDE PANEL ════ */}
        <aside className="lab-side">

          {/* Progress Rings */}
          <div className="progress-panel">
            <h4><i className="fas fa-chart-pie" /> تقدمك في المختبر</h4>
            <div className="progress-rings">
              <ProgressRing percent={lessonPercent} color={config.color} label="الدروس" />
              <ProgressRing percent={taskPercent}   color="#43e97b"     label="المهام" />
              <ProgressRing percent={overallPercent} color="#f7971e"    label="الإجمالي" />
            </div>
          </div>

          {/* Video Player */}
          <div className="video-panel">
            <div className="video-stage">
              <video
                ref={videoRef}
                style={{ display: hasMedia && isVideo ? "block" : "none" }}
                controls preload="metadata" playsInline
              />
              <iframe
                ref={embedRef}
                style={{ display: hasMedia && isEmbed ? "block" : "none" }}
                title="فيديو الدرس"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              {!hasMedia && (
                <div className="video-empty">
                  <div className="video-empty-icon"><i className="fas fa-video" /></div>
                  <h4>فيديوهات الشرح</h4>
                  <p>اختر درساً من القائمة أدناه لتشغيل الفيديو.</p>
                </div>
              )}
            </div>
            <div className="video-info">
              <div className="video-badge">
                <i className="fas fa-circle-play" />
                الدرس {lessonIdx + 1} من {config.lessons.length}
              </div>
              <h4>{lesson?.title ?? "اختر درساً"}</h4>
              <p>{lesson?.description ?? "انقر على أحد الدروس أدناه للبدء."}</p>
            </div>
          </div>

          {/* Lesson List */}
          <div className="lesson-list-panel">
            <div className="lesson-list-head">
              <h4><i className="fas fa-list" /> قائمة الدروس</h4>
              <span>{config.lessons.length} دروس</span>
            </div>
            <div className="lesson-scroll">
              {config.lessons.map((les, idx) => {
                const isDone = completedLessons.includes(idx);
                return (
                  <button
                    key={idx}
                    className={`lesson-item${idx === lessonIdx ? " active" : ""}${isDone ? " done" : ""}`}
                    onClick={() => selectLesson(idx)}
                  >
                    <div className="lesson-num">
                      {isDone ? <i className="fas fa-check" /> : idx + 1}
                    </div>
                    <div className="lesson-meta-col">
                      <span className="lesson-name">{les.title}</span>
                      <span className="lesson-dur">
                        <i className="fas fa-clock" style={{ marginLeft: 4 }} />
                        {les.duration}
                      </span>
                    </div>
                    <span className="lesson-type-pill">{les.type === "embed" ? "Embed" : "Video"}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Hero Tasks */}
          <div className="tasks-panel">
            <div className="tasks-head">
              <h4><i className="fas fa-trophy" style={{ color: "#f7971e" }} /> مهام البطل</h4>
              <span className="tasks-progress-text">{doneTasks.length}/{config.heroTasks.length}</span>
            </div>
            {config.heroTasks.map((task, idx) => {
              const done = doneTasks.includes(idx);
              return (
                <div key={idx} className="task-item" onClick={() => toggleTask(idx)}>
                  <div className={`task-check${done ? " done" : ""}`}>
                    {done && <i className="fas fa-check" />}
                  </div>
                  <span className={`task-label${done ? " done" : ""}`}>{task}</span>
                  {done && <i className="fas fa-star" style={{ color: "#f7971e", fontSize: 12 }} />}
                </div>
              );
            })}
          </div>

          {/* Skills */}
          <div className="progress-panel" style={{ padding: "12px 14px" }}>
            <h4><i className="fas fa-graduation-cap" /> المهارات المكتسبة</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {config.skills.map((s) => (
                <span key={s} className="skill-tag" style={{ fontSize: 12 }}>{s}</span>
              ))}
            </div>
          </div>

        </aside>

        {/* ════ SIMULATOR ════ */}
        <div className="sim-area">
          {simLoading && (
            <div className="sim-loader">
              <div className="loader-spinner" />
              <div className="loader-text">جاري تحميل المحاكي...</div>
              <div style={{ fontSize: 13, color: "var(--text-muted)" }}>{config.title}</div>
            </div>
          )}
          <iframe
            ref={simRef}
            className="sim-iframe"
            title={`${config.title} Simulator`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads"
            allow="fullscreen; accelerometer; camera; microphone"
            onLoad={() => setSimLoading(false)}
          />
        </div>

      </div>
    </div>
  );
}
