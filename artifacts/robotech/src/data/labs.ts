import type { Lang } from "../hooks/useLang";

export type LessonType = "video" | "embed";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Localized<T> = Record<Lang, T>;

export interface Lesson {
  title: Localized<string>;
  description: Localized<string>;
  type: LessonType;
  src: string;
  duration: string;
}

export interface LabConfig {
  key: string;
  title: Localized<string>;
  subtitle: Localized<string>;
  description: Localized<string>;
  difficulty: Difficulty;
  ageRange: string;
  faIcon: string;
  color: string;
  gradient: string;
  glowColor: string;
  tag: Localized<string>;
  simulatorUrl: string;
  externalUrl: string;
  lessons: Lesson[];
  heroTasks: Localized<string[]>;
  skills: Localized<string[]>;
}

export interface LocalizedLab {
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
  lessons: { title: string; description: string; type: LessonType; src: string; duration: string }[];
  heroTasks: string[];
  skills: string[];
}

const DIFFICULTY_LABELS: Record<Difficulty, Localized<string>> = {
  beginner:     { ar: "مبتدئ",  en: "Beginner",     fr: "Débutant" },
  intermediate: { ar: "متوسط",  en: "Intermediate", fr: "Intermédiaire" },
  advanced:     { ar: "متقدم",  en: "Advanced",     fr: "Avancé" },
};

export function localizeLab(lab: LabConfig, lang: Lang): LocalizedLab {
  return {
    key: lab.key,
    title: lab.title[lang],
    subtitle: lab.subtitle[lang],
    description: lab.description[lang],
    difficulty: lab.difficulty,
    difficultyLabel: DIFFICULTY_LABELS[lab.difficulty][lang],
    ageRange: lab.ageRange,
    faIcon: lab.faIcon,
    color: lab.color,
    gradient: lab.gradient,
    glowColor: lab.glowColor,
    tag: lab.tag[lang],
    simulatorUrl: lab.simulatorUrl,
    externalUrl: lab.externalUrl,
    lessons: lab.lessons.map(l => ({
      title: l.title[lang],
      description: l.description[lang],
      type: l.type,
      src: l.src,
      duration: l.duration,
    })),
    heroTasks: lab.heroTasks[lang],
    skills: lab.skills[lang],
  };
}

