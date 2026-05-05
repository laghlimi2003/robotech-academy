/*
  ==========================================
  RoboTech - Main Script
  ==========================================
  كيف تضيف فيديوهاتك؟
  1) ضع ملفات الفيديو المحلية داخل مجلد مثل:
     videos/scratch-1.mp4
     videos/arduino-1.mp4

  2) ثم عدل src داخل lessons في كل مختبر.

  3) type يمكن أن يكون:
     - "video"  => لملف فيديو محلي أو رابط mp4 مباشر
     - "embed"  => لرابط تضمين YouTube/Vimeo

  مثال:
  { title: "الدرس 1", type: "video", src: "videos/scratch-1.mp4" }

  أو:
  { title: "الدرس 1", type: "embed", src: "https://www.youtube.com/embed/VIDEO_ID" }
*/

const labConfigs = {
  scratch: {
    title: "🚀 مختبر سكراتش",
    frameId: "scratch-frame",
    externalUrl: "https://turbowarp.org/editor",
    lessons: [
      {
        title: "مقدمة في سكراتش",
        description: "ضع هنا فيديو يشرح واجهة سكراتش وطريقة استخدام الكتل البرمجية.",
        type: "video",
        src: "videos/scratch-intro.mp4",
        duration: "05:30"
      },
      {
        title: "إنشاء أول مشروع",
        description: "ضع فيديو يشرح كيفية إنشاء شخصية وتحريكها داخل المسرح.",
        type: "video",
        src: "videos/scratch-video.mp4",
        duration: "08:15"
      },
      {
        title: "التحكم والحركة",
        description: "فيديو عن كتل الحركة، الاتجاهات، والإحداثيات.",
        type: "embed",
        src: "",
        duration: "07:40"
      }
    ]
  },

  arduino: {
    title: "⚡ مختبر أردوينو",
    frameId: "arduino-frame",
    externalUrl: "https://wokwi.com/projects/new/arduino-uno",
    lessons: [
      {
        title: "ما هو الأردوينو؟",
        description: "ضع فيديو تمهيدي يشرح اللوحة والمنافذ والمكونات الأساسية.",
        type: "video",
        src: "videos/arduino-video.mp4",
        duration: "06:10"
      },
      {
        title: "تشغيل LED",
        description: "شرح أول مشروع: تشغيل وإطفاء LED باستخدام الكود.",
        type: "video",
        src: "videos/arduino-led.mp4",
        duration: "09:20"
      },
      {
        title: "قراءة الحساسات",
        description: "شرح قراءة القيم من الحساسات وربطها بالقرارات البرمجية.",
        type: "embed",
        src: "",
        duration: "11:00"
      }
    ]
  },

  wedo: {
    title: "🤖 بيئة WeDo 2.0",
    frameId: "wedo-frame",
    externalUrl: "https://lab.open-roberta.org/#loadSystem=wedo",
    lessons: [
      {
        title: "مقدمة WeDo 2.0",
        description: "ضع فيديو يشرح مكونات المجموعة وطريقة التركيب الأساسية.",
        type: "video",
        src: "videos/wedo-intro.mp4",
        duration: "04:50"
      },
      {
        title: "بناء روبوت بسيط",
        description: "شرح خطوة بخطوة لبناء نموذج أولي بسيط.",
        type: "video",
        src: "videos/wedo-build.mp4",
        duration: "07:10"
      },
      {
        title: "تشغيل المحرك والحساس",
        description: "ضع فيديو يشرح البرمجة الأساسية وربط الحركة بالحساسات.",
        type: "embed",
        src: "",
        duration: "08:35"
      }
    ]
  },

  gears: {
    title: "⚙️ محاكي GearS",
    frameId: "gears-frame",
    externalUrl: "https://gears.aposteriori.com.sg/",
    lessons: [
      {
        title: "التعرف على GearS",
        description: "فيديو تعريفي بواجهة المحاكي وكيفية تشغيل الروبوت.",
        type: "video",
        src: "videos/gears-intro.mp4",
        duration: "05:40"
      },
      {
        title: "برمجة الحركة الأساسية",
        description: "شرح الحركات الأمامية والخلفية والدوران في المحاكي.",
        type: "video",
        src: "videos/gears-movement.mp4",
        duration: "09:00"
      },
      {
        title: "حل تحدي المتاهة",
        description: "فيديو لتطبيق عملي باستخدام الحساسات والحلقات الشرطية.",
        type: "embed",
        src: "",
        duration: "10:20"
      }
    ]
  },

  advanced: {
    title: "🏭 روبوتات صناعية متقدمة",
    frameId: "advanced-frame",
    externalUrl: "https://rocksi.net",
    lessons: [
      {
        title: "مقدمة في الروبوتات الصناعية",
        description: "ضع فيديو يشرح استخدامات الأذرع الروبوتية في المصانع.",
        type: "video",
        src: "videos/advanced-intro.mp4",
        duration: "06:45"
      },
      {
        title: "الإحداثيات والمسارات",
        description: "شرح كيفية تحريك الذراع الروبوتية بين نقاط متعددة.",
        type: "video",
        src: "videos/advanced-coordinates.mp4",
        duration: "12:00"
      },
      {
        title: "سيناريو صناعي كامل",
        description: "فيديو تطبيقي لالتقاط العناصر وترتيبها بخط إنتاج افتراضي.",
        type: "embed",
        src: "",
        duration: "13:25"
      }
    ]
  }
};

