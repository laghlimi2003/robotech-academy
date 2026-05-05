import { labsList } from "../data/labs";

interface HomeProps {
  onOpenLab: (key: string) => void;
}

const faIconMap: Record<string, string> = {
  scratch:  "fa-puzzle-piece",
  arduino:  "fa-microchip",
  wedo:     "fa-robot",
  gears:    "fa-cog",
  advanced: "fa-industry",
};

const stats = [
  { icon: "fa-flask",       value: "5",   label: "مختبرات تفاعلية" },
  { icon: "fa-play-circle", value: "15+", label: "فيديو تعليمي" },
  { icon: "fa-trophy",      value: "25+", label: "تحدي للأبطال" },
  { icon: "fa-users",       value: "∞",   label: "مستخدم" },
];

export default function Home({ onOpenLab }: HomeProps) {
  return (
    <>
      <main className="home-container">
        {/* ===== HERO ===== */}
        <section className="welcome-section">
          <span className="hero-badge">
            <i className="fas fa-star" style={{ marginLeft: 6 }} />
            منصة تعليمية تفاعلية
          </span>
          <h1 className="glow-text">مرحباً بك يا بطل المستقبل! 🚀</h1>
          <p className="subtitle">
            اكتشف عالم الروبوتات والبرمجة من خلال مختبرات تفاعلية ممتعة وآمنة،
            مع فيديوهات شرح منظمة لكل مسار تعليمي.
          </p>
        </section>

        {/* ===== STATS ===== */}
        <section className="stats-row">
          {stats.map((s) => (
            <div key={s.label} className="stat-card glass-card">
              <div className="stat-icon">
                <i className={`fas ${s.icon}`} />
              </div>
              <span className="stat-value">{s.value}</span>
              <span className="stat-label">{s.label}</span>
            </div>
          ))}
        </section>

        {/* ===== LABS GRID ===== */}
        <section className="labs-section-title">
          <h2>
            <i className="fas fa-th-large" style={{ marginLeft: 10, color: "#6c5ce7" }} />
            اختر مختبرك
          </h2>
          <p>كل مختبر يحتوي على دروس فيديو، محاكي تفاعلي، وقائمة مهام البطل</p>
        </section>

        <section className="cards-grid" id="labs-section">
          {labsList.map((lab) => (
            <article
              key={lab.key}
              className="premium-card"
              onClick={() => onOpenLab(lab.key)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  onOpenLab(lab.key);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={`فتح ${lab.title}`}
            >
              <div className={`icon-box ${lab.iconClass}`}>
                <i className={`fas ${faIconMap[lab.key]}`} />
              </div>
              <div className="card-info">
                <h3>{lab.title}</h3>
                <p>{lab.subtitle}</p>
              </div>
              <div className="card-arrow">
                <i className="fas fa-arrow-left" />
              </div>
            </article>
          ))}
        </section>

        {/* ===== HOW IT WORKS ===== */}
        <section className="how-section">
          <h2 className="how-title">كيف يعمل؟</h2>
          <div className="how-grid">
            <div className="how-step glass-card">
              <div className="how-num">١</div>
              <i className="fas fa-hand-pointer how-icon" />
              <h4>اختر مختبرك</h4>
              <p>انقر على أي مختبر من البطاقات أعلاه</p>
            </div>
            <div className="how-step glass-card">
              <div className="how-num">٢</div>
              <i className="fas fa-video how-icon" />
              <h4>شاهد الفيديو</h4>
              <p>استمع للشرح واتبع خطوات الدرس</p>
            </div>
            <div className="how-step glass-card">
              <div className="how-num">٣</div>
              <i className="fas fa-laptop-code how-icon" />
              <h4>جرّب المحاكي</h4>
              <p>طبّق ما تعلمته مباشرةً في المحاكي</p>
            </div>
            <div className="how-step glass-card">
              <div className="how-num">٤</div>
              <i className="fas fa-trophy how-icon" />
              <h4>أنجز المهام</h4>
              <p>أكمل مهام البطل واحصد إنجازاتك</p>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          <i className="fas fa-robot" style={{ marginLeft: 8, color: "#6c5ce7" }} />
          © 2026 أكاديمية RoboTech - تعليم الروبوتات بطريقة ممتعة وآمنة
        </p>
      </footer>
    </>
  );
}
