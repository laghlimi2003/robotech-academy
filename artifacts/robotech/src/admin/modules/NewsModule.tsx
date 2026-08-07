import { useState } from "react";
import { getNews, createNews, updateNews, deleteNews, type NewsItem } from "../../services/siteStore";
import { useCmsToast, CmsModal, CmsConfirm, Field, TextInput, TextArea, Toggle, AddBtn, SaveBtn } from "../components/ui";

export default function NewsModule() {
  const [items, setItems] = useState(getNews);
  const [editing, setEditing] = useState<{ id: string | null; title: string; body: string; published: boolean } | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const { show, node: toastNode } = useCmsToast();

  const refresh = () => setItems(getNews());

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const res = editing.id === null
      ? createNews(editing.title, editing.body, editing.published)
      : updateNews(editing.id, { title: editing.title.trim(), body: editing.body.trim(), published: editing.published });
    if (!res.ok) { show(res.error, "error"); return; }
    show(editing.id === null ? "تم إنشاء الخبر" : "تم حفظ الخبر");
    setEditing(null);
    refresh();
  };

  const togglePublish = (n: NewsItem) => {
    updateNews(n.id, { published: !n.published });
    show(n.published ? "تم إلغاء نشر الخبر" : "تم نشر الخبر");
    refresh();
  };

  return (
    <div className="cms-module">
      <div className="cms-module-head">
        <p className="cms-note"><i className="fas fa-circle-info" /> الأخبار تُدار هنا الآن؛ عرضها للطلاب سيُفعَّل في مرحلة لاحقة.</p>
        <AddBtn onClick={() => setEditing({ id: null, title: "", body: "", published: false })}>خبر جديد</AddBtn>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty"><i className="fas fa-bullhorn" /><p>لا توجد أخبار بعد</p></div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table cms-table">
            <thead><tr><th>العنوان</th><th>التاريخ</th><th>الحالة</th><th>إجراءات</th></tr></thead>
            <tbody>
              {items.map(n => (
                <tr key={n.id} className={n.published ? "" : "cms-row-hidden"}>
                  <td><strong>{n.title}</strong><div className="cms-sub">{n.body.slice(0, 80)}</div></td>
                  <td dir="ltr">{n.createdAt.slice(0, 10)}</td>
                  <td><Toggle checked={n.published} onChange={() => togglePublish(n)} labels={["منشور", "مسودة"]} /></td>
                  <td>
                    <button className="cms-icon-btn" onClick={() => setEditing({ id: n.id, title: n.title, body: n.body, published: n.published })} title="تعديل"><i className="fas fa-pen" /></button>
                    <button className="cms-icon-btn danger" onClick={() => setConfirmId(n.id)} title="حذف"><i className="fas fa-trash" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editing && (
        <CmsModal title={editing.id === null ? "خبر جديد" : "تعديل الخبر"} onClose={() => setEditing(null)}>
          <form onSubmit={save} className="cms-form">
            <Field label="العنوان"><TextInput value={editing.title} onChange={e => setEditing({ ...editing, title: e.target.value })} /></Field>
            <Field label="نص الخبر"><TextArea rows={5} value={editing.body} onChange={e => setEditing({ ...editing, body: e.target.value })} /></Field>
            <Field label="الحالة"><Toggle checked={editing.published} onChange={v => setEditing({ ...editing, published: v })} labels={["منشور", "مسودة"]} /></Field>
            <div className="cms-form-foot"><SaveBtn /></div>
          </form>
        </CmsModal>
      )}

      {confirmId && (
        <CmsConfirm message="سيتم حذف هذا الخبر نهائياً." onYes={() => { deleteNews(confirmId); setConfirmId(null); show("تم حذف الخبر"); refresh(); }} onNo={() => setConfirmId(null)} />
      )}
      {toastNode}
    </div>
  );
}
