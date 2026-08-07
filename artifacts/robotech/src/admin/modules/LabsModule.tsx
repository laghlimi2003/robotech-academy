import { useState } from "react";
import type { LabConfig, Difficulty } from "../../data/labs";
import { getAllLabs, createLab, updateLab, deleteLab, moveLab } from "../../services/labStore";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, LocInput, Toggle, OrderBtns, AddBtn, SaveBtn, EmptyLoc, fillLoc } from "../components/ui";

const DIFFICULTIES: { value: Difficulty; label: string }[] = [
  { value: "beginner", label: "مبتدئ" },
  { value: "intermediate", label: "متوسط" },
  { value: "advanced", label: "متقدم" },
];

function emptyLab(): LabConfig {
  return {
    key: "",
    title: EmptyLoc(), subtitle: EmptyLoc(), description: EmptyLoc(),
    difficulty: "beginner", ageRange: "8-12",
    faIcon: "fa-flask", color: "#667eea",
    gradient: "linear-gradient(135deg,#667eea,#764ba2)", glowColor: "rgba(102,126,234,0.4)",
    tag: EmptyLoc(), simulatorUrl: "", externalUrl: "",
    lessons: [], heroTasks: { ar: [], en: [], fr: [] }, skills: { ar: [], en: [], fr: [] },
    hidden: false, // simEnabled derived on create: disabled until a simulator URL is set
  };
}

