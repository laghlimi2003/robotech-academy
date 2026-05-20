import { useEffect } from "react";
import type { Reward } from "../hooks/useGamification";
import type { Lang, T } from "../hooks/useLang";

interface RewardToastProps {
  rewards: Reward[];
  onDismiss: (id: number) => void;
  lang: Lang;
  t: T;
}

const DURATION_MS = 3200;

export default function RewardToast({ rewards, onDismiss, lang, t }: RewardToastProps) {
  // Auto-dismiss handled per toast inside Item
  return (
    <div className="reward-stack" aria-live="polite">
      {rewards.map(r => (
        <RewardItem key={r.id} reward={r} onDismiss={onDismiss} lang={lang} t={t} />
      ))}
    </div>
  );
}

function RewardItem({ reward, onDismiss, lang, t }: { reward: Reward; onDismiss: (id: number) => void; lang: Lang; t: T }) {
  useEffect(() => {
    const id = window.setTimeout(() => onDismiss(reward.id), DURATION_MS);
    return () => window.clearTimeout(id);
  }, [reward.id, onDismiss]);

  if (reward.type === "xp") {
    return (
      <div className="reward-toast xp" onClick={() => onDismiss(reward.id)}>
        <div className="reward-icon" style={{ background: "linear-gradient(135deg,#f7971e,#ffd200)" }}>
          <i className="fas fa-star" />
        </div>
        <div className="reward-text">
          <strong>+{reward.amount} XP</strong>
          <span>{t.xpEarned}</span>
        </div>
      </div>
    );
  }

  if (reward.type === "levelup") {
    return (
      <div className="reward-toast levelup" onClick={() => onDismiss(reward.id)}>
        <div className="reward-icon" style={{ background: "linear-gradient(135deg,#667eea,#764ba2)" }}>
          <i className="fas fa-arrow-up" />
        </div>
        <div className="reward-text">
          <strong>{t.xpLevelUp.replace("{n}", String(reward.level))}</strong>
          <span>{t.xpKeepGoing}</span>
        </div>
        <div className="reward-sparkles">✨</div>
      </div>
    );
  }

  // badge
  const badge = reward.badge!;
  return (
    <div className="reward-toast badge" onClick={() => onDismiss(reward.id)}>
      <div className="reward-icon" style={{ background: badge.color }}>
        <i className={`fas ${badge.icon}`} />
      </div>
      <div className="reward-text">
        <strong>🏅 {t.xpBadgeNew}</strong>
        <span>{badge.title[lang]}</span>
      </div>
    </div>
  );
}
