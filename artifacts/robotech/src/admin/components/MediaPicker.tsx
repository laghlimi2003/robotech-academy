import { useEffect, useRef, useState } from "react";
import {
  listMedia, uploadMedia, mediaUrl, formatSize,
  type MediaItem, type MediaCategory,
} from "../../services/mediaStore";
import { MediaThumb } from "../modules/MediaModule";
import { CmsModal, TextInput } from "./ui";

/**
 * Modal for picking a file from the Media Library (with inline upload).
 * Returns a stable `media://<id>` reference via onSelect.
 */
export function MediaPicker({ categories, title, onSelect, onClose }: {
  categories: MediaCategory[];
  title: string;
  onSelect: (src: string, item: MediaItem) => void;
  onClose: () => void;
}) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [search, setSearch] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const refresh = () => { listMedia().then(setItems); };
  useEffect(refresh, []);

  const accept = categories.includes("video") && categories.length === 1
    ? "video/mp4"
    : categories.some(c => c === "image" || c === "logo" || c === "banner") && !categories.includes("video")
      ? "image/*"
      : "image/*,video/mp4,application/pdf";

  const onUpload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setError("");
    const res = await uploadMedia(files[0], categories.length === 1 ? categories[0] : undefined);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) { setError(res.error); return; }
    onSelect(mediaUrl(res.data.id), res.data);
  };

  const visible = items.filter(i =>
    categories.includes(i.category) &&
    (!search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase())));

  return (
    <CmsModal title={title} onClose={onClose} wide>
      <div className="cms-form">
        <div className="cms-grid-2">
          <TextInput placeholder="🔍 بحث..." value={search} onChange={e => setSearch(e.target.value)} />
          <input ref={fileRef} type="file" className="cms-input" accept={accept} disabled={busy} onChange={e => onUpload(e.target.files)} />
        </div>
        {busy && <p className="cms-note"><i className="fas fa-spinner fa-spin" /> جارٍ الرفع...</p>}
        {error && <p className="cms-note" style={{ color: "#fa5252" }}><i className="fas fa-circle-exclamation" /> {error}</p>}
        {visible.length === 0 ? (
          <div className="admin-empty"><i className="fas fa-photo-film" /><p>لا توجد ملفات مناسبة — ارفع ملفاً من الأعلى</p></div>
        ) : (
          <div className="cms-media-grid picker">
            {visible.map(item => (
              <button key={item.id} type="button" className="cms-media-card selectable" onClick={() => onSelect(mediaUrl(item.id), item)}>
                <MediaThumb item={item} />
                <div className="cms-media-info">
                  <strong className="cms-media-name" title={item.name}>{item.name}</strong>
                  <span className="cms-sub">{formatSize(item.size)}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </CmsModal>
  );
}
