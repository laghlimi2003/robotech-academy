import { useState, useEffect } from "react";
import { labsList, difficultyColors, type Difficulty } from "../data/labs";
import { getLabOverallProgress } from "../hooks/useProgress";

interface HomeProps {
  onOpenLab: (key: string) => void;
}

type Filter = "all" | Difficulty;

const stats = [
  { icon: "fa-flask",        value: "8",   label: "مختبراً تفاعلياً", grad: "linear-gradient(135deg,#7c6bfa,#a55eea)" },
  { icon: "fa-play-circle",  value: "30+", label: "درساً بالفيديو",   grad: "linear-gradient(135deg,#4facfe,#00f2fe)" },
  { icon: "fa-trophy",       value: "50+", label: "تحدياً للأبطال",   grad: "linear-gradient(135deg,#f7971e,#ffd200)" },
  { icon: "fa-star",         value: "∞",   label: "مغامرة تنتظرك",   grad: "linear-gradient(135deg,#43e97b,#38f9d7)" },
];

const howSteps = [
  { num: "١", icon: "fa-hand-pointer", title: "اختر مختبرك",    desc: "انقر على أي مختبر من الشبكة أدناه" },
  { num: "٢", icon: "fa-video",        title: "شاهد الشرح",     desc: "فيديوهات قصيرة وممتعة تشرح كل خطوة" },
  { num: "٣", icon: "fa-laptop-code",  title: "جرّب المحاكي",   desc: "طبّق مباشرةً في المحاكي التفاعلي" },
  { num: "٤", icon: "fa-trophy",       title: "أنجز المهام",     desc: "اكمل قائمة البطل واحصد إنجازاتك" },
];

export default function Home({ onOpenLab }: HomeProps) {
  const [filter, setFilter] = useState<Filter>("all");
  const [progMap, setProgMap] = useState<Record<string, number>>({});

  useEffect(() => {
    const map: Record<string, number> = {};
    labsList.forEach((lab) => {
      map[lab.key] = getLabOverallProgress(lab.key, lab.heroTasks.length, lab.lessons.length);
    });
    setProgMap(map);
  }, []);

  const filtered = filter === "all" ? labsList : labsList.filter((l) => l.difficulty === filter);

  return (
    <>
      <div className="page-content view-enter">
        <div className="home-wrap">

          {/* ── HERO ── */}
          <section className="hero-section">
            <div className="hero-badge">
              <i className="fas fa-robot" />
              أكاديمية RoboTech — منصة تعليم الروبوتيك للأطفال
            </div>
            <h1 className="hero-title">
              مرحباً يا بطل&nbsp;<br />
              <span>المستقبل! 🚀</span>
            </h1>
            <p className="hero-subtitle">
              اكتشف عالم الروبوتات والبرمجة عبر مختبرات تفاعلية مدهشة، فيديوهات احترافية،
              ومحاكيات متطورة — كل هذا مجاناً وباللغة العربية.
            </p>
            <div className="hero-cta-row">
              <button className="btn-primary" onClick={() => document.getElementById("labs")?.scrollIntoView({ behavior: "smooth" })}>
                <i className="fas fa-rocket" />
                ابدأ الاستكشاف
              </button>
              <button className="btn-outline" onClick={() => document.getElementById("how")?.scrollIntoView({ behavior: "smooth" })}>
                <i className="fas fa-info-circle" />
                كيف يعمل؟
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
                  اختر مختبرك
                </h2>
                <p>كل مختبر يحتوي على فيديوهات شرح + محاكي تفاعلي + قائمة مهام البطل</p>
              </div>
              <div className="filter-row">
                {(["all", "beginner", "intermediate", "advanced"] as Filter[]).map((f) => (
                  <button
                    key={f}
                    className={`filter-btn${filter === f ? " active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f === "all" ? "الكل" : f === "beginner" ? "مبتدئ" : f === "intermediate" ? "متوسط" : "متقدم"}
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
                    aria-label={`فتح ${lab.title}`}
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
                          {lab.lessons.length} دروس
                        </span>
                        <span className="card-meta-item">
                          <i className="fas fa-child" style={{ color: lab.color }} />
                          {lab.ageRange} سنة
                        </span>
                      </div>
                      {prog > 0 && (
                        <span style={{ fontSize: 12, fontWeight: 800, color: lab.color }}>
                          {prog}%
                        </span>
                      )}
                    </div>

                    {prog > 0 && (
                      <div className="card-progress-bar">
                        <div className="card-progress-fill" style={{ width: `${prog}%`, background: lab.gradient }} />
                      </div>
                    )}
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
                كيف تبدأ؟
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

      <footer className="site-footer">
        <i className="fas fa-robot" style={{ color: "var(--accent)", marginLeft: 8 }} />
        © 2025 أكاديمية RoboTech — تعليم الروبوتيك للجيل القادم بطريقة ممتعة وآمنة
      </footer>
    </>
  );
}
