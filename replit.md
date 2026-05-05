# أكاديمية RoboTech — منصة تعليم الروبوتيك

## نظرة عامة
منصة تعليمية تفاعلية للأطفال لتعلم الروبوتيك والبرمجة. مبنية بـ React + Vite + TypeScript.

## هيكل المشروع

```
artifacts/robotech/src/
├── App.tsx                  # التطبيق الرئيسي + التنقل + Particles
├── main.tsx                 # نقطة الدخول
├── index.css                # نظام التصميم الكامل (Dark Theme)
├── data/
│   └── labs.ts              # بيانات 8 مختبرات (config, lessons, tasks)
├── hooks/
│   └── useProgress.ts       # تتبع التقدم (localStorage)
├── components/
│   ├── Particles.tsx        # خلفية الجسيمات (Canvas API)
│   ├── Confetti.tsx         # احتفال عند إكمال المهام
│   ├── ProgressRing.tsx     # حلقة التقدم الدائرية (SVG)
│   └── BadgeToast.tsx       # إشعار الإنجاز
└── pages/
    ├── Home.tsx             # الرئيسية (Hero + Stats + Labs Grid + How)
    └── Lab.tsx              # واجهة المختبر (Video + Lessons + Tasks + Sim)
```

## المختبرات الثمانية

| المفتاح    | الاسم               | المحاكي              | المستوى  |
|------------|--------------------|-----------------------|---------|
| scratch    | عالم سكراتش         | TurboWarp             | مبتدئ   |
| microbit   | مختبر Micro:bit     | MakeCode              | مبتدئ   |
| arduino    | مختبر أردوينو       | Wokwi                 | متوسط   |
| wedo       | بيئة WeDo 2.0       | Open Roberta          | مبتدئ   |
| gears      | محاكي GearS         | GearS Simulator       | متوسط   |
| tinkercad  | Tinkercad المتطور   | Tinkercad             | متوسط   |
| python     | بايثون التفاعلي     | Trinket               | متقدم   |
| advanced   | روبوتات صناعية      | Rocksi                | متقدم   |

## ميزات التصميم
- Dark glassmorphism theme (خلفية داكنة + تأثير زجاج)
- Canvas particle system (جسيمات متحركة + خطوط ربط)
- CSS mesh gradient background
- Page transitions (Fade overlay)
- SVG Progress rings
- Confetti animation عند إكمال جميع المهام
- BadgeToast notifications
- Filter by difficulty (مبتدئ / متوسط / متقدم)
- Progress persistence (localStorage)
- RTL Arabic layout + Cairo font

## إضافة فيديوهات
ضع ملفات MP4 في: `artifacts/robotech/public/videos/`
ثم عدّل حقل `src` في `src/data/labs.ts` لكل درس.

## تطوير
```bash
pnpm --filter @workspace/robotech run dev
```
