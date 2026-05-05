import { labsList } from "../data/labs";

interface HomeProps {
  onOpenLab: (key: string) => void;
}

const iconMap: Record<string, string> = {
  scratch: "🧩",
  arduino: "⚡",
  wedo: "🤖",
  gears: "⚙️",
  advanced: "🏭",
};

export default function Home({ onOpenLab }: HomeProps) {
  return (
    <>
      <main className="home-container">
        <section className="welcome-section">
          <span className="hero-badge">منصة تعليمية تفاعلية</span>
          <h1 className="glow-text">مرحباً بك يا بطل المستقبل! 🚀</h1>
          <p className="subtitle">
            اكتشف عالم الروبوتات والبرمجة من خلال مختبرات تفاعلية ممتعة وآمنة،
            مع فيديوهات شرح منظمة لكل مسار تعليمي.
          </p>
        </section>

        <section className="cards-grid">
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
                <span style={{ fontSize: 36 }}>{iconMap[lab.key]}</span>
              </div>
              <div className="card-info">
                <h3>{lab.title}</h3>
                <p>{lab.subtitle}</p>
              </div>
            </article>
          ))}
        </section>
      </main>

      <footer className="footer">
        <p>© 2026 أكاديمية RoboTech - تعليم الروبوتات بطريقة ممتعة وآمنة</p>
      </footer>
    </>
  );
}
