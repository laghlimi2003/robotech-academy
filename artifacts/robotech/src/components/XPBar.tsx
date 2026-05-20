import { progressInLevel, titleForLevel } from "../data/levels";
import type { Lang, T } from "../hooks/useLang";

interface XPBarProps {
  xp: number;
  level: number;
  streak: number;
  lang: Lang;
  t: T;
  compact?: boolean;
  onClick?: () => void;
}

export default function XPBar({ xp, level, streak, lang, t, compact, onClick }: XPBarProps) {
  const { current, needed, percent } = progressInLevel(xp);
  const title = titleForLevel(level, lang);

  return (
    <button
      className={`xp-bar${compact ? " compact" : ""}`}
      onClick={onClick}
      title={`${t.xpLevel} ${level} · ${title} · ${xp} XP`}
    >
      <div className="xp-level-chip">
        <span className="xp-level-num">{level}</span>
      </div>
      <div className="xp-bar-body">
        {!compact && (
          <div className="xp-bar-meta">
            <span className="xp-title">{title}</span>
            <span className="xp-numbers">{current}/{needed} XP</span>
          </div>
        )}
        <div className="xp-track" aria-label={`${percent}%`}>
          <div className="xp-fill" style={{ width: `${percent}%` }} />
        </div>
      </div>
      {streak > 0 && (
        <div className="xp-streak" title={`${t.xpStreak} ${streak}`}>
          <i className="fas fa-fire" /> {streak}
        </div>
      )}
    </button>
  );
}