let currentLabKey = null;
let currentLessonIndex = 0;

/* عناصر DOM */
const homeView = document.getElementById("home-view");
const labView = document.getElementById("lab-view");
const labTitle = document.getElementById("lab-title");
const simLoader = document.getElementById("sim-loader");

const lessonVideo = document.getElementById("lesson-video");
const lessonEmbed = document.getElementById("lesson-embed");
const videoPlaceholder = document.getElementById("video-placeholder");

const lessonBadge = document.getElementById("lesson-badge");
const lessonTitleText = document.getElementById("lesson-title-text");
const lessonDescription = document.getElementById("lesson-description");
const lessonList = document.getElementById("lesson-list");
const lessonCount = document.getElementById("lesson-count");

/* فتح المختبر */
function openLab(type) {
  const config = labConfigs[type];
  if (!config) return;

  currentLabKey = type;
  currentLessonIndex = 0;

  homeView.classList.add("hidden");
  labView.classList.remove("hidden");

  // إخفاء كل الإطارات
  document.querySelectorAll(".frame").forEach((frame) => {
    frame.classList.add("hidden");
  });

  // تحديث العنوان
  labTitle.textContent = config.title;

  // عرض الإطار المطلوب
  const targetFrame = document.getElementById(config.frameId);
  targetFrame.classList.remove("hidden");

  // تحميل iframe عند الحاجة فقط
  loadSimulatorFrame(targetFrame);

  // عرض قائمة الدروس
  renderLessons(type);

  // تحميل أول درس تلقائياً
  if (config.lessons.length > 0) {
    loadLesson(0);
  } else {
    resetLessonPlayer();
  }

  // حفظ آخر مختبر
  localStorage.setItem("robotech_last_lab", type);
}

/* تحميل iframe ديناميكياً */
function loadSimulatorFrame(frameElement) {
  const iframe = frameElement.querySelector("iframe");
  if (!iframe) return;

  const dataSrc = iframe.dataset.src;

  simLoader.style.display = "flex";

  // إذا كان المحاكي لم يتم تحميله من قبل
  if (!iframe.src && dataSrc) {
    iframe.onload = () => {
      simLoader.style.display = "none";
    };

    iframe.onerror = () => {
      simLoader.style.display = "none";
    };

    iframe.src = dataSrc;
  } else {
    // لو كان محملاً مسبقاً
    setTimeout(() => {
      simLoader.style.display = "none";
    }, 400);
  }
}

/* رجوع للرئيسية */
function goHome() {
  homeView.classList.remove("hidden");
  labView.classList.add("hidden");
  pauseLessonMedia();
}

/* إعادة تحميل المحاكي */
function reloadSimulator() {
  const activeIframe = document.querySelector(".frame:not(.hidden) iframe");
  if (!activeIframe) return;

  simLoader.style.display = "flex";
  activeIframe.onload = () => {
    simLoader.style.display = "none";
  };
  activeIframe.src = activeIframe.src;
}

/* فتح المحاكي في نافذة جديدة */
function openSimulatorInNewTab() {
  if (!currentLabKey) return;

  const url = labConfigs[currentLabKey].externalUrl;
  if (url) {
    window.open(url, "_blank", "noopener,noreferrer");
  }
}

/* رسم قائمة الدروس */
function renderLessons(labKey) {
  const lessons = labConfigs[labKey]?.lessons || [];
  lessonList.innerHTML = "";
  lessonCount.textContent = `${lessons.length} ${lessons.length === 1 ? "درس" : "دروس"}`;

  if (lessons.length === 0) {
    lessonList.innerHTML = `
      <div class="lesson-empty">
        لا توجد دروس بعد لهذا المختبر.
        أضف الدروس من ملف <strong>script.js</strong>.
      </div>
    `;
    return;
  }

  lessons.forEach((lesson, index) => {
    const btn = document.createElement("button");
    btn.className = "lesson-item";
    btn.type = "button";
    btn.setAttribute("data-index", index);

    const lessonTypeText = lesson.type === "embed" ? "Embed" : "Video";

    btn.innerHTML = `
      <div class="lesson-item-top">
        <span class="lesson-name">${lesson.title}</span>
        <span class="lesson-index">${index + 1}</span>
      </div>

      <div class="lesson-meta">
        <span class="lesson-type">${lessonTypeText}</span>
        <span>${lesson.duration || "بدون مدة"}</span>
      </div>
    `;

    btn.addEventListener("click", () => loadLesson(index));

    lessonList.appendChild(btn);
  });

  updateActiveLessonItem();
}

