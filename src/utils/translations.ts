
type TranslationKey = string;

interface Translations {
  [key: TranslationKey]: {
    en: string;
    ar: string;
  };
}

// Dashboard translations
const translations: Translations = {
  dashboard: {
    en: "Dashboard",
    ar: "لوحة التحكم",
  },
  welcome: {
    en: "Welcome back! Here's what's happening with your gym today.",
    ar: "مرحبًا بعودتك! إليك ما يحدث في صالتك الرياضية اليوم.",
  },
  activeMembers: {
    en: "Active Members",
    ar: "الأعضاء النشطين",
  },
  todayCheckIns: {
    en: "Today's Check-ins",
    ar: "تسجيلات الحضور اليوم",
  },
  monthlyRevenue: {
    en: "Monthly Revenue",
    ar: "إيرادات الشهر",
  },
  newSubscriptions: {
    en: "New Subscriptions",
    ar: "اشتراكات جديدة",
  },
  riyal: {
    en: "SAR",
    ar: "ريال",
  }
};

export function t(key: TranslationKey, language: "en" | "ar"): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  return translations[key][language];
}
