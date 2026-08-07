import { useState, useEffect } from "react";
import { labsList, difficultyColors, localizeLab, type Difficulty } from "../data/labs";
import { getSettings } from "../services/siteStore";

const siteSettings = getSettings();
import { getLabOverallProgress } from "../hooks/useProgress";
import type { User } from "../hooks/useAuth";
import type { T, Lang } from "../hooks/useLang";
import Footer from "../components/Footer";

interface HomeProps {
  onOpenLab: (key: string) => void;
  user: User;
  theme: "dark" | "light";
  t: T;
  lang: Lang;
}

type Filter = "all" | Difficulty;

const howStepIcons = ["fa-hand-pointer", "fa-video", "fa-laptop-code", "fa-trophy"];

export default function Home({ onOpenLab, user, t, lang }: HomeProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [progMap, setProgMap] = useState<Record<string, number>>({});

  const localized = labsList.map(l => localizeLab(l, lang));

  useEffect(() => {
    const map: Record<string, number> = {};
    localized.forEach((lab) => {
      map[lab.key] = getLabOverallProgress(lab.key, lab.heroTasks.length, lab.lessons.length, user.email);
    });
    setProgMap(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, user.email]);

  const filtered = filter === "all" ? localized : localized.filter((l) => l.difficulty === filter);

  const stats = [
    { icon: "fa-flask",       value: String(labsList.length), label: t.stat1, grad: "linear-gradient(135deg,#7c6bfa,#a55eea)" },
    { icon: "fa-play-circle", value: "30+",                   label: t.stat2, grad: "linear-gradient(135deg,#4facfe,#00f2fe)" },
    { icon: "fa-trophy",      value: "50+",                   label: t.stat3, grad: "linear-gradient(135deg,#f7971e,#ffd200)" },
    { icon: "fa-star",        value: "∞",                     label: t.stat4, grad: "linear-gradient(135deg,#43e97b,#38f9d7)" },
  ];

  const numerals = lang === "ar" ? ["١", "٢", "٣", "٤"] : ["1", "2", "3", "4"];
  const howSteps = [
    { num: numerals[0], icon: howStepIcons[0], title: t.how1Title, desc: t.how1Desc },
    { num: numerals[1], icon: howStepIcons[1], title: t.how2Title, desc: t.how2Desc },
    { num: numerals[2], icon: howStepIcons[2], title: t.how3Title, desc: t.how3Desc },
    { num: numerals[3], icon: howStepIcons[3], title: t.how4Title, desc: t.how4Desc },
  ];

  return (
    <>
      <div className="page-content view-enter">
        <div className="home-wrap">

          {/* ── HERO ── */}
          <section className="hero-section">
            <div className="hero-badge">
              <i className="fas fa-robot" />
              {t.heroBadge}
            </div>
            <h1 className="hero-title">
              <bdi>{t.heroTitle1} {user.avatar} {user.name}</bdi><br />
              <span>{t.heroTitle2}</span>
            </h1>
            <p className="hero-subtitle">{siteSettings.bannerText || t.heroSub}</p>
            <div className="hero-cta-row">
              <button className="btn-primary" onClick={() => document.getElementById("labs")?.scrollIntoView({ behavior: "smooth" })}>
                <i className="fas fa-rocket" /> {t.startExplore}
              </button>
              <button className="btn-outline" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
                <i className="fas fa-info-circle" /> {t.howItWork}
              </button>
            </div>
          </section>

          {/* ── STATS ── */}
          <div className="stats-row">
            {stats.map((s) => (
              <div key={s.label} className="stat-card">
                <div className="stat-icon" style={{ background: s.grad }}>
                  <i className={`fas ${s.icon}`} />
                </div>
                <span className="stat-value">{s.value}</span>
                <span className="stat-label">{s.label}</span>
              </div>
            ))}
          </div>

          {/* ── LABS SECTION ── */}
          <section id="labs">
            <div className="section-head">
              <div>
                <h2>
                  <i className="fas fa-th-large" style={{ color: "var(--accent)" }} />
                  {t.chooseLab}
                </h2>
                <p>{t.labsDesc}</p>
              </div>
              <div className="filter-row">
                {(["all", "beginner", "intermediate", "advanced"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    className={`filter-btn${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? t.filterAll : f === "beginner" ? t.filterBeg : f === "intermediate" ? t.filterInt : t.filterAdv}
                  </button>
                ))}
              </div>
            </div>

            <div className="labs-grid">
              {filtered.map((lab) => {
                const prog = progMap[lab.key] ?? 0;
                return (
                  <article
                    key={lab.key}
                    className="lab-card"
                    style={{ "--card-grad": `linear-gradient(135deg, ${lab.color}14, transparent)` } as React.CSSProperties}
                    onClick={() => onOpenLab(lab.key)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpenLab(lab.key); } }}
                    tabIndex={0}
                    role="button"
                    aria-label={`${t.enterLab} ${lab.title}`}
                  >
                    <div className="card-glow" style={{ background: lab.glowColor }} />

                    <div className="card-top-row">
                      <div className="card-icon-wrap" style={{ background: lab.gradient }}>
                        <i className={`fas ${lab.faIcon}`} />
                      </div>
                      <div className="card-badges">
                        <span className="badge-tag">{lab.tag}</span>
                        <span
                          className="badge-difficulty"
                          style={{ background: `${difficultyColors[lab.difficulty]}22`, color: difficultyColors[lab.difficulty], border: `1px solid ${difficultyColors[lab.difficulty]}44` }}
                        >
                          {lab.difficultyLabel}
                        </span>
                      </div>
                    </div>

                    <div className="card-body">
                      <h3>{lab.title}</h3>
                      <p>{lab.description}</p>
                    </div>

                    <div className="card-skills">
                      {lab.skills.slice(0, 3).map((s) => (
                        <span key={s} className="skill-tag">{s}</span>
                      ))}
                    </div>

                    <div className="card-footer">
                      <div className="card-meta">
                        <span className="card-meta-item">
                          <i className="fas fa-play-circle" style={{ color: lab.color }} />
                          {lab.lessons.length} {t.lessons}
                        </span>
                        <span className="card-meta-item">
                          <i className="fas fa-child" style={{ color: lab.color }} />
                          {lab.ageRange} {t.yearsOld}
                        </span>
                      </div>
                      {prog > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: lab.color }}>{prog}%</span>
                      )}
                    </div>

                    {prog > 0 && (
                      <div className="card-progress-bar">
                        <div className="card-progress-fill" style={{ width: `${prog}%`, background: lab.gradient }} />
                      </div>
                    )}

                    <div className="card-enter-btn" style={{ background: lab.gradient }}>
                      <i className="fas fa-play" /> {t.enterLab}
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          {/* ── HOW IT WORKS ── */}
          <section id="how" className="how-section">
            <div className="section-head">
              <h2>
                <i className="fas fa-question-circle" style={{ color: "var(--accent-2)" }} />
                {t.howTitle}
              </h2>
            </div>
            <div className="how-grid">
              {howSteps.map((s) => (
                <div key={s.num} className="how-step">
                  <div className="how-num">{s.num}</div>
                  <div className="how-icon-box">
                    <i className={`fas ${s.icon}`} />
                  </div>
                  <h4>{s.title}</h4>
                  <p>{s.desc}</p>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>

      <Footer t={t} />
    </>
  );
}
