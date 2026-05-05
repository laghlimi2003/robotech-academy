export type LessonType = "video" | "embed";
export type Difficulty = "beginner" | "intermediate" | "advanced";

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
  description: string;
  difficulty: Difficulty;
  difficultyLabel: string;
  ageRange: string;
  faIcon: string;
  color: string;
  gradient: string;
  glowColor: string;
  tag: string;
  simulatorUrl: string;
  externalUrl: string;
  lessons: Lesson[];
  heroTasks: string[];
  skills: string[];
}

export const labConfigs: Record<string, LabConfig> = {
  scratch: {
    key: "scratch",
    title: "عالم سكراتش",
    subtitle: "برمجة الألعاب والقصص",
    description: "تعلّم البرمجة باللعب! أنشئ قصصاً وألعاباً وموسيقى رائعة بسحب الكتل البرمجية.",
    difficulty: "beginner",
    difficultyLabel: "مبتدئ",
    ageRange: "6 - 12",
    faIcon: "fa-puzzle-piece",
    color: "#4facfe",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    glowColor: "rgba(79,172,254,0.5)",
    tag: "🎮 الأكثر شعبية",
    simulatorUrl: "https://snap.berkeley.edu/snap/snap.html",
    externalUrl: "https://scratch.mit.edu/",
    lessons: [
      { title: "مقدمة في سكراتش", description: "تعرف على واجهة سكراتش وكتل البرمجة الأساسية.", type: "video", src: "videos/scratch-intro.mp4", duration: "05:30" },
      { title: "إنشاء أول مشروع", description: "أنشئ شخصيتك الأولى وحركها على المسرح.", type: "video", src: "videos/scratch-project.mp4", duration: "08:15" },
      { title: "التحكم والحركة", description: "كتل الحركة والاتجاهات والإحداثيات.", type: "embed", src: "", duration: "07:40" },
      { title: "الأحداث والتفاعل", description: "اجعل مشروعك يستجيب لضغطات لوحة المفاتيح.", type: "video", src: "videos/scratch-events.mp4", duration: "06:20" },
      { title: "مشروع لعبة كاملة", description: "ابنِ لعبة مكتملة من الصفر خطوة بخطوة.", type: "embed", src: "", duration: "15:00" },
    ],
    heroTasks: ["افتح محرر Snap!", "أضف شخصية جديدة", "حرّك الشخصية بالسهام", "أضف صوتاً للمشروع", "أنشئ خلفية ملونة", "احفظ وشارك مشروعك"],
    skills: ["تفكير منطقي", "حل المشكلات", "إبداع", "تسلسل الأوامر"],
  },

  arduino: {
    key: "arduino",
    title: "مختبر أردوينو",
    subtitle: "الإلكترونيات والدوائر الذكية",
    description: "ادخل عالم الإلكترونيات! برمج لوحة أردوينو وتحكم في مصابيح وحساسات ومحركات.",
    difficulty: "intermediate",
    difficultyLabel: "متوسط",
    ageRange: "10 - 16",
    faIcon: "fa-microchip",
    color: "#00b09b",
    gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    glowColor: "rgba(0,176,155,0.5)",
    tag: "⚡ مميز",
    simulatorUrl: "https://wokwi.com/projects/new/arduino-uno",
    externalUrl: "https://wokwi.com/projects/new/arduino-uno",
    lessons: [
      { title: "ما هو الأردوينو؟", description: "تعرف على اللوحة والمنافذ والمكونات الأساسية.", type: "video", src: "videos/arduino-intro.mp4", duration: "06:10" },
      { title: "تشغيل LED", description: "أول مشروع: تشغيل وإطفاء LED بالكود.", type: "video", src: "videos/arduino-led.mp4", duration: "09:20" },
      { title: "قراءة الحساسات", description: "اقرأ القيم من حساسات الضوء والحرارة.", type: "embed", src: "", duration: "11:00" },
      { title: "التحكم في المحرك", description: "حرّك سيرفو موتور بزوايا محددة.", type: "video", src: "videos/arduino-motor.mp4", duration: "08:45" },
    ],
    heroTasks: ["افتح مشروع أردوينو", "وصّل LED بالمنفذ 13", "اكتب كود Blink", "شغّل المحاكاة", "أضف مقاومة 220 أوم", "اقرأ قيمة حساس"],
    skills: ["C/C++", "دوائر كهربائية", "PWM", "Serial Monitor"],
  },

  wedo: {
    key: "wedo",
    title: "بيئة WeDo 2.0",
    subtitle: "روبوتات LEGO البسيطة",
    description: "ابنِ روبوتك من قطع LEGO وبرمجه! تعلّم كيف تجمع بين البناء والبرمجة.",
    difficulty: "beginner",
    difficultyLabel: "مبتدئ",
    ageRange: "6 - 10",
    faIcon: "fa-robot",
    color: "#f093fb",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    glowColor: "rgba(240,147,251,0.5)",
    tag: "🧱 LEGO",
    simulatorUrl: "https://lab.open-roberta.org/",
    externalUrl: "https://lab.open-roberta.org/",
    lessons: [
      { title: "مقدمة WeDo 2.0", description: "مكونات المجموعة وطريقة التركيب الأساسية.", type: "video", src: "videos/wedo-intro.mp4", duration: "04:50" },
      { title: "بناء روبوت بسيط", description: "شرح خطوة بخطوة لبناء نموذج أولي.", type: "video", src: "videos/wedo-build.mp4", duration: "07:10" },
      { title: "تشغيل المحرك والحساس", description: "البرمجة الأساسية وربط الحركة بالحساسات.", type: "embed", src: "", duration: "08:35" },
    ],
    heroTasks: ["افتح Open Roberta", "اختر WeDo 2.0", "أنشئ برنامج حركة", "أضف حساس الحركة", "شغّل البرنامج"],
    skills: ["LEGO Mindstorms", "تصميم ميكانيكي", "برمجة بصرية", "مستشعرات"],
  },

  gears: {
    key: "gears",
    title: "محاكي GearS",
    subtitle: "روبوتات EV3 و Spike Prime",
    description: "محاكٍ ثلاثي الأبعاد متطور لتبرمج روبوتات EV3 و Spike Prime وتحل التحديات.",
    difficulty: "intermediate",
    difficultyLabel: "متوسط",
    ageRange: "10 - 15",
    faIcon: "fa-cog",
    color: "#20bf55",
    gradient: "linear-gradient(135deg, #20bf55 0%, #01baef 100%)",
    glowColor: "rgba(32,191,85,0.5)",
    tag: "🏆 تحديات",
    simulatorUrl: "https://gears.aposteriori.com.sg/",
    externalUrl: "https://gears.aposteriori.com.sg/",
    lessons: [
      { title: "التعرف على GearS", description: "واجهة المحاكي وكيفية تشغيل الروبوت.", type: "video", src: "videos/gears-intro.mp4", duration: "05:40" },
      { title: "برمجة الحركة الأساسية", description: "الحركات الأمامية والخلفية والدوران.", type: "video", src: "videos/gears-move.mp4", duration: "09:00" },
      { title: "حل تحدي المتاهة", description: "تطبيق عملي بالحساسات والحلقات الشرطية.", type: "embed", src: "", duration: "10:20" },
    ],
    heroTasks: ["افتح محاكي GearS", "حمّل بيئة EV3", "برمج حركة للأمام", "أضف منعطف 90°", "تجاوز العائق الأول", "حل تحدي المتاهة"],
    skills: ["Python", "EV3-Python", "خوارزميات", "حساسات المسافة"],
  },

  python: {
    key: "python",
    title: "بايثون التفاعلي",
    subtitle: "البرمجة بلغة المستقبل",
    description: "تعلّم Python — لغة الذكاء الاصطناعي والروبوتات — من خلال مشاريع ممتعة ومرئية.",
    difficulty: "advanced",
    difficultyLabel: "متقدم",
    ageRange: "12 - 18",
    faIcon: "fa-code",
    color: "#667eea",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    glowColor: "rgba(102,126,234,0.5)",
    tag: "🤖 AI & Robots",
    simulatorUrl: "https://trinket.io/python",
    externalUrl: "https://trinket.io/python",
    lessons: [
      { title: "مقدمة في Python", description: "المتغيرات والأوامر الأساسية وأول برنامج.", type: "video", src: "videos/python-intro.mp4", duration: "07:00" },
      { title: "الحلقات والشروط", description: "for وwhile وif في مشاريع مرئية.", type: "video", src: "videos/python-loops.mp4", duration: "10:00" },
      { title: "برمجة Turtle", description: "ارسم أشكالاً هندسية بكود Python.", type: "embed", src: "https://trinket.io/python", duration: "09:30" },
    ],
    heroTasks: ["اكتب برنامج Hello World", "استخدم المتغيرات", "ارسم مربعاً بـ Turtle", "أنشئ حلقة for", "حل تحدي الأعداد الأولى"],
    skills: ["Python 3", "Turtle Graphics", "خوارزميات", "AI أساسيات"],
  },

  advanced: {
    key: "advanced",
    title: "روبوتات صناعية",
    subtitle: "محاكاة الأذرع الروبوتية",
    description: "محاكاة أذرع الروبوت الصناعية المستخدمة في المصانع الكبرى. تعلّم الإحداثيات والمسارات.",
    difficulty: "advanced",
    difficultyLabel: "متقدم",
    ageRange: "14 - 18",
    faIcon: "fa-industry",
    color: "#a55eea",
    gradient: "linear-gradient(135deg, #a55eea 0%, #4a00e0 100%)",
    glowColor: "rgba(165,94,234,0.5)",
    tag: "🏭 صناعي",
    simulatorUrl: "https://rocksi.net",
    externalUrl: "https://rocksi.net",
    lessons: [
      { title: "الروبوتات الصناعية", description: "استخدامات الأذرع الروبوتية في المصانع.", type: "video", src: "videos/advanced-intro.mp4", duration: "06:45" },
      { title: "الإحداثيات والمسارات", description: "تحريك الذراع بين نقاط متعددة.", type: "video", src: "videos/advanced-path.mp4", duration: "12:00" },
      { title: "سيناريو صناعي كامل", description: "خط إنتاج افتراضي كامل.", type: "embed", src: "", duration: "13:25" },
    ],
    heroTasks: ["افتح محاكي Rocksi", "حرّك الذراع للأمام", "حدد نقطة بداية", "حدد نقطة نهاية", "شغّل المسار الكامل"],
    skills: ["ROS", "إحداثيات XYZ", "Kinematics", "G-code"],
  },
};

export const labsList = Object.values(labConfigs);
export const difficultyColors: Record<Difficulty, string> = {
  beginner: "#43e97b",
  intermediate: "#f7971e",
  advanced: "#f5576c",
};
