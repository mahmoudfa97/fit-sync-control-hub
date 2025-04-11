
import { Activity } from "./ActivityItem";

export const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "checkin",
    user: {
      name: "יוסי כהן",
      initials: "יכ",
    },
    timeAgo: {
      value: 2,
      unit: "minutes"
    },
    details: "נרשם לאימון ערב",
  },
  {
    id: "2",
    type: "payment",
    user: {
      name: "שרה לוי",
      initials: "של",
    },
    timeAgo: {
      value: 23,
      unit: "minutes"
    },
    details: "שילמה 199.90 ₪ עבור מנוי חודשי",
  },
  {
    id: "3",
    type: "newMember",
    user: {
      name: "מיכאל רבין",
      initials: "מר",
    },
    timeAgo: {
      value: 1,
      unit: "hours"
    },
    details: "נרשם למנוי פרימיום חדש",
  },
  {
    id: "4",
    type: "access",
    user: {
      name: "עדי ישראלי",
      initials: "עי",
    },
    timeAgo: {
      value: 2,
      unit: "hours"
    },
    details: "נכנסה לחדר כושר דרך הכניסה הדרומית",
  },
  {
    id: "5",
    type: "renewal",
    user: {
      name: "רוני שמיר",
      initials: "רש",
    },
    timeAgo: {
      value: 3,
      unit: "hours"
    },
    details: "חידש מנוי פלטינום ל-12 חודשים",
  },
];
