import { useEffect, useState } from "react";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
  title?: string;
}

export default function BadgeToast({ message, visible, onHide, title = "🏆" }: Props) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3500);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="badge-toast">
      <span className="badge-toast-icon">🏆</span>
      <div>
        <div className="badge-toast-title">{title}</div>
        <div className="badge-toast-msg">{message}</div>
      </div>
    </div>
  );
}
