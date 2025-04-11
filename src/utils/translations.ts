
type TranslationKey = string;

interface Translations {
  [key: TranslationKey]: string;
}

// Hebrew translations for the dashboard
const translations: Translations = {
  dashboard: "לוח בקרה",
  welcome: "ברוך הבא! הנה מה שקורה בחדר הכושר שלך היום.",
  activeMembers: "מנויים פעילים",
  todayCheckIns: "כניסות היום",
  monthlyRevenue: "הכנסה חודשית",
  newSubscriptions: "מנויים חדשים",
  riyal: "₪",
  recentActivity: "פעילות אחרונה",
  latestActivity: "פעילות אחרונה בחדר הכושר שלך",
  upcomingExpiry: "מנויים שעומדים לפוג",
  membersWithExpiringSubs: "לקוחות עם מנויים שעומדים לפוג",
  weeklyCheckIns: "כניסות שבועיות",
  dailyCheckInsVsAverage: "כניסות יומיות בהשוואה לממוצע",
  totalCheckIns: "סך הכל כניסות השבוע",
  vsLastWeek: "לעומת השבוע שעבר",
  sendReminders: "שלח תזכורות",
  viewAll: "הצג הכל",
  language: "עברית",
  notifications: "התראות",
  profile: "פרופיל",
  settings: "הגדרות",
  logout: "התנתק",
  userMenu: "תפריט משתמש",
  search: "חיפוש...",
  close: "סגור",
  myAccount: "החשבון שלי",
  admin: "מנהל",
  daysLeft: "נותרו {days} ימים",
  expiresOn: "פג תוקף ב {date}",
  thisWeek: "השבוע הזה",
  totalWeeklyCheckIns: "סך הכל כניסות השבוע",
  members: "לקוחות",
  clients: "לקוחות",
  // Activity types
  checkin: "כניסה",
  payment: "תשלום",
  newMember: "לקוח חדש",
  access: "גישה",
  renewal: "חידוש",
  // Time expressions
  minutesAgo: "לפני {time} דקות",
  hoursAgo: "לפני {time} שעות",
  dayAgo: "לפני יום",
  daysAgo: "לפני {time} ימים",
  // Sidebar menu items
  dashboard_menu: "לוח בקרה",
  members_menu: "לקוחות",
  checkins_menu: "כניסות",
  payments_menu: "תשלומים",
  classes_menu: "שיעורים",
  staff_menu: "צוות",
  access_menu: "בקרת גישה",
  settings_menu: "הגדרות",
  // New translations for the additional stat cards and charts
  totalDebts: "סה\"כ חובות",
  totalReceipts: "סה\"כ קבלות",
  totalInvoices: "סה\"כ חשבוניות",
  checkInsHourlyForecast: "תחזית תנועת כניסות לפי שעה",
  sixMonthsProfit: "רווח 6 חודשים",
  activeMembersByGroup: "מנויים פעילים לפי קבוצה",
  expiringMembers: "מנויים עומדים להסתיים",
  recentlyAddedMembers: "מנויים הוספו לאחרונה",
  viewMore: "צפה בעוד",
  by: "לפי",
  // Member profile page translations
  memberProfile: "פרופיל לקוח",
  memberDetails: "פרטי לקוח",
  membershipDetails: "פרטי מנוי",
  age: "גיל",
  balance: "יתרה",
  lastCheckIn: "כניסה אחרונה",
  sendMessage: "שלח הודעה",
  addDetails: "הוספת פרטים",
  paymentManagement: "טיפול בחיוב",
  customerManagement: "טיפול בלקוח",
  detailsTab: "פרטים",
  attendanceTab: "נוכחות",
  paymentsTab: "תשלומים",
  notificationsTab: "הודעות",
  documentsTab: "מסמכים",
  historyTab: "היסטוריית פניות",
  newSubscription: "מנוי חדש",
  searchSubscriptions: "חיפוש במנויים...",
  activeSubscriptions: "מנויים פעילים",
  inactiveSubscriptions: "מנויים לא פעילים",
  entriesColumn: "כניסות",
  endDateColumn: "עד תאריך",
  startDateColumn: "מתאריך",
  groupColumn: "קבוצה",
  statusColumn: "סטטוס",
  active: "פעיל",
  inactive: "לא פעיל",
  rowsTotal: "סך הכל שורות: {start}-{end} מתוך {total}",
  home: "ראשי",
  backToMembers: "חזרה לרשימת הלקוחות",
  memberNotFound: "לקוח לא נמצא",
  memberIdNotFound: "המזהה שביקשת לא נמצא במערכת"
};

// Simple translation function
export function t(key: TranslationKey): string {
  if (!translations[key]) {
    console.warn(`Translation key not found: ${key}`);
    return key;
  }
  return translations[key];
}

// Function to format strings with variables
export function tFormat(key: TranslationKey, variables: Record<string, string | number>): string {
  let text = t(key);
  
  Object.entries(variables).forEach(([varName, value]) => {
    text = text.replace(`{${varName}}`, String(value));
  });
  
  return text;
}
