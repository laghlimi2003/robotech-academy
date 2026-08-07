import { useState } from "react";
import { getAllLabs, updateLesson, normalizeVideoSrc } from "../../services/labStore";
import { isMediaUrl } from "../../services/mediaStore";
import { MediaSourceInput } from "../components/MediaSourceInput";
import { useCmsToast, CmsModal, Field, TextInput, Toggle, SaveBtn } from "../components/ui";

interface VideoRow {
  labKey: string;
  labTitle: string;
  lessonIdx: number;
  title: string;
  src: string;
  thumbnail: string;
  duration: string;
  type: "video" | "embed";
  hidden: boolean;
}

function collectVideos(): VideoRow[] {
  const rows: VideoRow[] = [];
  for (const lab of getAllLabs()) {
    lab.lessons.forEach((les, i) => {
      rows.push({
        labKey: lab.key, labTitle: lab.title.ar, lessonIdx: i,
        title: les.title.ar, src: les.src, thumbnail: les.thumbnail ?? "",
        duration: les.duration, type: les.type, hidden: !!les.hidden,
      });
    });
  }
  return rows;
}

export default function VideosModule() {
  const [rows, setRows] = useState(collectVideos);
  const [editing, setEditing] = useState<VideoRow | null>(null);
  const { show, node: toastNode } = useCmsToast();

  const refresh = () => setRows(collectVideos());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    if (!editing.src.trim()) { show("مصدر الفيديو مطلوب", "error"); return; }
    // Library files & local MP4 stay type "video"; YouTube/Vimeo links become embeds automatically
    const norm = normalizeVideoSrc(editing.src);
    const isLocal = editing.src.trim().startsWith("/") || isMediaUrl(editing.src);
    const res = updateLesson(editing.labKey, editing.lessonIdx, {
      src: isLocal ? editing.src.trim() : norm.src,
      type: isLocal ? "video" : norm.type,
      thumbnail: editing.thumbnail.trim() || undefined,
      duration: editing.duration.trim(),
    });
    if (!res.ok) { show(res.error, "error"); return; }
    show("تم حفظ الفيديو");
    setEditing(null);
    refresh();
  };

  const missing = (src: string) => src.trim() === "";

  return (
    <div className="cms-module">
      <p className="cms-note"><i className="fas fa-circle-info" /> ارفع الفيديو مباشرةً أو اختره من مكتبة الوسائط، أو استخدم رابط YouTube / Vimeo (يُحوَّل لعرض مضمّن تلقائياً).</p>
      <div className="admin-table-wrap">
        <table className="admin-table cms-table">
          <thead><tr><th>المختبر</th><th>الدرس</th><th>المصدر</th><th>النوع</th><th>المدة</th><th>الحالة</th><th>تعديل</th></tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={`${r.labKey}-${r.lessonIdx}`} className={r.hidden ? "cms-row-hidden" : ""}>
                <td>{r.labTitle}</td>
                <td><strong>{r.title}</strong></td>
                <td dir="ltr" className="cms-src-cell">{missing(r.src) ? <span className="cms-missing">— لا يوجد —</span> : r.src}</td>
                <td>{r.type === "video" ? "MP4" : "مضمّن"}</td>
                <td dir="ltr">{r.duration}</td>
                <td>
                  <Toggle checked={!r.hidden} onChange={v => { updateLesson(r.labKey, r.lessonIdx, { hidden: !v }); show(v ? "الدرس ظاهر" : "تم الإخفاء"); refresh(); }} />
                </td>
                <td><button className="cms-icon-btn" onClick={() => setEditing({ ...r })} title="تعديل"><i className="fas fa-pen" /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CmsModal title={`فيديو: ${editing.title}`} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="cms-form">
            <Field label="مصدر الفيديو" hint="ارفع فيديو، اختر من المكتبة، أو استخدم رابط YouTube / Vimeo">
              <MediaSourceInput
                kind="video"
                value={editing.src}
                onChange={src => setEditing({ ...editing, src })}
                onError={msg => show(msg, "error")}
              />
            </Field>
            <Field label="الصورة المصغّرة (اختياري)" hint="تُعرض كغلاف قبل تشغيل الفيديو">
              <MediaSourceInput
                kind="image"
                value={editing.thumbnail}
                onChange={thumbnail => setEditing({ ...editing, thumbnail })}
                onError={msg => show(msg, "error")}
              />
            </Field>
            <Field label="المدة (mm:ss)">
              <TextInput dir="ltr" value={editing.duration} onChange={e => setEditing({ ...editing, duration: e.target.value })} placeholder="05:30" />
            </Field>
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}
      {toastNode}
    </div>
  );
}
