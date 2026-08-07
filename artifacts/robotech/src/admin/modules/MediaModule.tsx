import { useEffect, useRef, useState } from "react";
import {
  listMedia, uploadMedia, renameMedia, deleteMedia, formatSize,
  CATEGORY_LABELS, type MediaItem, type MediaCategory, mediaUrl,
} from "../../services/mediaStore";
import { useMediaUrl } from "../../hooks/useMediaUrl";
import { getAllLabs } from "../../services/labStore";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, SaveBtn } from "../components/ui";

/** Names of lessons that reference this media file (src / thumbnail / attachments). */
function findLessonRefs(id: string): string[] {
  const ref = mediaUrl(id);
  const names: string[] = [];
  for (const lab of getAllLabs())
    for (const les of lab.lessons)
      if (les.src === ref || les.thumbnail === ref || les.attachments?.some(a => a.src === ref))
        names.push(les.title.ar);
  return names;
}

function deleteWarning(id: string): string {
  const refs = findLessonRefs(id);
  if (refs.length === 0) return "سيتم حذف الملف نهائياً. إذا كان مستخدماً في إعداد فسيتوقف عرضه.";
  return `تنبيه: هذا الملف مستخدم في ${refs.length > 1 ? "الدروس التالية" : "الدرس التالي"}: ${refs.slice(0, 3).join("، ")}${refs.length > 3 ? "…" : ""}. حذفه سيوقف عرضه لدى الطلاب.`;
}

/* Filter groups: each chip covers one or more stored categories */
const FILTERS: { value: string; label: string; cats: MediaCategory[] | null }[] = [
  { value: "all",        label: "الكل",       cats: null },
  { value: "video",      label: "فيديوهات",   cats: ["video"] },
  { value: "image",      label: "صور",        cats: ["image", "logo", "banner"] },
  { value: "pdf",        label: "PDF",        cats: ["pdf"] },
  { value: "word",       label: "Word",       cats: ["word"] },
  { value: "powerpoint", label: "PowerPoint", cats: ["powerpoint"] },
  { value: "zip",        label: "ZIP",        cats: ["zip"] },
  { value: "audio",      label: "صوتيات",     cats: ["audio"] },
  { value: "other",      label: "أخرى",       cats: ["other", "document"] },
];

type SortKey = "newest" | "oldest" | "name" | "size";
const SORTS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "الأحدث أولاً" },
  { value: "oldest", label: "الأقدم أولاً" },
  { value: "name",   label: "الاسم" },
  { value: "size",   label: "الحجم" },
];

export const CATEGORY_ICONS: Partial<Record<MediaCategory, string>> = {
  pdf: "fa-file-pdf", word: "fa-file-word", powerpoint: "fa-file-powerpoint",
  zip: "fa-file-zipper", audio: "fa-file-audio", document: "fa-file-lines", other: "fa-file",
};

export function MediaThumb({ item }: { item: MediaItem }) {
  const url = useMediaUrl(mediaUrl(item.id));
  if ((item.category === "image" || item.category === "logo" || item.category === "banner") && url)
    return <img src={url} alt={item.name} className="cms-media-thumb" loading="lazy" />;
  if (item.category === "video" && url)
    return <video src={url} className="cms-media-thumb" muted preload="metadata" />;
  if (item.category === "audio" && url)
    return (
      <div className="cms-media-thumb cms-media-thumb-icon">
        <audio src={url} controls preload="metadata" style={{ width: "100%", maxWidth: 160 }} />
      </div>
    );
  return (
    <div className="cms-media-thumb cms-media-thumb-icon">
      <i className={`fas ${CATEGORY_ICONS[item.category] ?? "fa-file-lines"}`} />
    </div>
  );
}

export default function MediaModule() {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortKey>("newest");
  const [renaming, setRenaming] = useState<{ id: string; name: string } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [uploadCat, setUploadCat] = useState<MediaCategory | "">("");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<{ name: string; pct: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const { show, node: toastNode } = useCmsToast();

  const refresh = () => { listMedia().then(setItems); };
  useEffect(refresh, []);

  const onUpload = async (files: FileList | null) => {
    if (!files || !files.length) return;
    setBusy(true);
    let okCount = 0;
    for (const f of Array.from(files)) {
      setProgress({ name: f.name, pct: 0 });
      const res = await uploadMedia(f, uploadCat || undefined, pct => setProgress({ name: f.name, pct }));
      if (res.ok) okCount++;
      else show(`${f.name}: ${res.error}`, "error");
    }
    setProgress(null);
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

  const activeCats = FILTERS.find(f => f.value === filter)?.cats ?? null;
  const visible = items
    .filter(i =>
      (!activeCats || activeCats.includes(i.category)) &&
      (!search.trim() || i.name.toLowerCase().includes(search.trim().toLowerCase())))
    .sort((a, b) => {
      switch (sort) {
        case "newest": return b.createdAt.localeCompare(a.createdAt);
        case "oldest": return a.createdAt.localeCompare(b.createdAt);
        case "name":   return a.name.localeCompare(b.name, "ar");
        case "size":   return b.size - a.size;
      }
    });

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
          <Field label="الملفات" hint="صور، فيديو، صوت، PDF، Word، PowerPoint، ZIP وغيرها">
            <input
              ref={fileRef} type="file" multiple className="cms-input"
              accept="image/*,video/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z,.txt,.odt,.odp"
              disabled={busy}
              onChange={e => onUpload(e.target.files)}
            />
          </Field>
        </div>
        {progress && (
          <div className="cms-upload-progress">
            <div className="cms-upload-progress-head">
              <span dir="ltr">{progress.name}</span>
              <strong dir="ltr">{progress.pct}%</strong>
            </div>
            <div className="cms-progress-track"><div className="cms-progress-fill" style={{ width: `${progress.pct}%` }} /></div>
          </div>
        )}
      </div>

      <div className="cms-module-head">
        <div className="cms-media-filters">
          {FILTERS.map(f => (
            <button key={f.value} className={`cms-chip${filter === f.value ? " active" : ""}`} onClick={() => setFilter(f.value)}>{f.label}</button>
          ))}
        </div>
        <div className="cms-media-toolbar">
          <select className="cms-input cms-select" value={sort} onChange={e => setSort(e.target.value as SortKey)} style={{ maxWidth: 160 }}>
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <TextInput placeholder="🔍 بحث بالاسم..." value={search} onChange={e => setSearch(e.target.value)} style={{ maxWidth: 240 }} />
        </div>
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
          message={deleteWarning(confirmId)}
          onYes={() => doDelete(confirmId)}
          onNo={() => setConfirmId(null)}
        />
      )}
      {toastNode}
    </div>
  );
}