export const labConfigs: Record<string, LabConfig> = {
  scratch: {
    key: "scratch",
    title:       { ar: "عالم سكراتش", en: "Scratch World", fr: "Monde Scratch" },
    subtitle:    { ar: "برمجة الألعاب والقصص", en: "Game & Story Coding", fr: "Codage de jeux & histoires" },
    description: {
      ar: "تعلّم البرمجة باللعب! أنشئ قصصاً وألعاباً وموسيقى رائعة بسحب الكتل البرمجية.",
      en: "Learn to code by playing. Create amazing stories, games, and music by dragging code blocks.",
      fr: "Apprenez à coder en jouant. Créez des histoires, des jeux et de la musique en glissant des blocs.",
    },
    difficulty: "beginner",
    ageRange: "6 - 12",
    faIcon: "fa-puzzle-piece",
    color: "#4facfe",
    gradient: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    glowColor: "rgba(79,172,254,0.5)",
    tag: { ar: "🎮 الأكثر شعبية", en: "🎮 Most Popular", fr: "🎮 Plus Populaire" },
    simulatorUrl: "https://snap.berkeley.edu/snap/snap.html",
    externalUrl: "https://scratch.mit.edu/",
    lessons: [
      {
        title:       { ar: "مقدمة في سكراتش", en: "Introduction to Scratch", fr: "Introduction à Scratch" },
        description: { ar: "تعرف على واجهة سكراتش وكتل البرمجة الأساسية.", en: "Learn the Scratch interface and basic blocks.", fr: "Découvrez l'interface Scratch et les blocs de base." },
        type: "video", src: "/videos/scratch-intro.mp4", duration: "05:30",
      },
      {
        title:       { ar: "إنشاء أول مشروع", en: "Your First Project", fr: "Votre Premier Projet" },
        description: { ar: "أنشئ شخصيتك الأولى وحركها على المسرح.", en: "Create your first sprite and animate it on stage.", fr: "Créez votre premier personnage et animez-le." },
        type: "video", src: "/videos/scratch-project.mp4", duration: "08:15",
      },
      {
        title:       { ar: "التحكم والحركة", en: "Control & Motion", fr: "Contrôle & Mouvement" },
        description: { ar: "كتل الحركة والاتجاهات والإحداثيات.", en: "Motion blocks, directions, and coordinates.", fr: "Blocs de mouvement, directions et coordonnées." },
        type: "embed", src: "", duration: "07:40",
      },
      {
        title:       { ar: "الأحداث والتفاعل", en: "Events & Interaction", fr: "Événements & Interaction" },
        description: { ar: "اجعل مشروعك يستجيب لضغطات لوحة المفاتيح.", en: "Make your project respond to keyboard input.", fr: "Rendez votre projet interactif avec le clavier." },
        type: "video", src: "/videos/scratch-events.mp4", duration: "06:20",
      },
      {
        title:       { ar: "مشروع لعبة كاملة", en: "Full Game Project", fr: "Projet Jeu Complet" },
        description: { ar: "ابنِ لعبة مكتملة من الصفر خطوة بخطوة.", en: "Build a complete game from scratch, step by step.", fr: "Construisez un jeu complet, étape par étape." },
        type: "embed", src: "", duration: "15:00",
      },
    ],
    heroTasks: {
      ar: ["افتح محرر Snap!", "أضف شخصية جديدة", "حرّك الشخصية بالسهام", "أضف صوتاً للمشروع", "أنشئ خلفية ملونة", "احفظ وشارك مشروعك"],
      en: ["Open the Snap! editor", "Add a new sprite", "Move the sprite with arrows", "Add sound to the project", "Create a colorful backdrop", "Save and share your project"],
      fr: ["Ouvrir l'éditeur Snap!", "Ajouter un nouveau sprite", "Déplacer avec les flèches", "Ajouter du son", "Créer un fond coloré", "Sauvegarder et partager"],
    },
    skills: {
      ar: ["تفكير منطقي", "حل المشكلات", "إبداع", "تسلسل الأوامر"],
      en: ["Logical Thinking", "Problem Solving", "Creativity", "Command Sequencing"],
      fr: ["Pensée Logique", "Résolution Problèmes", "Créativité", "Séquençage"],
    },
  },

  arduino: {
    key: "arduino",
    title:       { ar: "مختبر أردوينو", en: "Arduino Lab", fr: "Labo Arduino" },
    subtitle:    { ar: "الإلكترونيات والدوائر الذكية", en: "Electronics & Smart Circuits", fr: "Électronique & Circuits" },
    description: {
      ar: "ادخل عالم الإلكترونيات! برمج لوحة أردوينو وتحكم في مصابيح وحساسات ومحركات.",
      en: "Enter the world of electronics. Program an Arduino board to control LEDs, sensors, and motors.",
      fr: "Entrez dans l'électronique. Programmez Arduino pour contrôler LEDs, capteurs et moteurs.",
    },
    difficulty: "intermediate",
    ageRange: "10 - 16",
    faIcon: "fa-microchip",
    color: "#00b09b",
    gradient: "linear-gradient(135deg, #00b09b 0%, #96c93d 100%)",
    glowColor: "rgba(0,176,155,0.5)",
    tag: { ar: "⚡ مميز", en: "⚡ Featured", fr: "⚡ En Vedette" },
    simulatorUrl: "https://wokwi.com/projects/new/arduino-uno",
    externalUrl: "https://wokwi.com/projects/new/arduino-uno",
    lessons: [
      {
        title:       { ar: "ما هو الأردوينو؟", en: "What is Arduino?", fr: "Qu'est-ce qu'Arduino?" },
        description: { ar: "تعرف على اللوحة والمنافذ والمكونات الأساسية.", en: "Learn about the board, pins, and core components.", fr: "Découvrez la carte, les broches et les composants." },
        type: "video", src: "/videos/arduino-intro.mp4?v=3", duration: "06:10",
      },
      {
        title:       { ar: "تشغيل LED", en: "Blinking an LED", fr: "Allumer une LED" },
        description: { ar: "أول مشروع: تشغيل وإطفاء LED بالكود.", en: "First project: turn an LED on and off with code.", fr: "Premier projet: allumer une LED avec du code." },
        type: "video", src: "/videos/arduino-led.mp4", duration: "09:20",
      },
      {
        title:       { ar: "قراءة الحساسات", en: "Reading Sensors", fr: "Lire des Capteurs" },
        description: { ar: "اقرأ القيم من حساسات الضوء والحرارة.", en: "Read values from light and temperature sensors.", fr: "Lire les valeurs des capteurs lumière et température." },
        type: "embed", src: "", duration: "11:00",
      },
      {
        title:       { ar: "التحكم في المحرك", en: "Motor Control", fr: "Contrôle Moteur" },
        description: { ar: "حرّك سيرفو موتور بزوايا محددة.", en: "Move a servo motor to specific angles.", fr: "Déplacer un servomoteur à des angles précis." },
        type: "video", src: "/videos/arduino-motor.mp4", duration: "08:45",
      },
    ],
    heroTasks: {
      ar: ["افتح مشروع أردوينو", "وصّل LED بالمنفذ 13", "اكتب كود Blink", "شغّل المحاكاة", "أضف مقاومة 220 أوم", "اقرأ قيمة حساس"],
      en: ["Open an Arduino project", "Wire an LED to pin 13", "Write the Blink code", "Run the simulation", "Add a 220Ω resistor", "Read a sensor value"],
      fr: ["Ouvrir un projet Arduino", "Connecter LED à la broche 13", "Écrire le code Blink", "Lancer la simulation", "Ajouter résistance 220Ω", "Lire un capteur"],
    },
    skills: {
      ar: ["C/C++", "دوائر كهربائية", "PWM", "Serial Monitor"],
      en: ["C/C++", "Electrical Circuits", "PWM", "Serial Monitor"],
      fr: ["C/C++", "Circuits Électriques", "PWM", "Serial Monitor"],
    },
  },

  wedo: {
    key: "wedo",
    title:       { ar: "بيئة WeDo 2.0", en: "WeDo 2.0 Environment", fr: "Environnement WeDo 2.0" },
    subtitle:    { ar: "روبوتات LEGO البسيطة", en: "Simple LEGO Robots", fr: "Robots LEGO Simples" },
    description: {
      ar: "ابنِ روبوتك من قطع LEGO وبرمجه! تعلّم كيف تجمع بين البناء والبرمجة.",
      en: "Build your own LEGO robot and program it. Learn to combine building with coding.",
      fr: "Construisez votre robot LEGO et programmez-le. Alliez construction et code.",
    },
    difficulty: "beginner",
    ageRange: "6 - 10",
    faIcon: "fa-robot",
    color: "#f093fb",
    gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    glowColor: "rgba(240,147,251,0.5)",
    tag: { ar: "🧱 LEGO", en: "🧱 LEGO", fr: "🧱 LEGO" },
    simulatorUrl: "https://lab.open-roberta.org/",
    externalUrl: "https://lab.open-roberta.org/",
    lessons: [
      {
        title:       { ar: "مقدمة WeDo 2.0", en: "WeDo 2.0 Introduction", fr: "Introduction WeDo 2.0" },
        description: { ar: "مكونات المجموعة وطريقة التركيب الأساسية.", en: "Kit components and basic assembly.", fr: "Composants du kit et assemblage de base." },
        type: "video", src: "/videos/wedo-intro.mp4", duration: "04:50",
      },
      {
        title:       { ar: "بناء روبوت بسيط", en: "Build a Simple Robot", fr: "Construire un Robot" },
        description: { ar: "شرح خطوة بخطوة لبناء نموذج أولي.", en: "Step-by-step guide to build a first prototype.", fr: "Guide pas à pas pour un prototype." },
        type: "video", src: "/videos/wedo-build.mp4", duration: "07:10",
      },
      {
        title:       { ar: "تشغيل المحرك والحساس", en: "Motor & Sensor Control", fr: "Moteur & Capteur" },
        description: { ar: "البرمجة الأساسية وربط الحركة بالحساسات.", en: "Basic coding linking motion with sensors.", fr: "Codage de base reliant mouvement et capteurs." },
        type: "embed", src: "", duration: "08:35",
      },
    ],
    heroTasks: {
      ar: ["افتح Open Roberta", "اختر WeDo 2.0", "أنشئ برنامج حركة", "أضف حساس الحركة", "شغّل البرنامج"],
      en: ["Open Open Roberta", "Select WeDo 2.0", "Create a motion program", "Add a motion sensor", "Run the program"],
      fr: ["Ouvrir Open Roberta", "Sélectionner WeDo 2.0", "Créer programme mouvement", "Ajouter capteur", "Lancer le programme"],
    },
    skills: {
      ar: ["LEGO Mindstorms", "تصميم ميكانيكي", "برمجة بصرية", "مستشعرات"],
      en: ["LEGO Mindstorms", "Mechanical Design", "Visual Coding", "Sensors"],
      fr: ["LEGO Mindstorms", "Design Mécanique", "Code Visuel", "Capteurs"],
    },
  },

  gears: {
    key: "gears",
    title:       { ar: "محاكي GearS", en: "GearS Simulator", fr: "Simulateur GearS" },
    subtitle:    { ar: "روبوتات EV3 و Spike Prime", en: "EV3 & Spike Prime Robots", fr: "Robots EV3 & Spike Prime" },
    description: {
      ar: "محاكٍ ثلاثي الأبعاد متطور لتبرمج روبوتات EV3 و Spike Prime وتحل التحديات.",
      en: "Advanced 3D simulator to program EV3 & Spike Prime robots and solve challenges.",
      fr: "Simulateur 3D avancé pour programmer EV3 & Spike Prime et relever des défis.",
    },
    difficulty: "intermediate",
    ageRange: "10 - 15",
    faIcon: "fa-cog",
    color: "#20bf55",
    gradient: "linear-gradient(135deg, #20bf55 0%, #01baef 100%)",
    glowColor: "rgba(32,191,85,0.5)",
    tag: { ar: "🏆 تحديات", en: "🏆 Challenges", fr: "🏆 Défis" },
    simulatorUrl: "https://gears.aposteriori.com.sg/",
    externalUrl: "https://gears.aposteriori.com.sg/",
    lessons: [
      {
        title:       { ar: "التعرف على GearS", en: "Getting to Know GearS", fr: "Découvrir GearS" },
        description: { ar: "واجهة المحاكي وكيفية تشغيل الروبوت.", en: "Simulator interface and how to run the robot.", fr: "Interface du simulateur et lancement." },
        type: "video", src: "/videos/gears-intro.mp4", duration: "05:40",
      },
      {
        title:       { ar: "برمجة الحركة الأساسية", en: "Basic Motion Programming", fr: "Programmation de Mouvement" },
        description: { ar: "الحركات الأمامية والخلفية والدوران.", en: "Forward, backward, and rotation moves.", fr: "Mouvements avant, arrière et rotation." },
        type: "video", src: "/videos/gears-move.mp4", duration: "09:00",
      },
      {
        title:       { ar: "حل تحدي المتاهة", en: "Solving the Maze", fr: "Résoudre le Labyrinthe" },
        description: { ar: "تطبيق عملي بالحساسات والحلقات الشرطية.", en: "Practical use of sensors and conditional loops.", fr: "Application avec capteurs et boucles." },
        type: "embed", src: "", duration: "10:20",
      },
    ],
    heroTasks: {
      ar: ["افتح محاكي GearS", "حمّل بيئة EV3", "برمج حركة للأمام", "أضف منعطف 90°", "تجاوز العائق الأول", "حل تحدي المتاهة"],
      en: ["Open GearS simulator", "Load the EV3 environment", "Program a forward move", "Add a 90° turn", "Pass the first obstacle", "Solve the maze challenge"],
      fr: ["Ouvrir simulateur GearS", "Charger environnement EV3", "Programmer avancer", "Ajouter virage 90°", "Passer l'obstacle", "Résoudre le labyrinthe"],
    },
    skills: {
      ar: ["Python", "EV3-Python", "خوارزميات", "حساسات المسافة"],
      en: ["Python", "EV3-Python", "Algorithms", "Distance Sensors"],
      fr: ["Python", "EV3-Python", "Algorithmes", "Capteurs Distance"],
    },
  },

  python: {
    key: "python",
    title:       { ar: "بايثون التفاعلي", en: "Interactive Python", fr: "Python Interactif" },
    subtitle:    { ar: "البرمجة بلغة المستقبل", en: "Code in the Future's Language", fr: "Le langage du futur" },
    description: {
      ar: "تعلّم Python — لغة الذكاء الاصطناعي والروبوتات — من خلال مشاريع ممتعة ومرئية.",
      en: "Learn Python — the language of AI and robotics — through fun visual projects.",
      fr: "Apprenez Python — le langage de l'IA et de la robotique — via des projets visuels.",
    },
    difficulty: "advanced",
    ageRange: "12 - 18",
    faIcon: "fa-code",
    color: "#667eea",
    gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    glowColor: "rgba(102,126,234,0.5)",
    tag: { ar: "🤖 AI & Robots", en: "🤖 AI & Robots", fr: "🤖 IA & Robots" },
    simulatorUrl: "https://trinket.io/python",
    externalUrl: "https://trinket.io/python",
    lessons: [
      {
        title:       { ar: "مقدمة في Python", en: "Python Introduction", fr: "Introduction Python" },
        description: { ar: "المتغيرات والأوامر الأساسية وأول برنامج.", en: "Variables, basic commands, and your first program.", fr: "Variables, commandes et premier programme." },
        type: "video", src: "/videos/python-intro.mp4", duration: "07:00",
      },
      {
        title:       { ar: "الحلقات والشروط", en: "Loops & Conditions", fr: "Boucles & Conditions" },
        description: { ar: "for وwhile وif في مشاريع مرئية.", en: "for, while, and if in visual projects.", fr: "for, while et if dans projets visuels." },
        type: "video", src: "/videos/python-loops.mp4", duration: "10:00",
      },
      {
        title:       { ar: "برمجة Turtle", en: "Turtle Graphics", fr: "Graphiques Turtle" },
        description: { ar: "ارسم أشكالاً هندسية بكود Python.", en: "Draw geometric shapes with Python code.", fr: "Dessiner des formes avec Python." },
        type: "embed", src: "https://trinket.io/python", duration: "09:30",
      },
    ],
    heroTasks: {
      ar: ["اكتب برنامج Hello World", "استخدم المتغيرات", "ارسم مربعاً بـ Turtle", "أنشئ حلقة for", "حل تحدي الأعداد الأولى"],
      en: ["Write Hello World", "Use variables", "Draw a square with Turtle", "Create a for loop", "Solve the primes challenge"],
      fr: ["Écrire Hello World", "Utiliser des variables", "Dessiner un carré Turtle", "Créer une boucle for", "Défi nombres premiers"],
    },
    skills: {
      ar: ["Python 3", "Turtle Graphics", "خوارزميات", "AI أساسيات"],
      en: ["Python 3", "Turtle Graphics", "Algorithms", "AI Basics"],
      fr: ["Python 3", "Turtle Graphics", "Algorithmes", "Bases IA"],
    },
  },

  advanced: {
    key: "advanced",
    title:       { ar: "روبوتات صناعية", en: "Industrial Robots", fr: "Robots Industriels" },
    subtitle:    { ar: "محاكاة الأذرع الروبوتية", en: "Robotic Arm Simulation", fr: "Simulation Bras Robotiques" },
    description: {
      ar: "محاكاة أذرع الروبوت الصناعية المستخدمة في المصانع الكبرى. تعلّم الإحداثيات والمسارات.",
      en: "Simulate industrial robotic arms used in major factories. Learn coordinates and paths.",
      fr: "Simulez les bras robotiques industriels. Apprenez coordonnées et trajectoires.",
    },
    difficulty: "advanced",
    ageRange: "14 - 18",
    faIcon: "fa-industry",
    color: "#a55eea",
    gradient: "linear-gradient(135deg, #a55eea 0%, #4a00e0 100%)",
    glowColor: "rgba(165,94,234,0.5)",
    tag: { ar: "🏭 صناعي", en: "🏭 Industrial", fr: "🏭 Industriel" },
    simulatorUrl: "https://rocksi.net",
    externalUrl: "https://rocksi.net",
    lessons: [
      {
        title:       { ar: "الروبوتات الصناعية", en: "Industrial Robotics", fr: "Robotique Industrielle" },
        description: { ar: "استخدامات الأذرع الروبوتية في المصانع.", en: "Uses of robotic arms in factories.", fr: "Usages des bras robotiques en usine." },
        type: "video", src: "/videos/advanced-intro.mp4", duration: "06:45",
      },
      {
        title:       { ar: "الإحداثيات والمسارات", en: "Coordinates & Paths", fr: "Coordonnées & Trajectoires" },
        description: { ar: "تحريك الذراع بين نقاط متعددة.", en: "Move the arm between multiple points.", fr: "Déplacer le bras entre plusieurs points." },
        type: "video", src: "/videos/advanced-path.mp4", duration: "12:00",
      },
      {
        title:       { ar: "سيناريو صناعي كامل", en: "Full Industrial Scenario", fr: "Scénario Industriel" },
        description: { ar: "خط إنتاج افتراضي كامل.", en: "A complete virtual production line.", fr: "Ligne de production virtuelle complète." },
        type: "embed", src: "", duration: "13:25",
      },
    ],
    heroTasks: {
      ar: ["افتح محاكي Rocksi", "حرّك الذراع للأمام", "حدد نقطة بداية", "حدد نقطة نهاية", "شغّل المسار الكامل"],
      en: ["Open Rocksi simulator", "Move the arm forward", "Set a start point", "Set an end point", "Run the full path"],
      fr: ["Ouvrir simulateur Rocksi", "Avancer le bras", "Définir point départ", "Définir point arrivée", "Lancer la trajectoire"],
    },
    skills: {
      ar: ["ROS", "إحداثيات XYZ", "Kinematics", "G-code"],
      en: ["ROS", "XYZ Coordinates", "Kinematics", "G-code"],
      fr: ["ROS", "Coordonnées XYZ", "Cinématique", "G-code"],
    },
  },
};

export const labsList = Object.values(labConfigs);
export const difficultyColors: Record<Difficulty, string> = {
  beginner: "#43e97b",
  intermediate: "#f7971e",
  advanced: "#f5576c",
};
