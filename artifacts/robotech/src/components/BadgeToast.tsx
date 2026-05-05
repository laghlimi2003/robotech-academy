import { useEffect, useState } from "react";

interface Props {
  message: string;
  visible: boolean;
  onHide: () => void;
}

export default function BadgeToast({ message, visible, onHide }: Props) {
  useEffect(() => {
    if (visible) {
      const t = setTimeout(onHide, 3500);
      return () => clearTimeout(t);
    }
  }, [visible, onHide]);

  if (!visible) return null;

  return (
    <div className="badge-toast">
      <span className="badge-toast-icon">🏆</span>
      <div>
        <div className="badge-toast-title">إنجاز جديد!</div>
        <div className="badge-toast-msg">{message}</div>
      </div>
    </div>
  );
}
