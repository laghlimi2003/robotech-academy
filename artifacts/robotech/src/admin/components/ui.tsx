import { useState, useCallback, useEffect } from "react";
import { createPortal } from "react-dom";
import type { Localized } from "../../data/labs";

/* ── Toast (success / error messages) ─────────────────────── */

export interface ToastState { msg: string; type: "success" | "error" }

export function useCmsToast() {
  const [toast, setToast] = useState<ToastState | null>(null);
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3200);
    return () => clearTimeout(t);
  }, [toast]);
  const show = useCallback((msg: string, type: "success" | "error" = "success") => setToast({ msg, type }), []);
  const node = toast ? (
    <div className={`cms-toast ${toast.type}`}>
      <i className={`fas ${toast.type === "success" ? "fa-circle-check" : "fa-circle-exclamation"}`} /> {toast.msg}
    </div>
  ) : null;
  return { show, node };
}

/* ── Modal ─────────────────────────────────────────────────── */

export function CmsModal({ title, onClose, children, wide }: {
  title: string; onClose: () => void; children: React.ReactNode; wide?: boolean;
}) {
  // Portal to <body>: modals may be opened from inside a <form> or <label>
  // (e.g. media picker inside a Field) — rendering in place lets label click
  // forwarding and form semantics interfere with the modal's controls.
  return createPortal(
    <div className="admin-overlay" onClick={onClose}>
      <div className={`cms-modal${wide ? " wide" : ""}`} onClick={e => e.stopPropagation()}>
        <div className="cms-modal-head">
          <h3>{title}</h3>
          <button className="cms-icon-btn" onClick={onClose} aria-label="إغلاق"><i className="fas fa-xmark" /></button>
        </div>
        <div className="cms-modal-body">{children}</div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Confirm dialog ────────────────────────────────────────── */

export function CmsConfirm({ message, onYes, onNo }: { message: string; onYes: () => void; onNo: () => void }) {
  return createPortal(
    <div className="admin-overlay" onClick={onNo}>
      <div className="admin-confirm" onClick={e => e.stopPropagation()}>
        <i className="fas fa-triangle-exclamation" style={{ color: "#fa5252", fontSize: 32 }} />
        <p style={{ margin: "8px 0 0" }}>{message}</p>
        <div className="admin-confirm-btns">
          <button className="admin-confirm-cancel" onClick={onNo}>إلغاء</button>
          <button className="admin-confirm-delete" onClick={onYes}><i className="fas fa-trash" /> تأكيد</button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* ── Form fields ───────────────────────────────────────────── */

export function Field({ label, children, hint }: { label: string; children: React.ReactNode; hint?: string }) {
  return (
    <label className="cms-field">
      <span className="cms-field-label">{label}</span>
      {children}
      {hint && <span className="cms-field-hint">{hint}</span>}
    </label>
  );
}

export function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input className="cms-input" {...props} />;
}

export function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className="cms-input cms-textarea" rows={3} {...props} />;
}

const LANG_LABELS = { ar: "عربي", en: "EN", fr: "FR" } as const;

/** Trilingual text field. Arabic is required; EN/FR fall back to Arabic when empty on save. */
export function LocInput({ label, value, onChange, multiline, requiredAr }: {
  label: string;
  value: Localized<string>;
  onChange: (v: Localized<string>) => void;
  multiline?: boolean;
  requiredAr?: boolean;
}) {
  const C = multiline ? TextArea : TextInput;
  return (
    <div className="cms-field">
      <span className="cms-field-label">{label}{requiredAr && <b className="cms-req">*</b>}</span>
      <div className="cms-loc-grid">
        {(["ar", "en", "fr"] as const).map(l => (
          <div key={l} className="cms-loc-cell">
            <span className="cms-loc-tag">{LANG_LABELS[l]}</span>
            <C
              value={value[l]}
              dir={l === "ar" ? "rtl" : "ltr"}
              onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
                onChange({ ...value, [l]: e.target.value })}
            />
          </div>
        ))}
      </div>
    </div>
  );
}

export function Toggle({ checked, onChange, labels = ["ظاهر", "مخفي"] }: {
  checked: boolean; onChange: (v: boolean) => void; labels?: [string, string] | string[];
}) {
  return (
    <button
      type="button"
      className={`cms-toggle${checked ? " on" : ""}`}
      onClick={() => onChange(!checked)}
    >
      <span className="cms-toggle-knob" />
      <span className="cms-toggle-label">{checked ? labels[0] : labels[1]}</span>
    </button>
  );
}

/* ── Reorder buttons ───────────────────────────────────────── */

export function OrderBtns({ onUp, onDown, upDisabled, downDisabled }: {
  onUp: () => void; onDown: () => void; upDisabled?: boolean; downDisabled?: boolean;
}) {
  return (
    <span className="cms-order-btns">
      <button className="cms-icon-btn" onClick={onUp} disabled={upDisabled} aria-label="أعلى"><i className="fas fa-arrow-up" /></button>
      <button className="cms-icon-btn" onClick={onDown} disabled={downDisabled} aria-label="أسفل"><i className="fas fa-arrow-down" /></button>
    </span>
  );
}

/* ── Common bits ───────────────────────────────────────────── */

export function AddBtn({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return <button className="cms-add-btn" onClick={onClick}><i className="fas fa-plus" /> {children}</button>;
}

export function SaveBtn({ onClick, children = "حفظ" }: { onClick?: () => void; children?: React.ReactNode }) {
  return <button type="submit" className="cms-save-btn" onClick={onClick}><i className="fas fa-check" /> {children}</button>;
}

export function EmptyLoc(): Localized<string> {
  return { ar: "", en: "", fr: "" };
}

/** Fill empty EN/FR with the Arabic text before persisting. */
export function fillLoc(v: Localized<string>): Localized<string> {
  return { ar: v.ar.trim(), en: v.en.trim() || v.ar.trim(), fr: v.fr.trim() || v.ar.trim() };
}

/** Small lab picker used by lesson/quiz/task modules. */
export function LabPicker({ labs, value, onChange }: {
  labs: { key: string; label: string }[]; value: string; onChange: (key: string) => void;
}) {
  return (
    <select className="cms-input cms-select" value={value} onChange={e => onChange(e.target.value)}>
      {labs.map(l => <option key={l.key} value={l.key}>{l.label}</option>)}
    </select>
  );
}
