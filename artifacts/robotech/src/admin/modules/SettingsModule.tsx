import { useState } from "react";
import { getSettings, saveSettings } from "../../services/siteStore";
import { useCmsToast, Field, TextInput, SaveBtn } from "../components/ui";

export default function SettingsModule() {
  const [s, setS] = useState(getSettings);
  const { show, node: toastNode } = useCmsToast();

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const res = saveSettings(s);
    if (!res.ok) { show(res.error, "error"); return; }
    show("تم حفظ الإعدادات (تظهر للطلاب عند تحديث الصفحة)");
  };

  return (
    <div className="cms-module">
      <form onSubmit={save} className="cms-form cms-settings-form">
        <div className="cms-grid-2">
          <Field label="اسم الموقع" hint="يظهر في ترويسة الموقع وعنوان المتصفح">
            <TextInput value={s.siteName} onChange={e => setS({ ...s, siteName: e.target.value })} />
          </Field>
          <Field label="الشعار" hint="إيموجي (مثل 🤖) أو رابط صورة">
            <TextInput dir="ltr" value={s.logo} onChange={e => setS({ ...s, logo: e.target.value })} />
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
        <Field label="نص بانر الصفحة الرئيسية" hint="يستبدل السطر التعريفي أسفل الترحيب في صفحة الطلاب — اتركه فارغاً للنص الافتراضي">
          <TextInput value={s.bannerText} onChange={e => setS({ ...s, bannerText: e.target.value })} />
        </Field>
        <div className="cms-form-foot"><SaveBtn /></div>
      </form>
      <p className="cms-note"><i className="fas fa-circle-info" /> الألوان محفوظة وستُطبَّق على سمة الموقع بالكامل مع تكامل قاعدة البيانات في المرحلة 3؛ حالياً تُطبَّق على شعار الترويسة.</p>
      {toastNode}
    </div>
  );
}
