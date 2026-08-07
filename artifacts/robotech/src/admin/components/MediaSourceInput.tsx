import { useRef, useState } from "react";
import { uploadMedia, mediaUrl, isMediaUrl, type MediaCategory } from "../../services/mediaStore";
import { useMediaUrl } from "../../hooks/useMediaUrl";
import { MediaPicker } from "./MediaPicker";
import { TextInput } from "./ui";

/**
 * Button-driven media source selector — no manual file paths.
 *  • رفع ملف   → uploads straight to the Media Library and stores its media:// reference
 *  • المكتبة   → picks an existing library file
 *  • رابط خارجي (kind="video" only, optional) → YouTube / Vimeo / external URL
 */
export function MediaSourceInput({ kind, value, onChange, onError }: {
  kind: "video" | "image";
  value: string;
  onChange: (src: string) => void;
  onError: (msg: string) => void;
}) {
  const isExternal = !!value && !isMediaUrl(value) && !value.startsWith("/");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [externalMode, setExternalMode] = useState(isExternal);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const preview = useMediaUrl(kind === "image" && value ? value : undefined);

  const categories: MediaCategory[] = kind === "video" ? ["video"] : ["image", "logo", "banner"];
  const accept = kind === "video" ? "video/mp4,video/webm" : "image/*";

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const res = await uploadMedia(files[0], kind === "video" ? "video" : "image");
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) { onError(res.error); return; }
    setExternalMode(false);
    onChange(mediaUrl(res.data.id));
  };

  const status = !value
    ? { icon: "fa-circle-minus", text: "لم يتم اختيار ملف بعد", cls: "empty" }
    : isMediaUrl(value)
      ? { icon: "fa-photo-film", text: "ملف من مكتبة الوسائط", cls: "ok" }
      : value.startsWith("/")
        ? { icon: "fa-file", text: `ملف محلي: ${value}`, cls: "ok" }
        : { icon: "fa-link", text: `رابط خارجي: ${value}`, cls: "ok" };

  return (
    <div className="cms-media-src">
      <div className={`cms-media-src-status ${status.cls}`}>
        {preview && <img src={preview} alt="" className="cms-media-src-preview" />}
        <i className={`fas ${status.icon}`} />
        <span dir="ltr">{status.text}</span>
        {value && (
          <button type="button" className="cms-icon-btn danger" title="مسح" onClick={() => { onChange(""); setExternalMode(false); }}>
            <i className="fas fa-xmark" />
          </button>
        )}
      </div>

      <div className="cms-media-src-btns">
        <button type="button" className="cms-add-btn" disabled={busy} onClick={() => fileRef.current?.click()}>
          <i className={`fas ${busy ? "fa-spinner fa-spin" : "fa-upload"}`} /> {kind === "video" ? "رفع فيديو" : "رفع صورة"}
        </button>
        <button type="button" className="cms-add-btn" onClick={() => setPickerOpen(true)}>
          <i className="fas fa-photo-film" /> من المكتبة
        </button>
        {kind === "video" && (
          <button type="button" className={`cms-chip${externalMode ? " active" : ""}`} onClick={() => setExternalMode(v => !v)}>
            <i className="fas fa-link" /> رابط خارجي (اختياري)
          </button>
        )}
      </div>

      {kind === "video" && externalMode && (
        <TextInput
          dir="ltr"
          value={isMediaUrl(value) || value.startsWith("/") ? "" : value}
          onChange={e => onChange(e.target.value)}
          placeholder="https://youtube.com/watch?v=... أو Vimeo أو رابط MP4"
        />
      )}

      <input ref={fileRef} type="file" accept={accept} style={{ display: "none" }} onChange={e => upload(e.target.files)} />

      {pickerOpen && (
        <MediaPicker
          title={kind === "video" ? "اختر فيديو من المكتبة" : "اختر صورة من المكتبة"}
          categories={categories}
          onSelect={src => { setExternalMode(false); onChange(src); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
