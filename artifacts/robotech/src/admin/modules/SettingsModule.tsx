import { useState } from "react";
import { getSettings, saveSettings } from "../../services/siteStore";
import { MediaPicker } from "../components/MediaPicker";
import { useCmsToast, Field, TextInput, SaveBtn } from "../components/ui";

export default function SettingsModule() {
  const [s, setS] = useState(getSettings);
  const [picker, setPicker] = useState<"logo" | "banner" | null>(null);
  const { show, node: toastNode } = useCmsToast();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveSettings(s);
    if (!res.ok) { show(res.error, "error"); return; }
    show("تم حفظ الإعدادات وتطبيقها فوراً على واجهة الطلاب");
  };

  return (
    <div className="cms-module">
      <form onSubmit={save} className="cms-form cms-settings-form">
        <div className="cms-sim-card">
          <div className="cms-sim-head"><i className="fas fa-id-badge" style={{ color: "#667eea", fontSize: 20 }} /><strong>الهوية</strong></div>
          <div className="cms-grid-2">
            <Field label="اسم الموقع" hint="يظهر في ترويسة الموقع وعنوان المتصفح">
              <TextInput value={s.siteName} onChange={e => setS({ ...s, siteName: e.target.value })} />
            </Field>
            <Field label="الشعار" hint="إيموجي، رابط صورة، أو من مكتبة الوسائط">
              <div className="cms-src-row">
                <TextInput dir="ltr" value={s.logo} onChange={e => setS({ ...s, logo: e.target.value })} />
                <button type="button" className="cms-add-btn" onClick={() => setPicker("logo")}><i className="fas fa-image" /> المكتبة</button>
              </div>
            </Field>
          </div>
          <div className="cms-grid-2">
            <Field label="اللون الأساسي">
              <div className="cms-color-row">
                <input type="color" value={s.primaryColor} onChange={e => setS({ ...s, primaryColor: e.target.value })} />
                <TextInput dir="ltr" value={s.primaryColor} onChange={e => setS({ ...s, primaryColor: e.target.value })} />
              </div>
            </Field>
            <Field label="اللون الثانوي">
              <div className="cms-color-row">
                <input type="color" value={s.accentColor} onChange={e => setS({ ...s, accentColor: e.target.value })} />
                <TextInput dir="ltr" value={s.accentColor} onChange={e => setS({ ...s, accentColor: e.target.value })} />
              </div>
            </Field>
          </div>
        </div>

        <div className="cms-sim-card">
          <div className="cms-sim-head"><i className="fas fa-image" style={{ color: "#f7971e", fontSize: 20 }} /><strong>بانر الصفحة الرئيسية</strong></div>
          <Field label="نص البانر" hint="يستبدل السطر التعريفي أسفل الترحيب — اتركه فارغاً للنص الافتراضي">
            <TextInput value={s.bannerText} onChange={e => setS({ ...s, bannerText: e.target.value })} />
          </Field>
          <Field label="صورة البانر (اختياري)" hint="تظهر أعلى الصفحة الرئيسية للطلاب — من مكتبة الوسائط أو رابط">
            <div className="cms-src-row">
              <TextInput dir="ltr" value={s.bannerImage} onChange={e => setS({ ...s, bannerImage: e.target.value })} placeholder="https://..." />
              <button type="button" className="cms-add-btn" onClick={() => setPicker("banner")}><i className="fas fa-image" /> المكتبة</button>
            </div>
          </Field>
        </div>

        <div className="cms-sim-card">
          <div className="cms-sim-head"><i className="fas fa-shoe-prints" style={{ color: "#43e97b", fontSize: 20 }} /><strong>التذييل وروابط التواصل</strong></div>
          <div className="cms-grid-2">
            <Field label="نص التذييل" hint="اتركه فارغاً للنص الافتراضي">
              <TextInput value={s.footerText} onChange={e => setS({ ...s, footerText: e.target.value })} />
            </Field>
            <Field label="رقم الهاتف">
              <TextInput dir="ltr" value={s.footerPhone} onChange={e => setS({ ...s, footerPhone: e.target.value })} placeholder="+212 ..." />
            </Field>
          </div>
          <div className="cms-grid-2">
            <Field label="فيسبوك"><TextInput dir="ltr" value={s.socialFacebook} onChange={e => setS({ ...s, socialFacebook: e.target.value })} placeholder="https://facebook.com/..." /></Field>
            <Field label="إنستغرام"><TextInput dir="ltr" value={s.socialInstagram} onChange={e => setS({ ...s, socialInstagram: e.target.value })} placeholder="https://instagram.com/..." /></Field>
          </div>
          <div className="cms-grid-2">
            <Field label="يوتيوب"><TextInput dir="ltr" value={s.socialYoutube} onChange={e => setS({ ...s, socialYoutube: e.target.value })} placeholder="https://youtube.com/..." /></Field>
            <Field label="واتساب"><TextInput dir="ltr" value={s.socialWhatsapp} onChange={e => setS({ ...s, socialWhatsapp: e.target.value })} placeholder="https://wa.me/..." /></Field>
          </div>
        </div>

        <div className="cms-form-foot"><SaveBtn /></div>
      </form>

      {picker && (
        <MediaPicker
          title={picker === "logo" ? "اختر الشعار" : "اختر صورة البانر"}
          categories={picker === "logo" ? ["logo", "image"] : ["banner", "image"]}
          onSelect={src => { setS(picker === "logo" ? { ...s, logo: src } : { ...s, bannerImage: src }); setPicker(null); }}
          onClose={() => setPicker(null)}
        />
      )}
      {toastNode}
    </div>
  );
}
