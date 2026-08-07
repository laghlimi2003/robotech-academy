import { useState, useRef, useEffect, useCallback } from "react";
import { labConfigs, localizeLab } from "../data/labs";
import { useProgress } from "../hooks/useProgress";
import ProgressRing from "../components/ProgressRing";
import BadgeToast from "../components/BadgeToast";
import Confetti from "../components/Confetti";
import Quiz from "../components/Quiz";
import Certificate from "../components/Certificate";
import type { T, Lang } from "../hooks/useLang";
import { useMediaUrl } from "../hooks/useMediaUrl";
import type { LessonAttachment } from "../data/labs";

/** Downloadable lesson attachment — resolves media:// refs to object URLs. */
function AttachmentLink({ att }: { att: LessonAttachment }) {
  const url = useMediaUrl(att.src);
  if (!url) return null;
  return (
    <a className="lesson-attachment" href={url} download={att.name} target="_blank" rel="noopener noreferrer">
      <i className="fas fa-file-arrow-down" />
      <span dir="ltr">{att.name}</span>
    </a>
  );
}
import type { useGamification } from "../hooks/useGamification";

type Gam = ReturnType<typeof useGamification>;

interface LabUser {
  name: string;
  email?: string;
}

interface LabProps {
  labKey: string;
  onGoHome: () => void;
  theme: "dark" | "light";
  toggleTheme: () => void;
  t: T;
  lang: Lang;
  setLang: (l: Lang) => void;
  user: LabUser;
  gam?: Gam;
}

const LANG_FLAGS: Record<string, string> = { ar: "🇸🇦", en: "🇬🇧", fr: "🇫🇷" };

