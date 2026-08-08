import type { Lang } from "../hooks/useLang";
import { initLabStore, getEffectiveConfigs, invalidateLabCache } from "../services/labStore";

export type LessonType = "video" | "embed";
export type Difficulty = "beginner" | "intermediate" | "advanced";

export type Localized<T> = Record<Lang, T>;

export interface QuizQuestion {
  q: Localized<string>;
  options: Localized<string[]>;
  correct: number;
  explain?: Localized<string>;
}

export interface Lesson {
  title: Localized<string>;
  description: Localized<string>;
  type: LessonType;
  src: string;
  duration: string;
  quiz?: QuizQuestion[];
  /* CMS fields (Phase 2B) */
  thumbnail?: string;
  hidden?: boolean;
  /** Downloadable files (PDF/Word/PowerPoint/ZIP) — `media://` refs or URLs */
  attachments?: LessonAttachment[];
}

export interface LessonAttachment {
  name: string;
  src: string;
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
  /* CMS fields (Phase 2B) */
  hidden?: boolean;
  order?: number;
  simEnabled?: boolean;
}

export interface LocalizedQuiz {
  q: string;
  options: string[];
  correct: number;
  explain?: string;
}

export interface LocalizedLesson {
  title: string;
  description: string;
  type: LessonType;
  src: string;
  duration: string;
  quiz?: LocalizedQuiz[];
  thumbnail?: string;
  attachments?: LessonAttachment[];
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
  lessons: LocalizedLesson[];
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
      thumbnail: l.thumbnail,
      attachments: l.attachments,
      quiz: l.quiz?.map(q => ({
        q: q.q[lang],
        options: q.options[lang],
        correct: q.correct,
        explain: q.explain?.[lang],
      })),
    })),
    heroTasks: lab.heroTasks[lang],
    skills: lab.skills[lang],
  };
}

/* ── Quiz helper for compact authoring ── */
const Q = (
  ar: string, en: string, fr: string,
  optsAr: string[], optsEn: string[], optsFr: string[],
  correct: number,
  explainAr?: string, explainEn?: string, explainFr?: string,
): QuizQuestion => ({
  q: { ar, en, fr },
  options: { ar: optsAr, en: optsEn, fr: optsFr },
  correct,
  explain: explainAr ? { ar: explainAr, en: explainEn ?? "", fr: explainFr ?? "" } : undefined,
});

