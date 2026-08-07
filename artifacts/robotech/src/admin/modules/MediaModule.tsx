import { useEffect, useRef, useState } from "react";
import {
  listMedia, uploadMedia, renameMedia, deleteMedia, formatSize,
  CATEGORY_LABELS, type MediaItem, type MediaCategory, mediaUrl,
} from "../../services/mediaStore";
import { useMediaUrl } from "../../hooks/useMediaUrl";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, SaveBtn } from "../components/ui";

const FILTERS: { value: MediaCategory | "all"; label: string }[] = [
  { value: "all", label: "الكل" },
  { value: "image", label: "صور" },
  { value: "video", label: "فيديوهات" },
  { value: "pdf", label: "PDF" },
  { value: "document", label: "مستندات" },
  { value: "logo", label: "شعارات" },
  { value: "banner", label: "بانرات" },
];

export function MediaThumb({ item }: { item: MediaItem }) {
  const url = useMediaUrl(mediaUrl(item.id));
  if ((item.category === "image" || item.category === "logo" || item.category === "banner") && url)
    return <img src={url} alt={item.name} className="cms-media-thumb" loading="lazy" />;
  if (item.category === "video" && url)
    return <video src={url} className="cms-media-thumb" muted preload="metadata" />;
  return (
    <div className="cms-media-thumb cms-media-thumb-icon">
      <i className={`fas ${item.category === "pdf" ? "fa-file-pdf" : "fa-file-lines"}`} />
    </div>
  );
}

export default function MediaModule() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState<MediaCategory | "all">("all");
  const [search, setSearch] = useState("");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [uploadCat, setUploadCat] = useState<MediaCategory | "">("");
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show, node: toastNode } = useCmsToast();

  const refresh = () => { listMedia().then(setItems); };
  useEffect(refresh, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    let okCount = 0;
    for (const f of Array.from(files)) {
      const res = await uploadMedia(f, uploadCat || undefined);
      if (res.ok) okCount++;
      else show(`${f.name}: ${res.error}`, "error");
    }
    if (okCount) show(`تم رفع ${okCount} ملف${okCount > 1 ? "ات" : ""} بنجاح`);
    setBusy(false);
    if (fileRef.current) fileRef.current.value = "";
    refresh();
  };

  const doRename = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!renaming) return;
    const res = await renameMedia(renaming.id, renaming.name);
    if (!res.ok) { show(res.error, "error"); return; }
    show("تمت إعادة التسمية");
    setRenaming(null);
    refresh();
  };

  const doDelete = async (id: string) => {
    const res = await deleteMedia(id);
    show(res.ok ? "تم حذف الملف" : res.error, res.ok ? "success" : "error");
    setConfirmId(null);
    refresh();
  };

  const visible = items.filter(i =>
    (filter === "all" || i.category === filter) &&
    (!search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase())));

  return (
    <div className="cms-module">
      <div className="cms-sim-card">
        <div className="cms-sim-head"><i className="fas fa-cloud-arrow-up" style={{ color: "#667eea", fontSize: 20 }} /><strong>رفع ملفات</strong></div>
        <div className="cms-grid-2">
          <Field label="التصنيف (اختياري)" hint="يُحدَّد تلقائياً من نوع الملف إن تُرك فارغاً">
            <select className="cms-input cms-select" value={uploadCat} onChange={e => setUploadCat(e.target.value as MediaCategory | "")}>
              <option value="">تلقائي</option>
              {(Object.keys(CATEGORY_LABELS) as MediaCategory[]).map(c => <option key={c} value={c}>{CATEGORY_LABELS[c]}</option>)}
            </select>
          </Field>
          <Field label="الملفات" hint="صور، MP4، PDF، مستندات — حتى 60MB للملف">
            <input
              ref={fileRef} type="file" multiple className="cms-input"
              accept="image/*,video/mp4,application/pdf,.doc,.docx,.txt"
              disabled={busy}
              onChange={e => onUpload(e.target.files)}
            />
          </Field>
        </div>
        {busy && <p className="cms-note"><i className="fas fa-spinner fa-spin" /> جارٍ الرفع...</p>}
      </div>

      <div className="cms-module-head">
        <div className="cms-media-filters">
          {FILTERS.map(f => (
            <button key={f.value} className={`cms-chip${filter === f.value ? " active" : ""}`} onClick={() => setFilter(f.value)}>{f.label}</button>
          ))}
        </div>
        <TextInput placeholder="🔍 بحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
      </div>

      {visible.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-photo-film" /><p>{items.length === 0 ? "المكتبة فارغة — ارفع أول ملف" : "لا نتائج مطابقة"}</p></div>
      ) : (
        <div className="cms-media-grid">
          {visible.map(item => (
            <div key={item.id} className="cms-media-card">
              <MediaThumb item={item} />
              <div className="cms-media-info">
                <strong className="cms-media-name" title={item.name}>{item.name}</strong>
                <span className="cms-sub">{CATEGORY_LABELS[item.category]} • {formatSize(item.size)} • <span dir="ltr">{item.createdAt.slice(0, 10)}</span></span>
              </div>
              <div className="cms-media-actions">
                <button className="cms-icon-btn" onClick={() => setRenaming({ id: item.id, name: item.name })} title="إعادة تسمية"><i className="fas fa-pen" /></button>
                <button className="cms-icon-btn danger" onClick={() => setConfirmId(item.id)} title="حذف"><i className="fas fa-trash" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {renaming && (
        <CmsModal title="إعادة تسمية الملف" onClose={() => setRenaming(null)}>
          <form onSubmit={doRename} className="cms-form">
            <Field label="الاسم الجديد"><TextInput value={renaming.name} onChange={e => setRenaming({ ...renaming, name: e.target.value })} /></Field>
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}
      {confirmId && (
        <CmsConfirm
          message="سيتم حذف الملف نهائياً. إذا كان مستخدماً في درس أو إعداد فسيتوقف عرضه."
          onYes={() => doDelete(confirmId)}
          onNo={() => setConfirmId(null)}
        />
      )}
      {toastNode}
    </div>
  );
}
