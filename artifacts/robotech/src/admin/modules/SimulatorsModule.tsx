import { useState } from "react";
import { getAllLabs, updateLab } from "../../services/labStore";
import { useCmsToast, Field, TextInput, Toggle } from "../components/ui";

interface SimRow {
  key: string;
  title: string;
  faIcon: string;
  gradient: string;
  simulatorUrl: string;
  externalUrl: string;
  simEnabled: boolean;
}

function collect(): SimRow[] {
  return getAllLabs().map(l => ({
    key: l.key, title: l.title.ar, faIcon: l.faIcon, gradient: l.gradient,
    simulatorUrl: l.simulatorUrl, externalUrl: l.externalUrl,
    simEnabled: l.simEnabled !== false,
  }));
}

export default function SimulatorsModule() {
  const [rows, setRows] = useState(collect);
  const { show, node: toastNode } = useCmsToast();

  const edit = (key: string, patch: Partial<SimRow>) =>
    setRows(rs => rs.map(r => (r.key === key ? { ...r, ...patch } : r)));

  const save = (row: SimRow) => {
    if (row.simEnabled && !row.simulatorUrl.trim()) { show("رابط المحاكي مطلوب عندما يكون مفعّلاً", "error"); return; }
    const res = updateLab(row.key, {
      simulatorUrl: row.simulatorUrl.trim(),
      externalUrl: row.externalUrl.trim(),
      simEnabled: row.simEnabled,
    });
    if (!res.ok) { show(res.error, "error"); return; }
    show(`تم حفظ محاكي "${row.title}"`);
  };

  return (
    <div className="cms-module">
      <p className="cms-note"><i className="fas fa-circle-info" /> عند تعطيل المحاكي يختفي قسم المحاكاة من صفحة المختبر لدى الطلاب. الرابط الخارجي يُستخدم كبديل عند فشل التضمين.</p>
      <div className="cms-sim-list">
        {rows.map(row => (
          <div key={row.key} className="cms-sim-card">
            <div className="cms-sim-head">
              <span className="cms-lab-icon" style={{ background: row.gradient }}><i className={`fas ${row.faIcon}`} /></span>
              <strong>{row.title}</strong>
              <Toggle checked={row.simEnabled} onChange={v => edit(row.key, { simEnabled: v })} labels={["مفعّل", "معطّل"]} />
            </div>
            <div className="cms-grid-2">
              <Field label="رابط المحاكي (يُعرض داخل الصفحة)">
                <TextInput dir="ltr" value={row.simulatorUrl} onChange={e => edit(row.key, { simulatorUrl: e.target.value })} placeholder="https://..." />
              </Field>
              <Field label="الرابط الخارجي البديل">
                <TextInput dir="ltr" value={row.externalUrl} onChange={e => edit(row.key, { externalUrl: e.target.value })} placeholder="https://..." />
              </Field>
            </div>
            <button className="cms-save-btn" onClick={() => save(row)}><i className="fas fa-check" /> حفظ</button>
          </div>
        ))}
      </div>
      {toastNode}
    </div>
  );
}