export default function Lab({ labKey, onGoHome, theme, toggleTheme, t, lang, setLang, user, gam }: LabProps) {
  const rawConfig = labConfigs[labKey];
  const config = rawConfig ? localizeLab(rawConfig, lang) : undefined;

  const [lessonIdx, setLessonIdx]  = useState(-1);
  const [simReady, setSimReady]    = useState(false);
  const [simLoaded, setSimLoaded]  = useState(false);
  const [showConfetti, setShowCon] = useState(false);
  const [toast, setToast]          = useState({ visible: false, msg: "" });
  const [prevCount, setPrevCount]  = useState(0);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [videoError, setVideoError] = useState<string>("");

  // Resolve Media Library (media://) references for the active lesson
  const activeLesson = lessonIdx >= 0 ? config?.lessons[lessonIdx] : undefined;
  const resolvedLessonSrc = useMediaUrl(activeLesson?.src);
  const resolvedThumb = useMediaUrl(activeLesson?.thumbnail);
  const [simTimedOut, setSimTimedOut] = useState(false);
  const [simAttempt, setSimAttempt] = useState(0);
  const [quizOpenFor, setQuizOpenFor] = useState<number | null>(null);
  const [showCert, setShowCert] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const embedRef = useRef<HTMLIFrameElement>(null);
  const simRef   = useRef<HTMLIFrameElement>(null);

  const { doneTasks, completedLessons, taskPercent, lessonPercent, overallPercent,
          isAllTasksDone, toggleTask, markLesson } = useProgress(
    labKey, rawConfig?.heroTasks.ar.length ?? 0, rawConfig?.lessons.length ?? 0, user.email
  );

  const pauseMedia = useCallback(() => {
    try { videoRef.current?.pause(); } catch (_) {}
  }, []);

  useEffect(() => {
    setSimReady(false);
    setSimLoaded(false);
    setLessonIdx(-1);
    pauseMedia();
    if (simRef.current) simRef.current.src = "";
    setPrevCount(doneTasks.length);
  }, [labKey]);

  useEffect(() => {
    pauseMedia();
    setVideoError("");
  }, [labKey, lessonIdx, pauseMedia]);

  useEffect(() => {
    if (doneTasks.length > prevCount) {
      if (isAllTasksDone) {
        setShowCon(true);
        setToast({ visible: true, msg: t.toastAllDone });
      } else {
        setToast({ visible: true, msg: `${t.toastTaskDone} ${doneTasks.length} ⭐` });
      }
      // Award per-task by index — idempotent (unchecking won't re-trigger; rechecking won't double-award)
      for (const taskIdx of doneTasks) gam?.awardTask(labKey, taskIdx);
    }
    setPrevCount(doneTasks.length);
  }, [doneTasks.length, doneTasks, isAllTasksDone, labKey, gam, t, prevCount]);

  const prevOverall = useRef(0);
  useEffect(() => {
    if (overallPercent >= 100 && prevOverall.current < 100 && config) {
      gam?.awardLabComplete(config.key, rawConfig!.title);
    }
    prevOverall.current = overallPercent;
  }, [overallPercent, config, rawConfig, gam]);

  const selectLesson = (idx: number) => {
    if (idx === lessonIdx) {
      setLessonIdx(-1);
      pauseMedia();
      setQuizOpenFor(null);
      return;
    }
    setLessonIdx(idx);
    setQuizOpenFor(null);
  };

  const handleQuizPass = (idx: number, percent: number) => {
    markLesson(idx);
    setQuizOpenFor(null);
    setShowCon(true);
    setToast({ visible: true, msg: t.quizPassedMsg });
    // Idempotent inside hook — safe to call always
    gam?.awardLesson(labKey, idx);
    gam?.awardQuiz(labKey, idx, percent);
  };

  const handleMarkWatched = (idx: number) => {
    markLesson(idx);
    setToast({ visible: true, msg: t.quizMarkWatched });
    gam?.awardLesson(labKey, idx);
  };

  // If the simulator iframe never fires load (blocked by X-Frame-Options/CSP or
  // very slow network), surface a fallback instead of an endless spinner.
  useEffect(() => {
    if (!simReady || simLoaded) { setSimTimedOut(false); return; }
    const timer = window.setTimeout(() => setSimTimedOut(true), 20000);
    return () => window.clearTimeout(timer);
  }, [simReady, simLoaded, simAttempt]);

  const launchSim = () => {
    setSimReady(true);
    setSimLoaded(false);
    setSimTimedOut(false);
    setSimAttempt(a => a + 1);
    if (simRef.current && config?.simulatorUrl) {
      simRef.current.src = config.simulatorUrl;
    }
  };

  const reloadSim = () => {
    setSimLoaded(false);
    setSimTimedOut(false);
    setSimAttempt(a => a + 1);
    if (simRef.current && config?.simulatorUrl) {
      simRef.current.src = config.simulatorUrl;
    }
  };

  const handleGoHome = () => {
    pauseMedia();
    if (simRef.current) simRef.current.src = "";
    onGoHome();
  };

  if (!config) return null;

  return (
    <div className="lab-view" data-theme={theme}>
      {showCert && (
        <Certificate
          userName={user.name}
          lab={config}
          lang={lang}
          t={t}
          onClose={() => setShowCert(false)}
        />
      )}
      {showConfetti && <Confetti onDone={() => setShowCon(false)} />}
      <BadgeToast
        message={toast.msg}
        visible={toast.visible}
        title={t.badgeNew}
        onHide={() => setToast(s => ({ ...s, visible: false }))}
      />

      {/* ══ TOP BAR ══ */}
      <div className="lab-bar">
        <button className="lb-btn back" onClick={handleGoHome}>
          <i className="fas fa-arrow-right" /> {t.backHome}
        </button>

        <div className="lab-bar-icon" style={{ background: config.gradient }}>
          <i className={`fas ${config.faIcon}`} />
        </div>
        <span className="lab-bar-title">{config.title}</span>

        <div className="lab-bar-actions">
          <span className="lab-overall-badge" style={{ color: config.color }}>
            <i className="fas fa-chart-pie" /> {overallPercent}%
          </span>

          {/* Language in lab bar */}
          <div className="lang-selector">
            <button className="lang-btn" onClick={() => setShowLangMenu(v => !v)}>
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

          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === "dark"
              ? <><i className="fas fa-sun" /> {t.light}</>
              : <><i className="fas fa-moon" /> {t.dark}</>}
          </button>

          {simReady && (
            <button className="lb-btn reload" onClick={reloadSim}>
              <i className="fas fa-sync-alt" /> {t.reload}
            </button>
          )}
          {config.externalUrl && (
            <button className="lb-btn open" onClick={() => window.open(config.externalUrl, "_blank", "noopener,noreferrer")}>
              <i className="fas fa-up-right-from-square" /> {t.openSep}
            </button>
          )}
        </div>
      </div>

      {/* ══ BODY ══ */}
      <div className="lab-body">

        {/* ── SIDE PANEL ── */}
        <aside className="lab-side">

          <div className="progress-panel">
            <h4><i className="fas fa-chart-pie" /> {t.yourProgress}</h4>
            <div className="progress-rings">
              <ProgressRing percent={lessonPercent}  color={config.color} label={t.lessonsCount} />
              <ProgressRing percent={taskPercent}    color="#43e97b"      label={t.heroTasks} />
              <ProgressRing percent={overallPercent} color="#f7971e"      label="%" />
            </div>

            {(lessonPercent === 100 && taskPercent === 100) ? (
              <button
                className="cert-cta"
                style={{ background: config.gradient, boxShadow: `0 8px 24px ${config.glowColor}` }}
                onClick={() => setShowCert(true)}
              >
                <div className="cert-cta-icon"><i className="fas fa-award" /></div>
                <div className="cert-cta-text">
                  <strong>{t.certUnlocked}</strong>
                  <span>{t.certUnlockHint}</span>
                </div>
                <i className="fas fa-arrow-left cert-cta-arrow" />
              </button>
            ) : (
              <div className="cert-locked" title={t.certLockedHint}>
                <i className="fas fa-lock" /> {t.certLockedHint}
              </div>
            )}
          </div>

          <div className="lesson-list-panel">
            <div className="lesson-list-head">
              <h4><i className="fas fa-list" /> {t.lessonsList}</h4>
              <span>{config.lessons.length} {t.lessonsCount}</span>
            </div>
            <div className="lesson-scroll">
              {config.lessons.map((les, idx) => {
                const isDone   = completedLessons.includes(idx);
                const isActive = idx === lessonIdx;
                const lHasMedia = !!(les.src?.trim());
                const lIsVideo  = les.type === "video";
                const lIsEmbed  = les.type === "embed";
                return (
                  <div key={idx} className={`lesson-row${isActive ? " active" : ""}${isDone ? " done" : ""}`}>
                    <button
                      type="button"
                      className="lesson-item"
                      onClick={() => selectLesson(idx)}
                      aria-expanded={isActive}
                    >
                      <div className="lesson-num">
                        {isDone ? <i className="fas fa-check" /> : idx + 1}
                      </div>
                      <div className="lesson-meta-col">
                        <span className="lesson-name">{les.title}</span>
                        <span className="lesson-dur">
                          <i className="fas fa-clock" style={{ marginInlineEnd: 4 }} />{les.duration}
                        </span>
                      </div>
                      <span className="lesson-type-pill">{les.type}</span>
                      <i className={`fas fa-chevron-${isActive ? "up" : "down"} lesson-chev`} />
                    </button>

                    {isActive && (
                      <div className="lesson-expand">
                        <div className="video-stage">
                          {lIsVideo && lHasMedia && (
                            <video
                              ref={videoRef}
                              key={`${labKey}-${idx}`}
                              src={resolvedLessonSrc || les.src}
                              poster={resolvedThumb || undefined}
                              controls preload="auto" playsInline
                              onError={(e) => {
                                const el = e.currentTarget;
                                if (el.src && el.error) {
                                  setVideoError(`${t.videoErrorPrefix} (${el.error.code}): ${el.currentSrc}`);
                                }
                              }}
                              onLoadedMetadata={() => setVideoError("")}
                              onCanPlay={() => setVideoError("")}
                            />
                          )}
                          {lIsVideo && lHasMedia && videoError && (
                            <div className="video-empty" style={{ background: "rgba(0,0,0,0.85)", zIndex: 5 }}>
                              <div className="video-empty-icon" style={{ background: "rgba(255,80,80,0.2)" }}>
                                <i className="fas fa-triangle-exclamation" style={{ color: "#ff5050" }} />
                              </div>
                              <h4 style={{ color: "#ff8080" }}>{t.videoErrorTitle}</h4>
                              <p style={{ fontSize: 12, wordBreak: "break-all", direction: "ltr" }}>{videoError}</p>
                              <a
                                href={les.src}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{ color: "#7c6bfa", marginTop: 8, fontSize: 13, textDecoration: "underline" }}
                              >
                                {t.videoOpenNewTab}
                              </a>
                            </div>
                          )}
                          {lIsEmbed && lHasMedia && (
                            <iframe
                              ref={embedRef}
                              src={les.src}
                              title={les.title}
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          )}
                          {!lHasMedia && (
                            <div className="video-empty">
                              <div className="video-empty-icon"><i className="fas fa-video" /></div>
                              <h4>{les.title}</h4>
                              <p>{les.description}</p>
                            </div>
                          )}
                        </div>
                        <p className="lesson-desc">{les.description}</p>

                        {/* ── Attachments ── */}
                        {les.attachments && les.attachments.length > 0 && (
                          <div className="lesson-attachments">
                            {les.attachments.map((a, ai) => <AttachmentLink key={`${a.src}-${ai}`} att={a} />)}
                          </div>
                        )}

                        {/* ── Quiz / Completion area ── */}
                        <div className="lesson-actions">
                          {isDone && quizOpenFor !== idx && (
                            <div className="lesson-done-badge">
                              <i className="fas fa-circle-check" /> {t.quizPassed}
                              {les.quiz && les.quiz.length > 0 && (
                                <button
                                  className="quiz-btn ghost small"
                                  onClick={() => { pauseMedia(); setQuizOpenFor(idx); }}
                                >
                                  <i className="fas fa-rotate-right" /> {t.quizRetry}
                                </button>
                              )}
                            </div>
                          )}

                          {!isDone && quizOpenFor !== idx && (
                            les.quiz && les.quiz.length > 0 ? (
                              <button
                                className="quiz-btn primary"
                                style={{ background: config.color }}
                                onClick={() => { pauseMedia(); setQuizOpenFor(idx); }}
                              >
                                <i className="fas fa-circle-question" /> {t.quizStart}
                                <span className="quiz-count">({les.quiz.length})</span>
                              </button>
                            ) : (
                              <button
                                className="quiz-btn primary"
                                style={{ background: config.color }}
                                onClick={() => handleMarkWatched(idx)}
                              >
                                <i className="fas fa-check" /> {t.quizMarkWatched}
                              </button>
                            )
                          )}

                          {quizOpenFor === idx && les.quiz && les.quiz.length > 0 && (
                            <Quiz
                              questions={les.quiz}
                              accentColor={config.color}
                              t={t}
                              onPass={(percent) => handleQuizPass(idx, percent)}
                              onClose={() => setQuizOpenFor(null)}
                            />
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="tasks-panel">
            <div className="tasks-head">
              <h4><i className="fas fa-trophy" style={{ color: "#f7971e" }} /> {t.heroTasks}</h4>
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

          <div className="progress-panel" style={{ padding: "12px 14px" }}>
            <h4><i className="fas fa-graduation-cap" /> {t.acquiredSkills}</h4>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {config.skills.map((s) => (
                <span key={s} className="skill-tag" style={{ fontSize: 12 }}>{s}</span>
              ))}
            </div>
          </div>

        </aside>

        {/* ══ SIMULATOR AREA ══ */}
        <div className="sim-area">

          {!simReady && (
            <div className="sim-launch">
              <div className="sim-launch-icon" style={{ background: config.gradient }}>
                <i className={`fas ${config.faIcon}`} />
              </div>
              <h2 className="sim-launch-title">{config.title}</h2>
              {config.simulatorUrl ? (
                <p className="sim-launch-desc">{t.clickToLoad}</p>
              ) : (
                <p className="sim-launch-desc" style={{ opacity: 0.6 }}>
                  <i className="fas fa-circle-info" style={{ marginInlineEnd: 6 }} />
                  {config.externalUrl ? t.openNew : "—"}
                </p>
              )}
              <div className="sim-launch-meta">
                <span><i className="fas fa-child" /> {config.ageRange} {t.yearsOld}</span>
                <span><i className="fas fa-signal" /> {config.difficultyLabel}</span>
                <span><i className="fas fa-star" /> {config.tag}</span>
              </div>
              {config.simulatorUrl && (
                <button className="sim-launch-btn" onClick={launchSim} style={{ background: config.gradient }}>
                  <i className="fas fa-play" /> {t.launchSim}
                </button>
              )}
              {config.externalUrl && (
                <button
                  className="sim-launch-ext"
                  onClick={() => window.open(config.externalUrl, "_blank", "noopener,noreferrer")}
                >
                  <i className="fas fa-up-right-from-square" /> {t.openNew}
                </button>
              )}
            </div>
          )}

          {simReady && !simLoaded && (
            <div className="sim-loader">
              {!simTimedOut ? (
                <>
                  <div className="loader-spinner" style={{ borderTopColor: config.color }} />
                  <div className="loader-text">{t.loading} {config.title}...</div>
                  <div className="loader-hint">{t.loadHint}</div>
                </>
              ) : (
                <>
                  <div className="loader-text">
                    <i className="fas fa-triangle-exclamation" style={{ color: "#f7971e", marginInlineEnd: 8 }} />
                    {t.loadHint}
                  </div>
                  {config.externalUrl && (
                    <button
                      className="sim-launch-btn"
                      style={{ background: config.gradient, marginTop: 14 }}
                      onClick={() => window.open(config.externalUrl, "_blank", "noopener,noreferrer")}
                    >
                      <i className="fas fa-up-right-from-square" /> {t.openNew}
                    </button>
                  )}
                  <button className="lb-btn reload" style={{ marginTop: 10 }} onClick={reloadSim}>
                    <i className="fas fa-sync-alt" /> {t.reload}
                  </button>
                </>
              )}
            </div>
          )}

          <iframe
            ref={simRef}
            className="sim-iframe"
            style={{ display: simReady ? "block" : "none" }}
            title={`${config.title} Simulator`}
            sandbox="allow-scripts allow-same-origin allow-popups allow-forms allow-modals allow-downloads allow-pointer-lock"
            allow="fullscreen; accelerometer; camera; microphone; clipboard-write"
            onLoad={() => { if (simReady) setSimLoaded(true); }}
          />
        </div>

      </div>
    </div>
  );
}
