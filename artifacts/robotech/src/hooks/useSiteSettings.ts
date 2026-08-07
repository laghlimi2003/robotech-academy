import { useEffect, useState } from "react";
import { getSettings, SETTINGS_EVENT, type SiteSettings } from "../services/siteStore";

/**
 * Live site settings: re-reads when the admin saves (same tab via custom
 * event, other tabs via the storage event) so changes appear immediately.
 */
export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>(getSettings);

  useEffect(() => {
    const refresh = () => setSettings(getSettings());
    window.addEventListener(SETTINGS_EVENT, refresh);
    window.addEventListener("storage", refresh);
    return () => {
      window.removeEventListener(SETTINGS_EVENT, refresh);
      window.removeEventListener("storage", refresh);
    };
  }, []);

  return settings;
}