export const defaultLabConfigs: Record<string, LabConfig> = {
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
        quiz: [
          Q(
            "كيف نبرمج في سكراتش؟", "How do we code in Scratch?", "Comment code-t-on dans Scratch?",
            ["بكتابة C++", "بسحب كتل ملوّنة", "بالرسم باليد"],
            ["By writing C++", "By dragging colored blocks", "By drawing by hand"],
            ["En écrivant C++", "En glissant des blocs colorés", "En dessinant à la main"],
            1,
            "سكراتش لغة بصرية تعتمد على الكتل، لا حاجة لكتابة كود نصي.",
            "Scratch is a visual block-based language — no text code required.",
            "Scratch est un langage visuel à blocs — pas besoin d'écrire du code.",
          ),
          Q(
            "ما هو السبرايت (Sprite)؟", "What is a Sprite?", "Qu'est-ce qu'un Sprite?",
            ["الخلفية", "الشخصية أو الكائن", "الصوت"],
            ["The background", "The character or object", "The sound"],
            ["L'arrière-plan", "Le personnage ou l'objet", "Le son"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "إنشاء أول مشروع", en: "Your First Project", fr: "Votre Premier Projet" },
        description: { ar: "أنشئ شخصيتك الأولى وحركها على المسرح.", en: "Create your first sprite and animate it on stage.", fr: "Créez votre premier personnage et animez-le." },
        type: "video", src: "/videos/scratch-project.mp4", duration: "08:15",
        quiz: [
          Q(
            "أي كتلة تجعل السبرايت يتحرك؟", "Which block makes the sprite move?", "Quel bloc fait bouger le sprite?",
            ["move 10 steps", "say hello", "wait 1 sec"],
            ["move 10 steps", "say hello", "wait 1 sec"],
            ["bouger de 10 pas", "dire bonjour", "attendre 1 sec"],
            0,
          ),
          Q(
            "كيف نبدأ البرنامج تلقائياً؟", "How do we start the program automatically?", "Comment démarrer le programme?",
            ["when green flag clicked", "forever", "stop all"],
            ["when green flag clicked", "forever", "stop all"],
            ["quand drapeau vert cliqué", "pour toujours", "tout arrêter"],
            0,
          ),
        ],
      },
      {
        title:       { ar: "التحكم والحركة", en: "Control & Motion", fr: "Contrôle & Mouvement" },
        description: { ar: "كتل الحركة والاتجاهات والإحداثيات.", en: "Motion blocks, directions, and coordinates.", fr: "Blocs de mouvement, directions et coordonnées." },
        type: "embed", src: "", duration: "07:40",
        quiz: [
          Q(
            "كم درجة دوران كاملة؟", "How many degrees in a full rotation?", "Combien de degrés dans un tour complet?",
            ["90", "180", "360"],
            ["90", "180", "360"],
            ["90", "180", "360"],
            2,
          ),
          Q(
            "ماذا تفعل كتلة forever؟", "What does the 'forever' block do?", "Que fait le bloc 'pour toujours'?",
            ["تنفّذ مرة واحدة", "تكرّر للأبد", "توقف البرنامج"],
            ["Runs once", "Repeats forever", "Stops the program"],
            ["Exécute une fois", "Répète à l'infini", "Arrête le programme"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "الأحداث والتفاعل", en: "Events & Interaction", fr: "Événements & Interaction" },
        description: { ar: "اجعل مشروعك يستجيب لضغطات لوحة المفاتيح.", en: "Make your project respond to keyboard input.", fr: "Rendez votre projet interactif avec le clavier." },
        type: "video", src: "/videos/scratch-events.mp4", duration: "06:20",
        quiz: [
          Q(
            "كيف نجعل الشخصية تستجيب لمفتاح المسطرة؟", "How to respond to the spacebar?", "Comment réagir à la barre d'espace?",
            ["when space key pressed", "say hello", "wait 1 sec"],
            ["when space key pressed", "say hello", "wait 1 sec"],
            ["quand touche espace pressée", "dire bonjour", "attendre 1 sec"],
            0,
          ),
          Q(
            "كتلة broadcast تُستخدم لـ...", "The 'broadcast' block is used to...", "Le bloc 'broadcast' sert à...",
            ["إرسال إشارة بين السبرايتس", "تغيير اللون", "إيقاف البرنامج"],
            ["Send a message between sprites", "Change color", "Stop the program"],
            ["Envoyer un message entre sprites", "Changer la couleur", "Arrêter le programme"],
            0,
          ),
        ],
      },
      {
        title:       { ar: "مشروع لعبة كاملة", en: "Full Game Project", fr: "Projet Jeu Complet" },
        description: { ar: "ابنِ لعبة مكتملة من الصفر خطوة بخطوة.", en: "Build a complete game from scratch, step by step.", fr: "Construisez un jeu complet, étape par étape." },
        type: "embed", src: "", duration: "15:00",
        quiz: [
          Q(
            "كيف نتتبّع النقاط في لعبة؟", "How do we track the score in a game?", "Comment suivre le score?",
            ["متغيّر (variable)", "صوت", "خلفية"],
            ["A variable", "A sound", "A backdrop"],
            ["Une variable", "Un son", "Un arrière-plan"],
            0,
          ),
          Q(
            "لإنهاء اللعبة عند الفوز نستخدم:", "To end the game on victory we use:", "Pour terminer le jeu à la victoire:",
            ["stop all", "move 10", "wait 1"],
            ["stop all", "move 10", "wait 1"],
            ["tout arrêter", "bouger de 10", "attendre 1"],
            0,
          ),
        ],
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
        quiz: [
          Q(
            "أردوينو هو:", "Arduino is:", "Arduino est:",
            ["برنامج فقط", "لوحة إلكترونية قابلة للبرمجة", "لعبة فيديو"],
            ["A software only", "A programmable electronic board", "A video game"],
            ["Un logiciel uniquement", "Une carte électronique programmable", "Un jeu vidéo"],
            1,
          ),
          Q(
            "ما هي وحدة المعالجة في Arduino Uno؟", "What is the chip in Arduino Uno?", "Quelle puce dans Arduino Uno?",
            ["Intel Core i7", "ATmega328P", "Snapdragon"],
            ["Intel Core i7", "ATmega328P", "Snapdragon"],
            ["Intel Core i7", "ATmega328P", "Snapdragon"],
            1,
          ),
          Q(
            "كم منفذ رقمي في Arduino Uno؟", "How many digital pins on Arduino Uno?", "Combien de broches numériques?",
            ["6", "14", "32"],
            ["6", "14", "32"],
            ["6", "14", "32"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "تشغيل LED", en: "Blinking an LED", fr: "Allumer une LED" },
        description: { ar: "أول مشروع: تشغيل وإطفاء LED بالكود.", en: "First project: turn an LED on and off with code.", fr: "Premier projet: allumer une LED avec du code." },
        type: "video", src: "/videos/arduino-led.mp4", duration: "09:20",
        quiz: [
          Q(
            "أي تعليمة تُشغّل المنفذ HIGH؟", "Which command sets pin HIGH?", "Quelle commande met la broche à HIGH?",
            ["digitalWrite(13, HIGH)", "analogRead(13)", "delay(1000)"],
            ["digitalWrite(13, HIGH)", "analogRead(13)", "delay(1000)"],
            ["digitalWrite(13, HIGH)", "analogRead(13)", "delay(1000)"],
            0,
          ),
          Q(
            "لماذا نضع مقاومة مع LED؟", "Why use a resistor with an LED?", "Pourquoi utiliser une résistance avec une LED?",
            ["للديكور", "لحماية LED من التيار العالي", "لرفع السطوع"],
            ["For decoration", "To protect the LED from high current", "To brighten it"],
            ["Pour décorer", "Pour protéger la LED du courant", "Pour l'éclaircir"],
            1,
            "بدون مقاومة قد تحترق الـ LED بسبب التيار العالي.",
            "Without a resistor, the LED can burn out from excess current.",
            "Sans résistance, la LED peut griller à cause du courant.",
          ),
          Q(
            "ما وحدة delay() في Arduino؟", "What unit does delay() use?", "Quelle unité utilise delay()?",
            ["ثانية", "ميللي ثانية", "دقيقة"],
            ["Seconds", "Milliseconds", "Minutes"],
            ["Secondes", "Millisecondes", "Minutes"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "قراءة الحساسات", en: "Reading Sensors", fr: "Lire des Capteurs" },
        description: { ar: "اقرأ القيم من حساسات الضوء والحرارة.", en: "Read values from light and temperature sensors.", fr: "Lire les valeurs des capteurs lumière et température." },
        type: "embed", src: "", duration: "11:00",
        quiz: [
          Q(
            "أي دالة تقرأ قيمة تماثلية (Analog)؟", "Which function reads analog values?", "Quelle fonction lit l'analogique?",
            ["digitalRead", "analogRead", "print"],
            ["digitalRead", "analogRead", "print"],
            ["digitalRead", "analogRead", "print"],
            1,
          ),
          Q(
            "نطاق قيم analogRead على Uno:", "analogRead range on Uno:", "Plage de analogRead sur Uno:",
            ["0 إلى 1", "0 إلى 255", "0 إلى 1023"],
            ["0 to 1", "0 to 255", "0 to 1023"],
            ["0 à 1", "0 à 255", "0 à 1023"],
            2,
            "ADC في Uno مكوّن من 10 بت = 2¹⁰ = 1024 قيمة.",
            "The Uno's ADC is 10-bit = 2¹⁰ = 1024 values.",
            "L'ADC du Uno est 10 bits = 2¹⁰ = 1024 valeurs.",
          ),
          Q(
            "أين نوصّل خرج حساس تماثلي؟", "Where to connect an analog sensor output?", "Où connecter un capteur analogique?",
            ["منفذ D2", "منفذ A0", "GND"],
            ["Pin D2", "Pin A0", "GND"],
            ["Broche D2", "Broche A0", "GND"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "التحكم في المحرك", en: "Motor Control", fr: "Contrôle Moteur" },
        description: { ar: "حرّك سيرفو موتور بزوايا محددة.", en: "Move a servo motor to specific angles.", fr: "Déplacer un servomoteur à des angles précis." },
        type: "video", src: "/videos/arduino-motor.mp4", duration: "08:45",
        quiz: [
          Q(
            "أي محرك يتحرك لزاوية محدّدة؟", "Which motor moves to a specific angle?", "Quel moteur va à un angle précis?",
            ["DC Motor", "Servo Motor", "AC Motor"],
            ["DC Motor", "Servo Motor", "AC Motor"],
            ["Moteur CC", "Servomoteur", "Moteur CA"],
            1,
          ),
          Q(
            "أي pin يدعم PWM على Uno؟", "Which pin supports PWM on Uno?", "Quelle broche supporte PWM?",
            ["Pin 2", "Pin 9", "Pin 0"],
            ["Pin 2", "Pin 9", "Pin 0"],
            ["Broche 2", "Broche 9", "Broche 0"],
            1,
            "منافذ PWM في Uno: 3, 5, 6, 9, 10, 11 (مُعلَّمة بـ ~).",
            "PWM pins on Uno: 3, 5, 6, 9, 10, 11 (marked with ~).",
            "Broches PWM Uno: 3, 5, 6, 9, 10, 11 (marquées ~).",
          ),
          Q(
            "أي مكتبة نستوردها للسيرفو؟", "Which library do we import for servo?", "Quelle bibliothèque pour servo?",
            ["#include <Servo.h>", "#include <Motor.h>", "#include <Wire.h>"],
            ["#include <Servo.h>", "#include <Motor.h>", "#include <Wire.h>"],
            ["#include <Servo.h>", "#include <Motor.h>", "#include <Wire.h>"],
            0,
          ),
        ],
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
        quiz: [
          Q(
            "WeDo 2.0 من إنتاج:", "WeDo 2.0 is made by:", "WeDo 2.0 est fait par:",
            ["SONY", "LEGO", "Microsoft"],
            ["SONY", "LEGO", "Microsoft"],
            ["SONY", "LEGO", "Microsoft"],
            1,
          ),
          Q(
            "كيف يتصل WeDo بالحاسوب؟", "How does WeDo connect to the computer?", "Comment WeDo se connecte-t-il?",
            ["WiFi", "Bluetooth", "USB كابل"],
            ["WiFi", "Bluetooth", "USB cable"],
            ["WiFi", "Bluetooth", "Câble USB"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "بناء روبوت بسيط", en: "Build a Simple Robot", fr: "Construire un Robot" },
        description: { ar: "شرح خطوة بخطوة لبناء نموذج أولي.", en: "Step-by-step guide to build a first prototype.", fr: "Guide pas à pas pour un prototype." },
        type: "video", src: "/videos/wedo-build.mp4", duration: "07:10",
        quiz: [
          Q(
            "القطعة المركزية في WeDo 2.0 تسمى:", "The central piece is called:", "La pièce centrale s'appelle:",
            ["Brain", "Smarthub", "Brick"],
            ["Brain", "Smarthub", "Brick"],
            ["Brain", "Smarthub", "Brick"],
            1,
          ),
          Q(
            "كم منفذاً للمحرك/الحساس في Smarthub؟", "How many motor/sensor ports?", "Combien de ports moteur/capteur?",
            ["1", "2", "4"],
            ["1", "2", "4"],
            ["1", "2", "4"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "تشغيل المحرك والحساس", en: "Motor & Sensor Control", fr: "Moteur & Capteur" },
        description: { ar: "البرمجة الأساسية وربط الحركة بالحساسات.", en: "Basic coding linking motion with sensors.", fr: "Codage de base reliant mouvement et capteurs." },
        type: "embed", src: "", duration: "08:35",
        quiz: [
          Q(
            "حساس الحركة يُستخدم لـ:", "The motion sensor is used to:", "Le capteur de mouvement sert à:",
            ["قياس الحرارة", "اكتشاف قرب الأشياء", "قياس الصوت"],
            ["Measure temperature", "Detect nearby objects", "Measure sound"],
            ["Mesurer la température", "Détecter les objets proches", "Mesurer le son"],
            1,
          ),
          Q(
            "لتدوير المحرك للأبد نستخدم:", "To run the motor forever we use:", "Pour faire tourner le moteur sans fin:",
            ["run-motor for 1 sec", "run-motor forever", "stop motor"],
            ["run-motor for 1 sec", "run-motor forever", "stop motor"],
            ["run-motor for 1 sec", "run-motor forever", "stop motor"],
            1,
          ),
        ],
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
        quiz: [
          Q(
            "GearS هو محاكي لروبوتات:", "GearS simulates robots from:", "GearS simule les robots de:",
            ["LEGO Mindstorms EV3", "Arduino", "Raspberry Pi"],
            ["LEGO Mindstorms EV3", "Arduino", "Raspberry Pi"],
            ["LEGO Mindstorms EV3", "Arduino", "Raspberry Pi"],
            0,
          ),
          Q(
            "ما لغة البرمجة في GearS؟", "What language does GearS use?", "Quel langage utilise GearS?",
            ["JavaScript", "Python", "Java"],
            ["JavaScript", "Python", "Java"],
            ["JavaScript", "Python", "Java"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "برمجة الحركة الأساسية", en: "Basic Motion Programming", fr: "Programmation de Mouvement" },
        description: { ar: "الحركات الأمامية والخلفية والدوران.", en: "Forward, backward, and rotation moves.", fr: "Mouvements avant, arrière et rotation." },
        type: "video", src: "/videos/gears-move.mp4", duration: "09:00",
        quiz: [
          Q(
            "أي أمر يحرّك الروبوت للأمام؟", "Which command moves the robot forward?", "Quelle commande avance le robot?",
            ["robot.jump()", "robot.forward()", "robot.sleep()"],
            ["robot.jump()", "robot.forward()", "robot.sleep()"],
            ["robot.jump()", "robot.forward()", "robot.sleep()"],
            1,
          ),
          Q(
            "للتحكم بسرعة الروبوت نستخدم:", "To control speed we use:", "Pour contrôler la vitesse:",
            ["color", "speed parameter", "sound"],
            ["color", "speed parameter", "sound"],
            ["color", "paramètre speed", "sound"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "حل تحدي المتاهة", en: "Solving the Maze", fr: "Résoudre le Labyrinthe" },
        description: { ar: "تطبيق عملي بالحساسات والحلقات الشرطية.", en: "Practical use of sensors and conditional loops.", fr: "Application avec capteurs et boucles." },
        type: "embed", src: "", duration: "10:20",
        quiz: [
          Q(
            "أي حساس يفيد في تجنّب الجدران؟", "Which sensor helps avoid walls?", "Quel capteur évite les murs?",
            ["حساس صوت", "حساس مسافة (Ultrasonic)", "حساس لون فقط"],
            ["Sound sensor", "Ultrasonic distance sensor", "Color sensor only"],
            ["Capteur de son", "Capteur ultrason", "Capteur couleur seulement"],
            1,
          ),
          Q(
            "الحلقات الشرطية مفيدة لـ:", "Conditional loops are useful for:", "Les boucles conditionnelles servent à:",
            ["الزخرفة", "اتخاذ قرارات حسب الظروف", "تشغيل الصوت"],
            ["Decoration", "Making decisions based on conditions", "Playing sound"],
            ["La décoration", "Prendre des décisions selon les conditions", "Jouer du son"],
            1,
          ),
        ],
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
        quiz: [
          Q(
            "كيف نطبع نصاً في Python؟", "How to print text in Python?", "Comment afficher du texte?",
            ["echo \"hello\"", "print(\"hello\")", "System.out.println"],
            ["echo \"hello\"", "print(\"hello\")", "System.out.println"],
            ["echo \"hello\"", "print(\"hello\")", "System.out.println"],
            1,
          ),
          Q(
            "أي اسم متغيّر صحيح في Python؟", "Which is a valid Python variable name?", "Quel nom de variable valide?",
            ["2name", "my_name", "my-name"],
            ["2name", "my_name", "my-name"],
            ["2name", "my_name", "my-name"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "الحلقات والشروط", en: "Loops & Conditions", fr: "Boucles & Conditions" },
        description: { ar: "for وwhile وif في مشاريع مرئية.", en: "for, while, and if in visual projects.", fr: "for, while et if dans projets visuels." },
        type: "video", src: "/videos/python-loops.mp4", duration: "10:00",
        quiz: [
          Q(
            "للتكرار 10 مرات نستخدم:", "To repeat 10 times we use:", "Pour répéter 10 fois:",
            ["for i in range(10):", "loop 10 times", "while true"],
            ["for i in range(10):", "loop 10 times", "while true"],
            ["for i in range(10):", "loop 10 times", "while true"],
            0,
          ),
          Q(
            "صياغة الشرط الصحيحة:", "Correct condition syntax:", "Syntaxe correcte d'une condition:",
            ["if (x = 5)", "if x == 5:", "if x equals 5"],
            ["if (x = 5)", "if x == 5:", "if x equals 5"],
            ["if (x = 5)", "if x == 5:", "if x equals 5"],
            1,
            "= للإسناد، == للمقارنة.",
            "= assigns, == compares.",
            "= pour assigner, == pour comparer.",
          ),
        ],
      },
      {
        title:       { ar: "برمجة Turtle", en: "Turtle Graphics", fr: "Graphiques Turtle" },
        description: { ar: "ارسم أشكالاً هندسية بكود Python.", en: "Draw geometric shapes with Python code.", fr: "Dessiner des formes avec Python." },
        type: "embed", src: "https://trinket.io/python", duration: "09:30",
        quiz: [
          Q(
            "مكتبة Turtle تُستخدم لـ:", "Turtle library is used for:", "La bibliothèque Turtle sert à:",
            ["حسابات رياضية", "الرسم بالكود", "تشغيل صوت"],
            ["Math calculations", "Drawing with code", "Playing sound"],
            ["Calculs math", "Dessiner avec du code", "Jouer du son"],
            1,
          ),
          Q(
            "لإنشاء سلحفاة جديدة:", "To create a new turtle:", "Pour créer une tortue:",
            ["t = turtle.Turtle()", "new Turtle()", "Turtle.new()"],
            ["t = turtle.Turtle()", "new Turtle()", "Turtle.new()"],
            ["t = turtle.Turtle()", "new Turtle()", "Turtle.new()"],
            0,
          ),
        ],
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
        quiz: [
          Q(
            "الذراع الروبوتية بـ 6 محاور تُسمّى:", "A 6-axis arm is called:", "Un bras à 6 axes s'appelle:",
            ["6-DOF", "6-wheel", "6-feet"],
            ["6-DOF", "6-wheel", "6-feet"],
            ["6-DOF", "6-wheel", "6-feet"],
            0,
            "DOF = Degrees Of Freedom — درجات الحرية.",
            "DOF = Degrees Of Freedom.",
            "DOF = Degrés De Liberté.",
          ),
          Q(
            "أكثر استخدامات الروبوت الصناعي:", "Most common industrial robot use:", "Usage industriel le plus courant:",
            ["الطبخ", "اللحام والتجميع", "الرقص"],
            ["Cooking", "Welding and assembly", "Dancing"],
            ["Cuisine", "Soudure et assemblage", "Danse"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "الإحداثيات والمسارات", en: "Coordinates & Paths", fr: "Coordonnées & Trajectoires" },
        description: { ar: "تحريك الذراع بين نقاط متعددة.", en: "Move the arm between multiple points.", fr: "Déplacer le bras entre plusieurs points." },
        type: "video", src: "/videos/advanced-path.mp4", duration: "12:00",
        quiz: [
          Q(
            "ما يمثله المحور Z عادةً؟", "What does the Z axis usually represent?", "Que représente Z?",
            ["يمين/يسار", "أمام/خلف", "أعلى/أسفل"],
            ["Left/Right", "Front/Back", "Up/Down"],
            ["Gauche/Droite", "Avant/Arrière", "Haut/Bas"],
            2,
          ),
          Q(
            "النقطة المرجعية (0,0,0) تُسمّى:", "The reference point (0,0,0) is called:", "Le point (0,0,0) s'appelle:",
            ["Endpoint", "Origin", "Center"],
            ["Endpoint", "Origin", "Center"],
            ["Endpoint", "Origine", "Center"],
            1,
          ),
        ],
      },
      {
        title:       { ar: "سيناريو صناعي كامل", en: "Full Industrial Scenario", fr: "Scénario Industriel" },
        description: { ar: "خط إنتاج افتراضي كامل.", en: "A complete virtual production line.", fr: "Ligne de production virtuelle complète." },
        type: "embed", src: "", duration: "13:25",
        quiz: [
          Q(
            "End-Effector هو:", "End-Effector is:", "L'End-Effector est:",
            ["قاعدة الروبوت", "الأداة في نهاية الذراع", "وحدة التحكم"],
            ["The robot base", "The tool at the arm's end", "The controller"],
            ["La base du robot", "L'outil au bout du bras", "Le contrôleur"],
            1,
          ),
          Q(
            "خط الإنتاج الآلي يحتاج:", "An automated production line needs:", "Une ligne automatisée nécessite:",
            ["شخص لكل خطوة", "تنسيق بين الروبوتات", "فقط فيديو"],
            ["A person per step", "Coordination between robots", "Only video"],
            ["Une personne par étape", "Coordination entre robots", "Seulement vidéo"],
            1,
          ),
        ],
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

/*
 * Phase 2B: the CMS (localStorage-backed labStore) is the source of truth.
 * It is seeded from `defaultLabConfigs` on first run; admin edits override it.
 * Student pages keep importing `labConfigs` / `labsList` unchanged.
 */
initLabStore(defaultLabConfigs);
export const labConfigs: Record<string, LabConfig> = getEffectiveConfigs();
export const labsList = Object.values(labConfigs);

/*
 * Phase 3: these exports are module-level snapshots; refresh them in place
 * after a cloud pull rewrites localStorage so every consumer (Home grid,
 * Lab page, gamification totals) sees the latest content without reload.
 * Registered here (module eval) so it runs BEFORE React listeners re-render.
 */
if (typeof window !== "undefined") {
  window.addEventListener("robotech-cloud-updated", () => {
    invalidateLabCache();
    const next = getEffectiveConfigs();
    for (const k of Object.keys(labConfigs)) delete labConfigs[k];
    Object.assign(labConfigs, next);
    labsList.length = 0;
    labsList.push(...Object.values(next));
  });
}
export const difficultyColors: Record<Difficulty, string> = {
  beginner: "#43e97b",
  intermediate: "#f7971e",
  advanced: "#f5576c",
};
