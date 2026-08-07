/**
 * Admin module registry (Phase 2A).
 * Each entry becomes a protected route: #/admin/<id>
 * Phase 2B will replace `placeholder: true` modules with real CRUD screens.
 */
export interface AdminModule {
  id: string;
  icon: string;      // Font Awesome class
  title: string;
  desc: string;
  placeholder: boolean;
}

export const ADMIN_MODULES: AdminModule[] = [
  { id: "dashboard",    icon: "fa-gauge-high",      title: "لوحة المعلومات", desc: "نظرة عامة على نشاط الأكاديمية والإحصائيات الرئيسية.", placeholder: true },
  { id: "users",        icon: "fa-users",           title: "المستخدمون",     desc: "إدارة حسابات الطلاب: البحث، الإحصائيات، والحذف.",     placeholder: false },
  { id: "labs",         icon: "fa-flask",           title: "المختبرات",      desc: "إنشاء وتعديل مختبرات التعلم (Arduino، Scratch، ...).", placeholder: false },
  { id: "lessons",      icon: "fa-book-open",       title: "الدروس",         desc: "إدارة محتوى الدروس داخل كل مختبر.",                   placeholder: false },
  { id: "videos",       icon: "fa-video",           title: "الفيديوهات",     desc: "رفع وربط فيديوهات الدروس.",                            placeholder: false },
  { id: "media",        icon: "fa-photo-film",      title: "مكتبة الوسائط",  desc: "رفع وإدارة الصور والفيديوهات والملفات.",               placeholder: false },
  { id: "simulators",   icon: "fa-microchip",       title: "المحاكيات",      desc: "إدارة روابط المحاكيات الخارجية وإعداداتها.",           placeholder: false },
  { id: "quizzes",      icon: "fa-circle-question", title: "الاختبارات",     desc: "إنشاء أسئلة الاختبارات وربطها بالدروس.",               placeholder: false },
  { id: "tasks",        icon: "fa-list-check",      title: "المهام",         desc: "إدارة مهام الأبطال داخل المختبرات.",                   placeholder: false },
  { id: "certificates", icon: "fa-award",           title: "الشهادات",       desc: "تخصيص شهادات إتمام المختبرات.",                        placeholder: true },
  { id: "news",         icon: "fa-bullhorn",        title: "الأخبار",        desc: "نشر إعلانات وأخبار الأكاديمية للطلاب.",                placeholder: false },
  { id: "settings",     icon: "fa-gear",            title: "الإعدادات",      desc: "إعدادات المنصة العامة واللغات والمظهر.",               placeholder: false },
  { id: "analytics",    icon: "fa-chart-line",      title: "التحليلات",      desc: "تقارير تفصيلية عن تقدم الطلاب واستخدام المنصة.",       placeholder: true },
];

export const DEFAULT_MODULE_ID = "dashboard";

export function findModule(id: string): AdminModule | undefined {
  return ADMIN_MODULES.find(m => m.id === id);
}
