import { useEffect, useState } from "react";
import { resolveMediaUrl, isMediaUrl } from "../services/mediaStore";

/**
 * Resolves `media://<id>` references (Media Library files) to displayable
 * object URLs. Regular URLs/paths pass through unchanged synchronously.
 */
export function useMediaUrl(src: string | undefined): string {
  const [url, setUrl] = useState(() => (src && !isMediaUrl(src) ? src : ""));

  useEffect(() => {
    let alive = true;
    if (!src) { setUrl(""); return; }
    if (!isMediaUrl(src)) { setUrl(src); return; }
    resolveMediaUrl(src).then(u => { if (alive) setUrl(u); });
    return () => { alive = false; };
  }, [src]);

  return url;
}
