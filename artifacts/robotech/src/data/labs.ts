export type LessonType = "video" | "embed";

export interface Lesson {
  title: string;
  description: string;
  type: LessonType;
  src: string;
  duration: string;
}

export interface LabConfig {
  key: string;
  title: string;
  subtitle: string;
  iconClass: string;
  cardClass: string;
  frameId: string;
  externalUrl: string;
  simulatorUrl: string;
  lessons: Lesson[];
  heroTasks: string[];
}

export const labConfigs: Record<string, LabConfig> = {
  scratch: {
    key: "scratch",
    title: "مختبر سكراتش",
    subtitle: "برمجة الألعاب والقصص التفاعلية",
    iconClass: "scratch-icon",
    cardClass: "scratch-card",
    frameId: "scratch-frame",
    externalUrl: "https://turbowarp.org/editor",
    simulatorUrl: "https://turbowarp.org/editor",
    lessons: [
      {
        title: "مقدمة في سكراتش",
        description: "تعرف على واجهة سكراتش وطريقة استخدام الكتل البرمجية الأساسية.",
        type: "video",
        src: "videos/scratch-intro.mp4",
        duration: "05:30",
      },
      {
        title: "إنشاء أول مشروع",
        description: "تعلم كيفية إنشاء شخصية وتحريكها داخل المسرح خطوة بخطوة.",
        type: "video",
        src: "videos/scratch-video.mp4",
        duration: "08:15",
      },
      {
        title: "التحكم والحركة",
        description: "كتل الحركة، الاتجاهات، والإحداثيات في سكراتش.",
        type: "embed",
        src: "",
        duration: "07:40",
      },
    ],
    heroTasks: [
      "فتح محرر سكراتش",
      "إضافة شخصية جديدة",
      "تحريك الشخصية لليمين",
      "إضافة صوت للمشروع",
      "حفظ المشروع",
    ],
  },

  arduino: {
    key: "arduino",
    title: "مختبر أردوينو",
    subtitle: "الإلكترونيات والدوائر الذكية",
    iconClass: "arduino-icon",
    cardClass: "arduino-card",
    frameId: "arduino-frame",
    externalUrl: "https://wokwi.com/projects/new/arduino-uno",
    simulatorUrl: "https://wokwi.com/projects/new/arduino-uno",
    lessons: [
      {
        title: "ما هو الأردوينو؟",
        description: "مقدمة تمهيدية تشرح اللوحة والمنافذ والمكونات الأساسية.",
        type: "video",
        src: "videos/arduino-video.mp4",
        duration: "06:10",
      },
      {
        title: "تشغيل LED",
        description: "شرح أول مشروع: تشغيل وإطفاء LED باستخدام الكود.",
        type: "video",
        src: "videos/arduino-led.mp4",
        duration: "09:20",
      },
      {
        title: "قراءة الحساسات",
        description: "شرح قراءة القيم من الحساسات وربطها بالقرارات البرمجية.",
        type: "embed",
        src: "",
        duration: "11:00",
      },
    ],
    heroTasks: [
      "فتح مشروع أردوينو جديد",
      "توصيل LED بالمنفذ 13",
      "كتابة كود Blink",
      "تشغيل المحاكاة",
      "إضافة مقاومة للدائرة",
    ],
  },

  wedo: {
    key: "wedo",
    title: "بيئة WeDo 2.0",
    subtitle: "بناء وبرمجة الروبوتات البسيطة",
    iconClass: "wedo-icon",
    cardClass: "wedo-card",
    frameId: "wedo-frame",
    externalUrl: "https://lab.open-roberta.org/",
    simulatorUrl: "https://lab.open-roberta.org/",
    lessons: [
      {
        title: "مقدمة WeDo 2.0",
        description: "مكونات المجموعة وطريقة التركيب الأساسية.",
        type: "video",
        src: "videos/wedo-intro.mp4",
        duration: "04:50",
      },
      {
        title: "بناء روبوت بسيط",
        description: "شرح خطوة بخطوة لبناء نموذج أولي بسيط.",
        type: "video",
        src: "videos/wedo-build.mp4",
        duration: "07:10",
      },
      {
        title: "تشغيل المحرك والحساس",
        description: "البرمجة الأساسية وربط الحركة بالحساسات.",
        type: "embed",
        src: "",
        duration: "08:35",
      },
    ],
    heroTasks: [
      "فتح Open Roberta",
      "اختيار WeDo 2.0",
      "إنشاء برنامج حركة",
      "إضافة حساس الحركة",
      "تشغيل البرنامج",
    ],
  },

  gears: {
    key: "gears",
    title: "محاكي GearS",
    subtitle: "روبوتات EV3 و Spike Prime",
    iconClass: "gears-icon",
    cardClass: "gears-card",
    frameId: "gears-frame",
    externalUrl: "https://gears.aposteriori.com.sg/",
    simulatorUrl: "https://gears.aposteriori.com.sg/",
    lessons: [
      {
        title: "التعرف على GearS",
        description: "فيديو تعريفي بواجهة المحاكي وكيفية تشغيل الروبوت.",
        type: "video",
        src: "videos/gears-intro.mp4",
        duration: "05:40",
      },
      {
        title: "برمجة الحركة الأساسية",
        description: "شرح الحركات الأمامية والخلفية والدوران في المحاكي.",
        type: "video",
        src: "videos/gears-movement.mp4",
        duration: "09:00",
      },
      {
        title: "حل تحدي المتاهة",
        description: "تطبيق عملي باستخدام الحساسات والحلقات الشرطية.",
        type: "embed",
        src: "",
        duration: "10:20",
      },
    ],
    heroTasks: [
      "فتح محاكي GearS",
      "تحميل بيئة EV3",
      "برمجة حركة للأمام",
      "إضافة منعطف 90 درجة",
      "حل التحدي الأول",
    ],
  },

  advanced: {
    key: "advanced",
    title: "روبوتات صناعية",
    subtitle: "محاكاة أذرع الروبوت المتقدمة",
    iconClass: "advanced-icon",
    cardClass: "advanced-card",
    frameId: "advanced-frame",
    externalUrl: "https://rocksi.net",
    simulatorUrl: "https://rocksi.net",
    lessons: [
      {
        title: "مقدمة في الروبوتات الصناعية",
        description: "استخدامات الأذرع الروبوتية في المصانع والصناعة.",
        type: "video",
        src: "videos/advanced-intro.mp4",
        duration: "06:45",
      },
      {
        title: "الإحداثيات والمسارات",
        description: "كيفية تحريك الذراع الروبوتية بين نقاط متعددة.",
        type: "video",
        src: "videos/advanced-coordinates.mp4",
        duration: "12:00",
      },
      {
        title: "سيناريو صناعي كامل",
        description: "تطبيق لالتقاط العناصر وترتيبها بخط إنتاج افتراضي.",
        type: "embed",
        src: "",
        duration: "13:25",
      },
    ],
    heroTasks: [
      "فتح محاكي Rocksi",
      "تحريك الذراع للأمام",
      "تحديد نقطة بداية",
      "تحديد نقطة نهاية",
      "تشغيل المسار الكامل",
    ],
  },
};

export const labsList = Object.values(labConfigs);