export default function LabsModule() {
  const [labs, setLabs] = useState(getAllLabs);
  const [editing, setEditing] = useState<LabConfig | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [confirmKey, setConfirmKey] = useState<string | null>(null);
  const { show, node: toastNode } = useCmsToast();

  const refresh = () => setLabs(getAllLabs());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const lab: LabConfig = {
      ...editing,
      title: fillLoc(editing.title), subtitle: fillLoc(editing.subtitle),
      description: fillLoc(editing.description), tag: fillLoc(editing.tag),
    };
    const res = isNew ? createLab(lab) : updateLab(lab.key, lab);
    if (!res.ok) { show(res.error, "error"); return; }
    show(isNew ? "تم إنشاء المختبر بنجاح" : "تم حفظ التعديلات");
    setEditing(null);
    refresh();
  };

  const toggleHidden = (lab: LabConfig) => {
    const res = updateLab(lab.key, { hidden: !lab.hidden });
    if (res.ok) { show(lab.hidden ? "المختبر الآن ظاهر للطلاب" : "تم إخفاء المختبر"); refresh(); }
  };

  const remove = (key: string) => {
    deleteLab(key);
    setConfirmKey(null);
    show("تم حذف المختبر");
    refresh();
  };

  const move = (key: string, dir: -1 | 1) => { moveLab(key, dir); refresh(); };

  return (
    <div className="cms-module">
      <div className="cms-module-head">
        <p className="cms-note"><i className="fas fa-circle-info" /> التغييرات تظهر للطلاب عند تحديث صفحتهم.</p>
        <AddBtn onClick={() => { setEditing(emptyLab()); setIsNew(true); }}>مختبر جديد</AddBtn>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table cms-table">
          <thead>
            <tr><th>#</th><th>المختبر</th><th>الصعوبة</th><th>الدروس</th><th>المهام</th><th>الحالة</th><th>الترتيب</th><th>إجراءات</th></tr>
          </thead>
          <tbody>
            {labs.map((lab, i) => (
              <tr key={lab.key} className={lab.hidden ? "cms-row-hidden" : ""}>
                <td>{i + 1}</td>
                <td>
                  <div className="admin-user-cell">
                    <span className="cms-lab-icon" style={{ background: lab.gradient }}><i className={`fas ${lab.faIcon}`} /></span>
                    <div>
                      <strong>{lab.title.ar}</strong>
                      <div className="cms-sub">{lab.key}</div>
                    </div>
                  </div>
                </td>
                <td>{DIFFICULTIES.find(d => d.value === lab.difficulty)?.label}</td>
                <td>{lab.lessons.length}</td>
                <td>{lab.heroTasks.ar.length}</td>
                <td><Toggle checked={!lab.hidden} onChange={() => toggleHidden(lab)} /></td>
                <td><OrderBtns onUp={() => move(lab.key, -1)} onDown={() => move(lab.key, 1)} upDisabled={i === 0} downDisabled={i === labs.length - 1} /></td>
                <td>
                  <button className="cms-icon-btn" onClick={() => { setEditing({ ...lab }); setIsNew(false); }} title="تعديل"><i className="fas fa-pen" /></button>
                  <button className="cms-icon-btn danger" onClick={() => setConfirmKey(lab.key)} title="حذف"><i className="fas fa-trash" /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <CmsModal title={isNew ? "مختبر جديد" : `تعديل: ${editing.title.ar}`} onClose={() => setEditing(null)} wide>
          <form onSubmit={save} className="cms-form">
            {isNew && (
              <Field label="المعرّف (key)" hint="حروف إنجليزية صغيرة وأرقام وشرطات، لا يمكن تغييره لاحقاً">
                <TextInput dir="ltr" value={editing.key} onChange={e => setEditing({ ...editing, key: e.target.value })} placeholder="my-lab" />
              </Field>
            )}
            <LocInput label="العنوان" requiredAr value={editing.title} onChange={v => setEditing({ ...editing, title: v })} />
            <LocInput label="العنوان الفرعي" value={editing.subtitle} onChange={v => setEditing({ ...editing, subtitle: v })} />
            <LocInput label="الوصف" multiline value={editing.description} onChange={v => setEditing({ ...editing, description: v })} />
            <LocInput label="الوسم (Tag)" value={editing.tag} onChange={v => setEditing({ ...editing, tag: v })} />
            <div className="cms-grid-3">
              <Field label="الصعوبة">
                <select className="cms-input cms-select" value={editing.difficulty} onChange={e => setEditing({ ...editing, difficulty: e.target.value as Difficulty })}>
                  {DIFFICULTIES.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                </select>
              </Field>
              <Field label="الفئة العمرية"><TextInput value={editing.ageRange} onChange={e => setEditing({ ...editing, ageRange: e.target.value })} placeholder="8-12" /></Field>
              <Field label="أيقونة Font Awesome"><TextInput dir="ltr" value={editing.faIcon} onChange={e => setEditing({ ...editing, faIcon: e.target.value })} placeholder="fa-robot" /></Field>
            </div>
            <div className="cms-grid-3">
              <Field label="اللون"><TextInput dir="ltr" value={editing.color} onChange={e => setEditing({ ...editing, color: e.target.value })} /></Field>
              <Field label="التدرّج (gradient)"><TextInput dir="ltr" value={editing.gradient} onChange={e => setEditing({ ...editing, gradient: e.target.value })} /></Field>
              <Field label="لون التوهّج"><TextInput dir="ltr" value={editing.glowColor} onChange={e => setEditing({ ...editing, glowColor: e.target.value })} /></Field>
            </div>
            <Field label="المهارات (افصل بفاصلة)" hint="أي تعديل هنا يجعل النسختين EN وFR تعتمدان النص العربي نفسه (لتجنّب ترجمات قديمة غير مطابقة)">
              <TextInput
                value={editing.skills.ar.join("، ")}
                onChange={e => {
                  const arr = e.target.value.split(/[,،]/).map(s => s.trim()).filter(Boolean);
                  setEditing({ ...editing, skills: { ar: arr, en: [...arr], fr: [...arr] } });
                }}
              />
            </Field>
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}

      {confirmKey && (
        <CmsConfirm
          message={`سيتم حذف المختبر "${labs.find(l => l.key === confirmKey)?.title.ar}" وكل دروسه ومهامه نهائياً.`}
          onYes={() => remove(confirmKey)}
          onNo={() => setConfirmKey(null)}
        />
      )}
      {toastNode}
    </div>
  );
}
