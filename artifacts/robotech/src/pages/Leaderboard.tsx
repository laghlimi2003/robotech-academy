import { useEffect, useMemo, useState } from "react";
import { getLeaderboard, BADGES, LEADERBOARD_STORAGE_KEY } from "../hooks/useGamification";
import { titleForLevel } from "../data/levels";
import type { Lang, T } from "../hooks/useLang";

interface LeaderboardProps {
  currentEmail: string;
  earnedBadges: string[];
  resolveBadge: (id: string) => { id: string; icon: string; color: string; title: { ar: string; en: string; fr: string }; desc: { ar: string; en: string; fr: string } } | undefined;
  lang: Lang;
  t: T;
  theme: "dark" | "light";
}

const MEDALS = ["🥇", "🥈", "🥉"];

export default function Leaderboard({ currentEmail, earnedBadges, resolveBadge, lang, t, theme }: LeaderboardProps) {
  const [tick, setTick] = useState(0);
  // Live-refresh on cross-tab profile changes AND on every mount/badges change
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === LEADERBOARD_STORAGE_KEY) setTick(n => n + 1);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  const rows = useMemo(() => getLeaderboard(), [tick, earnedBadges.length]);

  const earnedDetailed = useMemo(() => {
    return earnedBadges.map(id => resolveBadge(id)).filter((x): x is NonNullable<ReturnType<typeof resolveBadge>> => !!x);
  }, [earnedBadges, resolveBadge]);

  const lockedBadges = useMemo(() => {
    return BADGES.filter(b => !earnedBadges.includes(b.id));
  }, [earnedBadges]);

  return (
    <main className="leaderboard-view" data-theme={theme}>
      <div className="lb-hero">
        <h1><i className="fas fa-trophy" /> {t.xpLeaderboard}</h1>
        <p>{t.xpLeaderboardSub}</p>
      </div>

      <div className="lb-grid">
        {/* Ranking */}
        <section className="lb-panel">
          <h3><i className="fas fa-ranking-star" /> {t.xpRanking}</h3>
          <div className="lb-list">
            {rows.length === 0 && <p className="lb-empty">{t.xpNoOthers}</p>}
            {rows.map((row, i) => {
              const isMe = row.email === currentEmail;
              const medal = MEDALS[i];
              return (
                <div key={row.email} className={`lb-row${isMe ? " me" : ""}`}>
                  <div className="lb-rank">{medal ?? `#${i + 1}`}</div>
                  <div className="lb-avatar">{row.avatar}</div>
                  <div className="lb-meta">
                    <strong>{row.name}{isMe && <span className="lb-you"> ({t.xpYou})</span>}</strong>
                    <span>{t.xpLevel} {row.level} · {titleForLevel(row.level, lang)}</span>
                  </div>
                  <div className="lb-stats">
                    <div className="lb-stat"><i className="fas fa-star" /> {row.xp}</div>
                    {row.streak > 0 && <div className="lb-stat fire"><i className="fas fa-fire" /> {row.streak}</div>}
                    {row.badges > 0 && <div className="lb-stat"><i className="fas fa-medal" /> {row.badges}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Badges */}
        <section className="lb-panel">
          <h3><i className="fas fa-medal" /> {t.xpMyBadges} <span className="lb-badge-count">{earnedDetailed.length} / {earnedDetailed.length + lockedBadges.length}</span></h3>

          {earnedDetailed.length > 0 && (
            <div className="badge-grid">
              {earnedDetailed.map(b => (
                <div key={b.id} className="badge-card earned" style={{ borderColor: b.color }}>
                  <div className="badge-card-icon" style={{ background: b.color }}>
                    <i className={`fas ${b.icon}`} />
                  </div>
                  <strong>{b.title[lang]}</strong>
                  <span>{b.desc[lang]}</span>
                </div>
              ))}
            </div>
          )}

          {lockedBadges.length > 0 && (
            <>
              <h4 className="badge-locked-head"><i className="fas fa-lock" /> {t.xpLocked}</h4>
              <div className="badge-grid">
                {lockedBadges.map(b => (
                  <div key={b.id} className="badge-card locked">
                    <div className="badge-card-icon"><i className={`fas ${b.icon}`} /></div>
                    <strong>{b.title[lang]}</strong>
                    <span>{b.desc[lang]}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
