import { useMemo } from "react";
import { labsList, difficultyColors, localizeLab } from "../data/labs";
import { getLabOverallProgress, loadRawProgress } from "../hooks/useProgress";
import { BADGES, type Badge } from "../data/badges";
import type { User } from "../hooks/useAuth";
import type { T, Lang } from "../hooks/useLang";
import Footer from "../components/Footer";
import ProgressRing from "../components/ProgressRing";

interface DashboardProps {
  user: User;
  t: T;
  lang: Lang;
  onOpenLab: (key: string) => void;
  earnedBadgeIds: string[];
  resolveBadge: (id: string) => Badge | undefined;
}

export default function Dashboard({ user, t, lang, onOpenLab, earnedBadgeIds, resolveBadge }: DashboardProps) {
  const raw = useMemo(() => loadRawProgress(user.email), [user.email]);

  const labStats = useMemo(() => labsList.map(rawLab => {
    const lab = localizeLab(rawLab, lang);
    const prog = raw[lab.key];
    const doneTasks   = prog?.doneTasks?.length ?? 0;
    const doneLessons = prog?.completedLessons?.length ?? 0;
    const overall     = getLabOverallProgress(lab.key, lab.heroTasks.length, lab.lessons.length, user.email);
    return { lab, doneTasks, doneLessons, overall };
  }), [raw, lang, user.email]);

  const totalTasks   = labStats.reduce((s, l) => s + l.doneTasks, 0);
  const totalLessons = labStats.reduce((s, l) => s + l.doneLessons, 0);
  const activeLabs   = labStats.filter(l => l.overall > 0).length;
  const overallPct   = Math.round(
    labStats.reduce((s, l) => s + l.overall, 0) / labsList.length
  );

  // Unified badge system — same catalog as XP/Leaderboard (useGamification)
  const earnedSet = useMemo(() => new Set(earnedBadgeIds), [earnedBadgeIds]);
  const masterBadges = useMemo(
    () => earnedBadgeIds
      .filter(id => id.startsWith("master_"))
      .map(id => resolveBadge(id))
      .filter((b): b is Badge => !!b),
    [earnedBadgeIds, resolveBadge]
  );
  const catalog: Badge[] = useMemo(() => [...BADGES, ...masterBadges], [masterBadges]);
  const earnedBadges = catalog.filter(b => earnedSet.has(b.id));

  const dashTitle   = lang === "ar" ? "لوحة التقدم"       : lang === "en" ? "Progress Dashboard"   : "Tableau de Bord";
  const dashSub     = lang === "ar" ? `أداء ${user.name} في الأكاديمية` : lang === "en" ? `${user.name}'s Academy Performance` : `Performances de ${user.name}`;
  const labsTitle   = lang === "ar" ? "تقدمك في المختبرات" : lang === "en" ? "Labs Progress"       : "Progression des Labos";
  const badgesTitle = lang === "ar" ? "إنجازاتك وشاراتك"   : lang === "en" ? "Badges & Achievements" : "Badges & Récompenses";
  const openBtn     = lang === "ar" ? "فتح المختبر"        : lang === "en" ? "Open Lab"             : "Ouvrir le Labo";
  const noBadges    = lang === "ar" ? "أكمل مهام ودروساً لتحصد شاراتك!" : lang === "en" ? "Complete tasks & lessons to earn badges!" : "Complétez des tâches pour gagner des badges!";
  const totalTasksLbl   = lang === "ar" ? "مهمة مكتملة"  : lang === "en" ? "Tasks Done"     : "Tâches Faites";
  const totalLessonsLbl = lang === "ar" ? "درس مكتمل"    : lang === "en" ? "Lessons Done"   : "Leçons Faites";
  const activeLabsLbl   = lang === "ar" ? "مختبر نشط"   : lang === "en" ? "Active Labs"     : "Labos Actifs";
  const overallLbl      = lang === "ar" ? "التقدم الكلي" : lang === "en" ? "Overall Progress" : "Progression Globale";

  return (
    <div className="page-content view-enter">
      <div className="home-wrap">

        {/* ── HERO ── */}
        <section className="dash-hero">
          <div className="dash-hero-text">
            <div className="hero-badge">
              <i className="fas fa-chart-bar" /> {dashTitle}
            </div>
            <h1 className="hero-title" style={{ fontSize: "clamp(1.4rem,3vw,2.2rem)", marginBottom: 8 }}>
              {user.avatar} {dashSub}
            </h1>
          </div>
          <div className="dash-ring-wrap">
            <ProgressRing percent={overallPct} size={110} stroke={9} color="var(--accent)" />
            <span className="dash-ring-label">{overallLbl}</span>
          </div>
        </section>

        {/* ── STATS ROW ── */}
        <div className="stats-row" style={{ marginBottom: 40 }}>
          {[
            { icon: "fa-check-circle", value: String(totalTasks),   label: totalTasksLbl,   grad: "linear-gradient(135deg,#43e97b,#38f9d7)" },
            { icon: "fa-play-circle",  value: String(totalLessons), label: totalLessonsLbl, grad: "linear-gradient(135deg,#4facfe,#00f2fe)" },
            { icon: "fa-flask",        value: `${activeLabs}/${labsList.length}`, label: activeLabsLbl, grad: "linear-gradient(135deg,#7c6bfa,#a55eea)" },
            { icon: "fa-medal",        value: String(earnedBadges.length), label: lang === "ar" ? "شارات مكتسبة" : lang === "en" ? "Badges Earned" : "Badges Gagnés", grad: "linear-gradient(135deg,#f7971e,#ffd200)" },
          ].map(s => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ background: s.grad }}>
                <i className={`fas ${s.icon}`} />
              </div>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── LABS PROGRESS ── */}
        <section style={{ marginBottom: 48 }}>
          <div className="section-head">
            <h2>
              <i className="fas fa-flask" style={{ color: "var(--accent)" }} />
              {labsTitle}
            </h2>
          </div>
          <div className="dash-labs-grid">
            {labStats.map(({ lab, doneTasks, doneLessons, overall }) => (
              <div key={lab.key} className="dash-lab-card" style={{ "--card-grad": `linear-gradient(135deg, ${lab.color}14, transparent)` } as React.CSSProperties}>
                <div className="dash-lab-top">
                  <div className="dash-lab-icon" style={{ background: lab.gradient }}>
                    <i className={`fas ${lab.faIcon}`} />
                  </div>
                  <div className="dash-lab-info">
                    <h3>{lab.title}</h3>
                    <span className="badge-difficulty" style={{
                      background: `${difficultyColors[lab.difficulty]}22`,
                      color: difficultyColors[lab.difficulty],
                      border: `1px solid ${difficultyColors[lab.difficulty]}44`,
                      fontSize: 11, padding: "2px 8px", borderRadius: 20
                    }}>
                      {lab.difficultyLabel}
                    </span>
                  </div>
                  <div className="dash-lab-ring">
                    <ProgressRing percent={overall} size={58} stroke={5} color={lab.color} />
                  </div>
                </div>

                <div className="dash-lab-bars">
                  <div className="dash-bar-row">
                    <span><i className="fas fa-tasks" style={{ color: lab.color }} /> {doneTasks}/{lab.heroTasks.length}</span>
                    <div className="dash-bar-track">
                      <div className="dash-bar-fill" style={{ width: `${lab.heroTasks.length > 0 ? (doneTasks / lab.heroTasks.length) * 100 : 0}%`, background: lab.gradient }} />
                    </div>
                  </div>
                  <div className="dash-bar-row">
                    <span><i className="fas fa-play-circle" style={{ color: lab.color }} /> {doneLessons}/{lab.lessons.length}</span>
                    <div className="dash-bar-track">
                      <div className="dash-bar-fill" style={{ width: `${lab.lessons.length > 0 ? (doneLessons / lab.lessons.length) * 100 : 0}%`, background: lab.gradient }} />
                    </div>
                  </div>
                </div>

                <button className="dash-open-btn" style={{ background: lab.gradient }} onClick={() => onOpenLab(lab.key)}>
                  <i className="fas fa-play" /> {openBtn}
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* ── BADGES ── */}
        <section style={{ marginBottom: 48 }}>
          <div className="section-head">
            <h2>
              <i className="fas fa-trophy" style={{ color: "#ffd200" }} />
              {badgesTitle}
            </h2>
          </div>
          {earnedBadges.length === 0 ? (
            <div className="dash-no-badges">
              <span style={{ fontSize: 48 }}>🎯</span>
              <p>{noBadges}</p>
            </div>
          ) : (
            <div className="dash-badges-grid">
              {catalog.map(b => {
                const earned = earnedSet.has(b.id);
                return (
                  <div key={b.id} className={`dash-badge${earned ? " earned" : " locked"}`} title={b.desc[lang]}>
                    <span className="dash-badge-icon">
                      {earned
                        ? <i className={`fas ${b.icon}`} style={{ color: b.color }} />
                        : "🔒"}
                    </span>
                    <span className="dash-badge-label">{b.title[lang]}</span>
                  </div>
                );
              })}
            </div>
          )}
        </section>

      </div>

      <Footer t={t} />
    </div>
  );
}
