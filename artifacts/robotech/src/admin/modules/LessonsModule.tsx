import { useState } from "react";
import type { Lesson, LessonType } from "../../data/labs";
import { getAllLabs, getLab, addLesson, updateLesson, deleteLesson, moveLesson } from "../../services/labStore";
import { MediaPicker } from "../components/MediaPicker";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, LocInput, Toggle, OrderBtns, AddBtn, SaveBtn, EmptyLoc, fillLoc, LabPicker } from "../components/ui";

function emptyLesson(): Lesson {
  return { title: EmptyLoc(), description: EmptyLoc(), type: "video", src: "", duration: "05:00", hidden: false };
}

export default function LessonsModule() {
  const labs = getAllLabs();
  const [labKey, setLabKey] = useState(labs[0]?.key ?? "");
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<{ lesson: Lesson; idx: number | null } | null>(null);
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const { show, node: toastNode } = useCmsToast();

  const lab = getLab(labKey);
  const refresh = () => setTick(t => t + 1);
  void tick;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const lesson: Lesson = { ...editing.lesson, title: fillLoc(editing.lesson.title), description: fillLoc(editing.lesson.description) };
    const res = editing.idx === null ? addLesson(labKey, lesson) : updateLesson(labKey, editing.idx, lesson);
    if (!res.ok) { show(res.error, "error"); return; }
    show(editing.idx === null ? "تمت إضافة الدرس" : "تم حفظ الدرس");
    setEditing(null);
    refresh();
  };

  return (
    <div className="cms-module">
      <div className="cms-module-head">
        <Field label="المختبر">
          <LabPicker labs={labs.map(l => ({ key: l.key, label: l.title.ar }))} value={labKey} onChange={setLabKey} />
        </Field>
        <AddBtn onClick={() => setEditing({ lesson: emptyLesson(), idx: null })}>درس جديد</AddBtn>
      </div>

      {!lab || lab.lessons.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-book-open" /><p>لا توجد دروس في هذا المختبر بعد</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table cms-table">
            <thead><tr><th>#</th><th>الدرس</th><th>النوع</th><th>المدة</th><th>أسئلة</th><th>الحالة</th><th>الترتيب</th><th>إجراءات</th></tr></thead>
            <tbody>
              {lab.lessons.map((les, i) => (
                <tr key={i} className={les.hidden ? "cms-row-hidden" : ""}>
                  <td>{i + 1}</td>
                  <td><strong>{les.title.ar}</strong><div className="cms-sub">{les.description.ar.slice(0, 60)}</div></td>
                  <td>{les.type === "video" ? "فيديو" : "تفاعلي (embed)"}</td>
                  <td dir="ltr">{les.duration}</td>
                  <td>{les.quiz?.length ?? 0}</td>
                  <td><Toggle checked={!les.hidden} onChange={v => { updateLesson(labKey, i, { hidden: !v }); show(v ? "الدرس ظاهر" : "تم إخفاء الدرس"); refresh(); }} /></td>
                  <td><OrderBtns onUp={() => { moveLesson(labKey, i, -1); refresh(); }} onDown={() => { moveLesson(labKey, i, 1); refresh(); }} upDisabled={i === 0} downDisabled={i === lab.lessons.length - 1} /></td>
                  <td>
                    <button className="cms-icon-btn" onClick={() => setEditing({ lesson: { ...les }, idx: i })} title="تعديل"><i className="fas fa-pen" /></button>
                    <button className="cms-icon-btn danger" onClick={() => setConfirmIdx(i)} title="حذف"><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="cms-note"><i className="fas fa-triangle-exclamation" /> إعادة ترتيب الدروس أو حذفها قد تؤثر على سجلات تقدم الطلاب الحالية (التقدم مرتبط برقم الدرس).</p>

      {editing && (
        <CmsModal title={editing.idx === null ? "درس جديد" : "تعديل الدرس"} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="cms-form">
            <LocInput label="عنوان الدرس" requiredAr value={editing.lesson.title} onChange={v => setEditing({ ...editing, lesson: { ...editing.lesson, title: v } })} />
            <LocInput label="الوصف" multiline value={editing.lesson.description} onChange={v => setEditing({ ...editing, lesson: { ...editing.lesson, description: v } })} />
            <div className="cms-grid-3">
              <Field label="النوع">
                <select className="cms-input cms-select" value={editing.lesson.type} onChange={e => setEditing({ ...editing, lesson: { ...editing.lesson, type: e.target.value as LessonType } })}>
                  <option value="video">فيديو</option>
                  <option value="embed">تفاعلي (embed)</option>
                </select>
              </Field>
              <Field label="المدة (mm:ss)"><TextInput dir="ltr" value={editing.lesson.duration} onChange={e => setEditing({ ...editing, lesson: { ...editing.lesson, duration: e.target.value } })} placeholder="05:30" /></Field>
              <Field label="المصدر (src)" hint="من مكتبة الوسائط أو مسار/رابط">
                <div className="cms-src-row">
                  <TextInput dir="ltr" value={editing.lesson.src} onChange={e => setEditing({ ...editing, lesson: { ...editing.lesson, src: e.target.value } })} placeholder="/videos/my-lesson.mp4" />
                  <button type="button" className="cms-add-btn" onClick={() => setPickerOpen(true)}><i className="fas fa-photo-film" /> المكتبة</button>
                </div>
              </Field>
            </div>
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}

      {pickerOpen && editing && (
        <MediaPicker
          title="اختر فيديو من المكتبة"
          categories={["video"]}
          onSelect={src => { setEditing({ ...editing, lesson: { ...editing.lesson, src, type: "video" } }); setPickerOpen(false); }}
          onClose={() => setPickerOpen(false)}
        />
      )}
      {confirmIdx !== null && (
        <CmsConfirm
          message={`سيتم حذف الدرس "${lab?.lessons[confirmIdx]?.title.ar}" نهائياً.`}
          onYes={() => { deleteLesson(labKey, confirmIdx); setConfirmIdx(null); show("تم حذف الدرس"); refresh(); }}
          onNo={() => setConfirmIdx(null)}
        />
      )}
      {toastNode}
    </div>
  );
}
