import { useRef, useState, useEffect, useId } from "react";
import type { T, Lang } from "../hooks/useLang";
import type { LocalizedLab } from "../data/labs";

interface CertificateProps {
  userName: string;
  lab: LocalizedLab;
  lang: Lang;
  t: T;
  onClose: () => void;
}

function formatDate(lang: Lang): string {
  const d = new Date();
  const locale = lang === "ar" ? "ar-EG" : lang === "fr" ? "fr-FR" : "en-US";
  return d.toLocaleDateString(locale, { year: "numeric", month: "long", day: "numeric" });
}

export default function Certificate({ userName, lab, lang, t, onClose }: CertificateProps) {
  const paperRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const [busy, setBusy] = useState(false);
  const date = formatDate(lang);
  const certId = `RT-${lab.key.toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  // A11y: focus management, Escape to close, basic focus trap
  useEffect(() => {
    previouslyFocused.current = document.activeElement as HTMLElement | null;
    closeBtnRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key === "Tab" && boxRef.current) {
        const focusables = boxRef.current.querySelectorAll<HTMLElement>(
          'button, [href], input, [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      previouslyFocused.current?.focus?.();
    };
  }, [onClose]);

  const download = async () => {
    if (!paperRef.current || busy) return;
    setBusy(true);
    try {
      // Wait for webfonts (Cairo + Font Awesome) to be ready for accurate capture.
      try { await document.fonts?.ready; } catch { /* noop */ }

      // Lazy-load heavy libs only on demand.
      const [{ default: jsPDF }, { default: html2canvas }] = await Promise.all([
        import("jspdf"),
        import("html2canvas"),
      ]);

      const canvas = await html2canvas(paperRef.current, {
        scale: 2,
        backgroundColor: "#fdfaf4",
        useCORS: true,
        logging: false,
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
      const pageW = pdf.internal.pageSize.getWidth();
      const pageH = pdf.internal.pageSize.getHeight();
      const ratio = canvas.width / canvas.height;
      let w = pageW;
      let h = pageW / ratio;
      if (h > pageH) { h = pageH; w = pageH * ratio; }
      const x = (pageW - w) / 2;
      const y = (pageH - h) / 2;
      pdf.addImage(imgData, "PNG", x, y, w, h);
      const safeName = userName.replace(/[^\p{L}\p{N}\s_-]/gu, "").trim().replace(/\s+/g, "_") || "student";
      pdf.save(`RoboTech-${lab.key}-${safeName}.pdf`);
    } catch (err) {
      console.error("Certificate PDF error:", err);
      alert(t.certError);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="cert-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} onClick={onClose}>
      <div className="cert-box" ref={boxRef} onClick={(e) => e.stopPropagation()}>
        <div className="cert-toolbar">
          <h3 id={titleId}><i className="fas fa-award" /> {t.certTitle}</h3>
          <div className="cert-toolbar-actions">
            <button
              className="quiz-btn primary"
              style={{ background: lab.gradient }}
              onClick={download}
              disabled={busy}
            >
              {busy
                ? <><i className="fas fa-spinner fa-spin" /> {t.certPreparing}</>
                : <><i className="fas fa-download" /> {t.certDownload}</>}
            </button>
            <button className="quiz-btn ghost" ref={closeBtnRef} onClick={onClose}>
              <i className="fas fa-xmark" /> {t.quizClose}
            </button>
          </div>
        </div>

        <div className="cert-scroll">
          <div
            ref={paperRef}
            className="cert-paper"
            dir={lang === "ar" ? "rtl" : "ltr"}
            style={{ ["--cert-accent" as string]: lab.color, ["--cert-grad" as string]: lab.gradient }}
          >
            {/* Decorative corners */}
            <div className="cert-corner tl" style={{ background: lab.gradient }} />
            <div className="cert-corner tr" style={{ background: lab.gradient }} />
            <div className="cert-corner bl" style={{ background: lab.gradient }} />
            <div className="cert-corner br" style={{ background: lab.gradient }} />

            {/* Inner border */}
            <div className="cert-border" />

            {/* Watermark icon */}
            <div className="cert-watermark">
              <i className={`fas ${lab.faIcon}`} />
            </div>

            <div className="cert-content">
              <div className="cert-header">
                <div className="cert-logo" style={{ background: lab.gradient }}>
                  <i className="fas fa-robot" />
                </div>
                <div className="cert-brand">
                  <div className="cert-brand-name" style={{ color: lab.color }}>RoboTech Academy</div>
                  <div className="cert-brand-sub">{t.certBrandSub}</div>
                </div>
              </div>

              <h1 className="cert-title">{t.certHeadline}</h1>
              <div className="cert-rule" style={{ background: lab.gradient }} />
              <p className="cert-presented">{t.certPresentedTo}</p>

              <div className="cert-name" style={{ color: lab.color }}>{userName}</div>

              <p className="cert-body">{t.certForCompleting}</p>
              <div className="cert-labname" style={{ color: lab.color }}>
                <i className={`fas ${lab.faIcon}`} /> {lab.title}
              </div>
              <p className="cert-sub">{lab.subtitle}</p>

              <div className="cert-skills">
                {lab.skills.slice(0, 4).map((s, i) => (
                  <span key={i} className="cert-skill" style={{ borderColor: lab.color, color: lab.color }}>
                    {s}
                  </span>
                ))}
              </div>

              <div className="cert-footer">
                <div className="cert-foot-block">
                  <div className="cert-foot-label">{t.certDate}</div>
                  <div className="cert-foot-value">{date}</div>
                </div>
                <div className="cert-seal" style={{ background: lab.gradient }}>
                  <div className="cert-seal-inner">
                    <i className="fas fa-trophy" />
                    <span>RoboTech</span>
                  </div>
                </div>
                <div className="cert-foot-block">
                  <div className="cert-foot-label">{t.certId}</div>
                  <div className="cert-foot-value cert-foot-id">{certId}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
