
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  CalendarClock, 
  CreditCard, 
  DoorOpen, 
  DollarSign, 
  MoreHorizontal, 
  UserPlus 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { useAppSelector } from "@/hooks/redux";

type ActivityType = "checkin" | "payment" | "new-member" | "access" | "renewal";

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  time: {
    en: string;
    ar: string;
  };
  details: {
    en: string;
    ar: string;
  };
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  checkin: <CalendarClock className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />,
  "new-member": <UserPlus className="h-4 w-4" />,
  access: <DoorOpen className="h-4 w-4" />,
  renewal: <CreditCard className="h-4 w-4" />,
};

const activityClasses: Record<ActivityType, string> = {
  checkin: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200",
  payment: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200",
  "new-member": "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
  access: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200",
  renewal: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200",
};

const activityTypeLabels: Record<ActivityType, { en: string; ar: string }> = {
  checkin: { en: "check in", ar: "تسجيل حضور" },
  payment: { en: "payment", ar: "دفع" },
  "new-member": { en: "new member", ar: "عضو جديد" },
  access: { en: "access", ar: "دخول" },
  renewal: { en: "renewal", ar: "تجديد" },
};

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "checkin",
    user: {
      name: "جون دو",
      initials: "جد",
    },
    time: {
      en: "2 min ago",
      ar: "منذ دقيقتين"
    },
    details: {
      en: "Checked in for evening workout",
      ar: "سجل حضور للتمرين المسائي"
    },
  },
  {
    id: "2",
    type: "payment",
    user: {
      name: "سارة ويلسون",
      initials: "سو",
    },
    time: {
      en: "23 min ago",
      ar: "منذ 23 دقيقة"
    },
    details: {
      en: "Made payment of 59.99 SAR for monthly plan",
      ar: "دفع مبلغ 59.99 ريال للاشتراك الشهري"
    },
  },
  {
    id: "3",
    type: "new-member",
    user: {
      name: "مايكل تشين",
      initials: "مت",
    },
    time: {
      en: "1 hour ago",
      ar: "منذ ساعة"
    },
    details: {
      en: "Registered for new premium membership",
      ar: "سجل للحصول على عضوية مميزة جديدة"
    },
  },
  {
    id: "4",
    type: "access",
    user: {
      name: "إميلي جونسون",
      initials: "إج",
    },
    time: {
      en: "2 hours ago",
      ar: "منذ ساعتين"
    },
    details: {
      en: "Accessed gym through south entrance",
      ar: "دخل الصالة عبر المدخل الجنوبي"
    },
  },
  {
    id: "5",
    type: "renewal",
    user: {
      name: "روبرت سميث",
      initials: "رس",
    },
    time: {
      en: "3 hours ago",
      ar: "منذ 3 ساعات"
    },
    details: {
      en: "Renewed platinum membership for 12 months",
      ar: "جدد العضوية البلاتينية لمدة 12 شهرًا"
    },
  },
];

export function RecentActivityCard() {
  const language = useAppSelector((state) => state.settings.language);
  
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{language === "ar" ? "النشاطات الأخيرة" : "Recent Activity"}</CardTitle>
          <CardDescription>
            {language === "ar" ? "آخر النشاطات في صالتك الرياضية" : "Latest activity across your gym"}
          </CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">
            {language === "ar" ? "خيارات أكثر" : "More options"}
          </span>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {ACTIVITIES.map((activity) => (
            <div key={activity.id} className="flex items-start gap-4">
              <Avatar className="h-9 w-9 border">
                <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
                <AvatarFallback>{activity.user.initials}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium leading-none">
                    {activity.user.name}
                  </p>
                  <div className={cn(
                    "flex h-5 items-center rounded-full px-2 text-xs font-semibold",
                    activityClasses[activity.type]
                  )}>
                    <span className="flex items-center gap-0.5">
                      {activityIcons[activity.type]}
                      <span className="ml-1">{activityTypeLabels[activity.type][language]}</span>
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.details[language]}</p>
                <p className="text-xs text-muted-foreground">{activity.time[language]}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
