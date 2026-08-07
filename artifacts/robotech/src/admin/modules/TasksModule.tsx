import { useState } from "react";
import type { Localized } from "../../data/labs";
import { getAllLabs, getLab, addTask, updateTask, deleteTask, moveTask } from "../../services/labStore";
import { XP_REWARDS } from "../../data/levels";
import { saveXpOverrides } from "../../services/siteStore";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, LocInput, OrderBtns, AddBtn, SaveBtn, EmptyLoc, fillLoc, LabPicker } from "../components/ui";

export default function TasksModule() {
  const labs = getAllLabs();
  const [labKey, setLabKey] = useState(labs[0]?.key ?? "");
  const [tick, setTick] = useState(0);
  const [editing, setEditing] = useState<{ task: Localized<string>; idx: number | null } | null>(null);
  const [confirmIdx, setConfirmIdx] = useState<number | null>(null);
  const [taskXp, setTaskXp] = useState(XP_REWARDS.task);
  const { show, node: toastNode } = useCmsToast();

  const lab = getLab(labKey);
  const tasks = lab?.heroTasks.ar ?? [];
  const refresh = () => setTick(t => t + 1);
  void tick;

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const task = fillLoc(editing.task);
    const res = editing.idx === null ? addTask(labKey, task) : updateTask(labKey, editing.idx, task);
    if (!res.ok) { show(res.error, "error"); return; }
    show(editing.idx === null ? "تمت إضافة المهمة" : "تم حفظ المهمة");
    setEditing(null);
    refresh();
  };

  const saveRewards = () => {
    const res = saveXpOverrides({ task: taskXp });
    if (!res.ok) { show(res.error, "error"); return; }
    show("تم حفظ مكافأة المهام (تُطبَّق عند تحديث صفحة الطلاب)");
  };

  return (
    <div className="cms-module">
      {/* Rewards config */}
      <div className="cms-sim-card">
        <div className="cms-sim-head"><i className="fas fa-gift" style={{ color: "#43e97b", fontSize: 20 }} /><strong>مكافأة إتمام المهمة (XP)</strong></div>
        <div className="cms-grid-2">
          <Field label="نقاط XP لكل مهمة">
            <TextInput type="number" dir="ltr" value={taskXp} onChange={e => setTaskXp(Number(e.target.value))} />
          </Field>
        </div>
        <button className="cms-save-btn" onClick={saveRewards}><i className="fas fa-check" /> حفظ المكافأة</button>
      </div>

      <div className="cms-module-head">
        <Field label="المختبر"><LabPicker labs={labs.map(l => ({ key: l.key, label: l.title.ar }))} value={labKey} onChange={setLabKey} /></Field>
        <AddBtn onClick={() => setEditing({ task: EmptyLoc(), idx: null })}>مهمة جديدة</AddBtn>
      </div>

      {tasks.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-list-check" /><p>لا توجد مهام في هذا المختبر بعد</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table cms-table">
            <thead><tr><th>#</th><th>المهمة</th><th>الترتيب</th><th>إجراءات</th></tr></thead>
            <tbody>
              {tasks.map((t, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td><strong>{t}</strong></td>
                  <td><OrderBtns onUp={() => { moveTask(labKey, i, -1); refresh(); }} onDown={() => { moveTask(labKey, i, 1); refresh(); }} upDisabled={i === 0} downDisabled={i === tasks.length - 1} /></td>
                  <td>
                    <button
                      className="cms-icon-btn"
                      onClick={() => lab && setEditing({ task: { ar: lab.heroTasks.ar[i], en: lab.heroTasks.en[i] ?? "", fr: lab.heroTasks.fr[i] ?? "" }, idx: i })}
                      title="تعديل"
                    ><i className="fas fa-pen" /></button>
                    <button className="cms-icon-btn danger" onClick={() => setConfirmIdx(i)} title="حذف"><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="cms-note"><i className="fas fa-triangle-exclamation" /> إعادة ترتيب المهام أو حذفها قد تؤثر على سجلات تقدم الطلاب الحالية (التقدم مرتبط برقم المهمة).</p>

      {editing && (
        <CmsModal title={editing.idx === null ? "مهمة جديدة" : "تعديل المهمة"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="cms-form">
            <LocInput label="نص المهمة" requiredAr value={editing.task} onChange={v => setEditing({ ...editing, task: v })} />
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}

      {confirmIdx !== null && (
        <CmsConfirm message={`سيتم حذف المهمة "${tasks[confirmIdx]}" نهائياً.`} onYes={() => { deleteTask(labKey, confirmIdx); setConfirmIdx(null); show("تم حذف المهمة"); refresh(); }} onNo={() => setConfirmIdx(null)} />
      )}
      {toastNode}
    </div>
  );
}