/* تحميل الدرس */
function loadLesson(index) {
  if (!currentLabKey) return;

  const lessons = labConfigs[currentLabKey].lessons || [];
  const lesson = lessons[index];
  if (!lesson) return;

  currentLessonIndex = index;

  // تحديث البيانات النصية
  lessonBadge.textContent = `الدرس ${index + 1}`;
  lessonTitleText.textContent = lesson.title || "عنوان الدرس";
  lessonDescription.textContent = lesson.description || "وصف الدرس";

  // إيقاف الوسائط السابقة
  pauseLessonMedia();

  // إخفاء الكل
  lessonVideo.classList.add("hidden");
  lessonEmbed.classList.add("hidden");
  videoPlaceholder.classList.add("hidden");

  // لو ما فيش رابط
  if (!lesson.src || lesson.src.trim() === "") {
    showEmptyVideoState(
      lesson.title,
      "هذا الدرس مضاف في القائمة لكن رابط الفيديو لم يتم وضعه بعد. عدّل قيمة src داخل script.js."
    );
    updateActiveLessonItem();
    saveLessonState();
    return;
  }

  if (lesson.type === "embed") {
    lessonEmbed.src = lesson.src;
    lessonEmbed.classList.remove("hidden");
  } else {
    lessonVideo.src = lesson.src;
    lessonVideo.classList.remove("hidden");
  }

  updateActiveLessonItem();
  saveLessonState();
}

/* تحديث العنصر النشط في القائمة */
function updateActiveLessonItem() {
  const items = document.querySelectorAll(".lesson-item");
  items.forEach((item, idx) => {
    item.classList.toggle("active", idx === currentLessonIndex);
  });
}

/* حالة فارغة لمشغل الفيديو */
function showEmptyVideoState(title = "الدرس", message = "لا يوجد فيديو متاح حالياً.") {
  lessonBadge.textContent = "الدرس";
  lessonTitleText.textContent = title;
  lessonDescription.textContent = message;

  lessonVideo.classList.add("hidden");
  lessonEmbed.classList.add("hidden");

  lessonVideo.removeAttribute("src");
  lessonEmbed.removeAttribute("src");

  videoPlaceholder.classList.remove("hidden");
}

/* إعادة ضبط المشغل */
function resetLessonPlayer() {
  pauseLessonMedia();

  lessonBadge.textContent = "الدرس";
  lessonTitleText.textContent = "لم يتم اختيار درس بعد";
  lessonDescription.textContent = "اختر أحد الدروس من القائمة الجانبية لبدء العرض.";

  lessonVideo.classList.add("hidden");
  lessonEmbed.classList.add("hidden");
  videoPlaceholder.classList.remove("hidden");

  lessonVideo.removeAttribute("src");
  lessonEmbed.removeAttribute("src");
}

/* إيقاف الفيديو */
function pauseLessonMedia() {
  try {
    lessonVideo.pause();
  } catch (error) {
    console.warn("تعذر إيقاف الفيديو المحلي:", error);
  }

  // أفضل طريقة لإيقاف iframe هي مسح src ثم إعادته عند الحاجة
  if (!lessonEmbed.classList.contains("hidden")) {
    lessonEmbed.src = "";
  }
}

/* حفظ حالة الدرس */
function saveLessonState() {
  if (!currentLabKey) return;
  localStorage.setItem("robotech_last_lab", currentLabKey);
  localStorage.setItem("robotech_last_lesson", String(currentLessonIndex));
}

/* استعادة آخر حالة */
function restoreLastState() {
  const lastLab = localStorage.getItem("robotech_last_lab");
  const lastLesson = Number(localStorage.getItem("robotech_last_lesson"));

  if (!lastLab || !labConfigs[lastLab]) return;

  openLab(lastLab);

  const lessons = labConfigs[lastLab].lessons || [];
  if (lessons.length > 0 && Number.isInteger(lastLesson) && lastLesson >= 0 && lastLesson < lessons.length) {
    loadLesson(lastLesson);
  }
}

/* دعم Enter على البطاقات */
function enableKeyboardCards() {
  const cards = document.querySelectorAll(".premium-card");
  cards.forEach((card) => {
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.click();
      }
    });
  });
}

/* التشغيل */
window.addEventListener("DOMContentLoaded", () => {
  enableKeyboardCards();
  resetLessonPlayer();
  restoreLastState();
});