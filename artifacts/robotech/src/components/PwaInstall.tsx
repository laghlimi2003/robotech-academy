import { useEffect, useState } from "react";
import type { T } from "../hooks/useLang";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "robotech_pwa_dismissed_v1";
const DISMISS_DAYS = 7;

function isStandalone(): boolean {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // iOS Safari
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
}

function isIOS(): boolean {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  if ((window as Window & { MSStream?: unknown }).MSStream) return false;
  if (/iPad|iPhone|iPod/.test(ua)) return true;
  // iPadOS 13+ reports as MacIntel but has touch — detect via maxTouchPoints
  if (navigator.platform === "MacIntel" && (navigator.maxTouchPoints ?? 0) > 1) return true;
  return false;
}

function canPromptInstall(): boolean {
  // Chromium browsers fire beforeinstallprompt. Safari/Firefox don't —
  // show manual A2HS guidance there too.
  if (typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isChromium = /Chrome|Edg|OPR|SamsungBrowser/.test(ua) && !/Edge\//.test(ua);
  return isChromium;
}

function wasRecentlyDismissed(): boolean {
  try {
    const raw = localStorage.getItem(DISMISS_KEY);
    if (!raw) return false;
    const ts = Number(raw);
    if (!ts) return false;
    return Date.now() - ts < DISMISS_DAYS * 24 * 60 * 60 * 1000;
  } catch { return false; }
}

export default function PwaInstall({ t }: { t: T }) {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIOS, setShowIOS] = useState(false);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) { setInstalled(true); return; }
    if (wasRecentlyDismissed()) return;

    const onPrompt = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => { setInstalled(true); setDeferred(null); };

    window.addEventListener("beforeinstallprompt", onPrompt);
    window.addEventListener("appinstalled", onInstalled);

    // iOS Safari + other browsers without beforeinstallprompt → manual A2HS guidance
    let id: number | undefined;
    if (isIOS() || !canPromptInstall()) {
      id = window.setTimeout(() => setShowIOS(true), 4000);
    }

    return () => {
      if (id !== undefined) window.clearTimeout(id);
      window.removeEventListener("beforeinstallprompt", onPrompt);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  const install = async () => {
    if (!deferred) return;
    try {
      await deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === "dismissed") {
        try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* noop */ }
      }
    } catch (e) {
      console.error("PWA install error:", e);
    } finally {
      setDeferred(null);
    }
  };

  const dismiss = () => {
    try { localStorage.setItem(DISMISS_KEY, String(Date.now())); } catch { /* noop */ }
    setDeferred(null);
    setShowIOS(false);
  };

  if (installed) return null;
  if (!deferred && !showIOS) return null;

  return (
    <div className="pwa-banner" role="dialog" aria-live="polite">
      <div className="pwa-banner-icon"><i className="fas fa-mobile-screen-button" /></div>
      <div className="pwa-banner-text">
        <strong>{t.pwaInstallTitle}</strong>
        <span>{deferred ? t.pwaInstallHint : t.pwaIOSHint}</span>
      </div>
      <div className="pwa-banner-actions">
        {deferred && (
          <button className="pwa-btn primary" onClick={install}>
            <i className="fas fa-download" /> {t.pwaInstallBtn}
          </button>
        )}
        <button className="pwa-btn ghost" onClick={dismiss} aria-label={t.pwaDismiss}>
          <i className="fas fa-xmark" />
        </button>
      </div>
    </div>
  );
}
