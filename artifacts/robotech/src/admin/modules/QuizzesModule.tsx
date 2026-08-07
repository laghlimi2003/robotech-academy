import { useState } from "react";
import type { QuizQuestion } from "../../data/labs";
import { getAllLabs, getLab, setQuiz } from "../../services/labStore";
import { XP_REWARDS } from "../../data/levels";
import { saveXpOverrides } from "../../services/siteStore";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, TextArea, LocInput, AddBtn, SaveBtn, EmptyLoc, fillLoc, LabPicker } from "../components/ui";

function emptyQuestion(): QuizQuestion {
  return { q: EmptyLoc(), options: { ar: ["", ""], en: ["", ""], fr: ["", ""] }, correct: 0, explain: EmptyLoc() };
}

export default function QuizzesModule() {
  const labs = getAllLabs();
  const [labKey, setLabKey] = useState(labs[0]?.key ?? "");
  const [lessonIdx, setLessonIdx] = useState(0);
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<{ q: QuizQuestion; idx: number | null } | null>(null);
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const [points, setPoints] = useState({ base: XP_REWARDS.quizPassBase, bonus: XP_REWARDS.quizPercentBonus });
  const { show, node: toastNode } = useCmsToast();

  const lab = getLab(labKey);
  const lesson = lab?.lessons[lessonIdx];
  const quiz = lesson?.quiz ?? [];
  const refresh = () => setTick(t => t + 1);
  void tick;

  const changeLab = (key: string) => { setLabKey(key); setLessonIdx(0); };

  const saveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing || !lesson) return;
    const cleanOpts = (arr: string[]) => arr.map(o => o.trim()).filter(Boolean);
    const ar = cleanOpts(editing.q.options.ar);
    const en = cleanOpts(editing.q.options.en);
    const fr = cleanOpts(editing.q.options.fr);
    const q: QuizQuestion = {
      q: fillLoc(editing.q.q),
      options: { ar, en: en.length === ar.length ? en : ar, fr: fr.length === ar.length ? fr : ar },
      correct: editing.q.correct,
      explain: editing.q.explain && editing.q.explain.ar.trim() ? fillLoc(editing.q.explain) : undefined,
    };
    const next = [...quiz];
    if (editing.idx === null) next.push(q); else next[editing.idx] = q;
    const res = setQuiz(labKey, lessonIdx, next);
    if (!res.ok) { show(res.error, "error"); return; }
    show(editing.idx === null ? "تمت إضافة السؤال" : "تم حفظ السؤال");
    setEditing(null);
    refresh();
  };

  const removeQuestion = (idx: number) => {
    const res = setQuiz(labKey, lessonIdx, quiz.filter((_, i) => i !== idx));
    if (res.ok) show("تم حذف السؤال");
    setConfirmIdx(null);
    refresh();
  };

  const savePoints = () => {
    const res = saveXpOverrides({ quizPassBase: points.base, quizPercentBonus: points.bonus });
    if (!res.ok) { show(res.error, "error"); return; }
    show("تم حفظ نقاط الاختبارات (تُطبَّق عند تحديث صفحة الطلاب)");
  };

  return (
    <div className="cms-module">
      {/* Points config */}
      <div className="cms-sim-card">
        <div className="cms-sim-head"><i className="fas fa-star" style={{ color: "#ffd700", fontSize: 20 }} /><strong>نقاط الاختبارات (XP)</strong></div>
        <div className="cms-grid-2">
          <Field label="نقاط النجاح الأساسية">
            <TextInput type="number" dir="ltr" value={points.base} onChange={e => setPoints({ ...points, base: Number(e.target.value) })} />
          </Field>
          <Field label="نقاط إضافية لكل % فوق 70">
            <TextInput type="number" dir="ltr" value={points.bonus} onChange={e => setPoints({ ...points, bonus: Number(e.target.value) })} />
          </Field>
        </div>
        <button className="cms-save-btn" onClick={savePoints}><i className="fas fa-check" /> حفظ النقاط</button>
      </div>

      <div className="cms-module-head">
        <Field label="المختبر"><LabPicker labs={labs.map(l => ({ key: l.key, label: l.title.ar }))} value={labKey} onChange={changeLab} /></Field>
        <Field label="الدرس">
          <select className="cms-input cms-select" value={lessonIdx} onChange={e => setLessonIdx(Number(e.target.value))}>
            {(lab?.lessons ?? []).map((l, i) => <option key={i} value={i}>{l.title.ar}</option>)}
          </select>
        </Field>
        {lesson && <AddBtn onClick={() => setEditing({ q: emptyQuestion(), idx: null })}>سؤال جديد</AddBtn>}
      </div>

      {!lesson ? (
        <div className="admin-empty"><i className="fas fa-circle-question" /><p>لا توجد دروس في هذا المختبر — أضف درساً أولاً</p></div>
      ) : quiz.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-circle-question" /><p>لا توجد أسئلة لهذا الدرس بعد</p></div>
      ) : (
        <div className="cms-quiz-list">
          {quiz.map((q, i) => (
            <div key={i} className="cms-quiz-card">
              <div className="cms-quiz-q"><span className="cms-quiz-num">{i + 1}</span> {q.q.ar}</div>
              <ul className="cms-quiz-opts">
                {q.options.ar.map((o, oi) => (
                  <li key={oi} className={oi === q.correct ? "correct" : ""}>
                    {oi === q.correct && <i className="fas fa-check" />} {o}
                  </li>
                ))}
              </ul>
              <div className="cms-quiz-actions">
                <button className="cms-icon-btn" onClick={() => setEditing({ q: JSON.parse(JSON.stringify(q)), idx: i })} title="تعديل"><i className="fas fa-pen" /></button>
                <button className="cms-icon-btn danger" onClick={() => setConfirmIdx(i)} title="حذف"><i className="fas fa-trash" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <CmsModal title={editing.idx === null ? "سؤال جديد" : "تعديل السؤال"} onClose={() => setEditing(null)} wide>
          <form onSubmit={saveQuestion} className="cms-form">
            <LocInput label="نص السؤال" requiredAr value={editing.q.q} onChange={v => setEditing({ ...editing, q: { ...editing.q, q: v } })} />
            <Field label="الخيارات (سطر لكل خيار)" hint="بالعربية — الترجمات تُنسخ تلقائياً إن لم تُعدَّل بنفس عدد الأسطر">
              <TextArea
                dir="rtl" rows={4}
                value={editing.q.options.ar.join("\n")}
                onChange={e => setEditing({ ...editing, q: { ...editing.q, options: { ...editing.q.options, ar: e.target.value.split("\n") } } })}
              />
            </Field>
            <div className="cms-grid-2">
              <Field label="الخيارات EN (اختياري)">
                <TextArea dir="ltr" rows={4} value={editing.q.options.en.join("\n")} onChange={e => setEditing({ ...editing, q: { ...editing.q, options: { ...editing.q.options, en: e.target.value.split("\n") } } })} />
              </Field>
              <Field label="الخيارات FR (اختياري)">
                <TextArea dir="ltr" rows={4} value={editing.q.options.fr.join("\n")} onChange={e => setEditing({ ...editing, q: { ...editing.q, options: { ...editing.q.options, fr: e.target.value.split("\n") } } })} />
              </Field>
            </div>
            <Field label="رقم الإجابة الصحيحة (يبدأ من 1)">
              <TextInput
                type="number" dir="ltr" min={1}
                value={editing.q.correct + 1}
                onChange={e => setEditing({ ...editing, q: { ...editing.q, correct: Number(e.target.value) - 1 } })}
              />
            </Field>
            <LocInput label="شرح الإجابة (اختياري)" multiline value={editing.q.explain ?? EmptyLoc()} onChange={v => setEditing({ ...editing, q: { ...editing.q, explain: v } })} />
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}

      {confirmIdx !== null && (
        <CmsConfirm message="سيتم حذف هذا السؤال نهائياً." onYes={() => removeQuestion(confirmIdx)} onNo={() => setConfirmIdx(null)} />
      )}
      {toastNode}
    </div>
  );
}
