import { useRef, useState } from "react";
import { uploadMedia, mediaUrl, inferCategory, ATTACHMENT_CATEGORIES } from "../../services/mediaStore";
import type { LessonAttachment } from "../../data/labs";
import { MediaPicker } from "./MediaPicker";

const ACCEPT = ".pdf,.doc,.docx,.ppt,.pptx,.zip,.rar,.7z";

/**
 * Lesson attachments editor: upload / pick-from-library / remove.
 * Stores `media://` references (or URLs) with a display name.
 */
export function AttachmentsInput({ value, onChange, onError }: {
  value: LessonAttachment[];
  onChange: (attachments: LessonAttachment[]) => void;
  onError: (msg: string) => void;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    const file = files[0];
    if (!ATTACHMENT_CATEGORIES.includes(inferCategory(file.type, file.name))) {
      if (fileRef.current) fileRef.current.value = "";
      onError("نوع الملف غير مدعوم كمرفق — المسموح: PDF / Word / PowerPoint / ZIP");
      return;
    }
    setProgress(0);
    const res = await uploadMedia(file, undefined, setProgress);
    setProgress(null);
    if (fileRef.current) fileRef.current.value = "";
    if (!res.ok) { onError(res.error); return; }
    onChange([...value, { name: res.data.name, src: mediaUrl(res.data.id) }]);
  };

  return (
    <div className="cms-media-src">
      {value.length > 0 && (
        <ul className="cms-attach-list">
          {value.map((a, i) => (
            <li key={`${a.src}-${i}`} className="cms-attach-item">
              <i className="fas fa-paperclip" />
              <span dir="ltr">{a.name}</span>
              <button type="button" className="cms-icon-btn danger" title="إزالة" onClick={() => onChange(value.filter((_, j) => j !== i))}>
                <i className="fas fa-xmark" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {progress !== null && (
        <div className="cms-upload-progress">
          <div className="cms-upload-progress-head"><span>جارٍ الرفع...</span><strong dir="ltr">{progress}%</strong></div>
          <div className="cms-progress-track"><div className="cms-progress-fill" style={{ width: `${progress}%` }} /></div>
        </div>
      )}

      <div className="cms-media-src-btns">
        <button type="button" className="cms-add-btn" disabled={progress !== null} onClick={() => fileRef.current?.click()}>
          <i className="fas fa-upload" /> رفع مرفق
        </button>
        <button type="button" className="cms-add-btn" onClick={() => setPickerOpen(true)}>
          <i className="fas fa-photo-film" /> من المكتبة
        </button>
      </div>

      <input ref={fileRef} type="file" accept={ACCEPT} style={{ display: "none" }} onChange={e => upload(e.target.files)} />

      {pickerOpen && (
        <MediaPicker
          title="اختر مرفقاً من المكتبة"
          categories={ATTACHMENT_CATEGORIES}
          onSelect={(src, item) => { onChange([...value, { name: item.name, src }]); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  );
}
