import type { Lang } from "../hooks/useLang";

export type Localized<T> = Record<Lang, T>;

export interface Badge {
  id: string;
  icon: string;       // Font Awesome class (without "fas")
  color: string;
  title: Localized<string>;
  desc: Localized<string>;
}

export const BADGES: Badge[] = [
  {
    id: "first_step",
    icon: "fa-shoe-prints",
    color: "#43e97b",
    title: { ar: "الخطوة الأولى",      en: "First Step",        fr: "Premier Pas" },
    desc:  { ar: "أكملت أوّل درس لك!",  en: "Completed your first lesson!", fr: "Première leçon terminée !" },
  },
  {
    id: "quiz_starter",
    icon: "fa-circle-question",
    color: "#667eea",
    title: { ar: "صديق الأسئلة",       en: "Quiz Starter",      fr: "Débutant Quiz" },
    desc:  { ar: "نجحت في أوّل اختبار", en: "Passed your first quiz",       fr: "Premier quiz réussi" },
  },
  {
    id: "quiz_perfect",
    icon: "fa-bullseye",
    color: "#f5576c",
    title: { ar: "هدف مثالي",           en: "Perfect Aim",       fr: "Tir Parfait" },
    desc:  { ar: "اختبار بدرجة 100%",   en: "Scored 100% on a quiz",        fr: "100% à un quiz" },
  },
  {
    id: "lab_finisher",
    icon: "fa-flag-checkered",
    color: "#f7971e",
    title: { ar: "خرّيج مختبر",         en: "Lab Graduate",      fr: "Diplômé du Labo" },
    desc:  { ar: "أكملت مختبراً بالكامل", en: "Finished an entire lab",    fr: "Labo entier terminé" },
  },
  {
    id: "all_labs",
    icon: "fa-crown",
    color: "#ffd700",
    title: { ar: "ملك المختبرات",       en: "Lab Royalty",       fr: "Roi des Labos" },
    desc:  { ar: "أكملت جميع المختبرات", en: "Completed every lab",     fr: "Tous les labos terminés" },
  },
  {
    id: "streak_3",
    icon: "fa-fire",
    color: "#fa709a",
    title: { ar: "ثلاثة أيام نار 🔥",   en: "3-Day Streak",      fr: "Série 3 Jours" },
    desc:  { ar: "تعلّمت 3 أيام متتالية", en: "Learned 3 days in a row", fr: "3 jours d'affilée" },
  },
  {
    id: "streak_7",
    icon: "fa-fire-flame-curved",
    color: "#fa5252",
    title: { ar: "أسبوع متواصل",        en: "Week Warrior",      fr: "Guerrier de la Semaine" },
    desc:  { ar: "تعلّمت 7 أيام متتالية", en: "7 days in a row",  fr: "7 jours d'affilée" },
  },
  {
    id: "streak_30",
    icon: "fa-meteor",
    color: "#7950f2",
    title: { ar: "شهر أسطوري",          en: "Legendary Month",   fr: "Mois Légendaire" },
    desc:  { ar: "30 يوماً متتالياً!",   en: "30 days streak!",   fr: "30 jours d'affilée !" },
  },
  {
    id: "polyglot",
    icon: "fa-language",
    color: "#15aabf",
    title: { ar: "متعدّد اللغات",       en: "Polyglot",          fr: "Polyglotte" },
    desc:  { ar: "تعلّمت بـ 3 لغات",     en: "Learned in 3 languages", fr: "Appris en 3 langues" },
  },
  {
    id: "xp_500",
    icon: "fa-star",
    color: "#fcc419",
    title: { ar: "نجم صاعد",            en: "Rising Star",       fr: "Étoile Montante" },
    desc:  { ar: "حصلت على 500 نقطة",   en: "Earned 500 XP",     fr: "500 XP gagnés" },
  },
  {
    id: "xp_2000",
    icon: "fa-rocket",
    color: "#9775fa",
    title: { ar: "صاروخ",               en: "Rocket",            fr: "Fusée" },
    desc:  { ar: "حصلت على 2000 نقطة",  en: "Earned 2000 XP",    fr: "2000 XP gagnés" },
  },
  {
    id: "xp_5000",
    icon: "fa-trophy",
    color: "#ffd700",
    title: { ar: "بطل النقاط",          en: "XP Champion",       fr: "Champion XP" },
    desc:  { ar: "حصلت على 5000 نقطة",  en: "Earned 5000 XP",    fr: "5000 XP gagnés" },
  },
  {
    id: "early_bird",
    icon: "fa-sun",
    color: "#ffd43b",
    title: { ar: "الطائر المبكّر",      en: "Early Bird",        fr: "Lève-tôt" },
    desc:  { ar: "تعلّمت قبل الـ 8 صباحاً", en: "Learned before 8 AM", fr: "Appris avant 8 h" },
  },
  {
    id: "night_owl",
    icon: "fa-moon",
    color: "#5f3dc4",
    title: { ar: "البومة الليلية",      en: "Night Owl",         fr: "Oiseau de Nuit" },
    desc:  { ar: "تعلّمت بعد الـ 9 مساءً", en: "Learned after 9 PM", fr: "Appris après 21 h" },
  },
];

export const BADGE_BY_ID: Record<string, Badge> = Object.fromEntries(BADGES.map(b => [b.id, b]));

// Lab-specific "master" badge id helper (generated on the fly per lab key)
export function masterBadgeId(labKey: string): string {
  return `master_${labKey}`;
}

export function makeMasterBadge(labKey: string, labTitle: Localized<string>): Badge {
  return {
    id: masterBadgeId(labKey),
    icon: "fa-medal",
    color: "#fcc419",
    title: {
      ar: `سيّد ${labTitle.ar}`,
      en: `${labTitle.en} Master`,
      fr: `Maître ${labTitle.fr}`,
    },
    desc: {
      ar: `أتقنت كل دروس ومهام مختبر ${labTitle.ar}`,
      en: `Mastered every lesson and task in ${labTitle.en}`,
      fr: `Maîtrisé toutes les leçons de ${labTitle.fr}`,
    },
  };
}
