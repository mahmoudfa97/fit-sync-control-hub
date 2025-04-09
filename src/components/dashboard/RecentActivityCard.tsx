
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
import { t, tFormat } from "@/utils/translations";

type ActivityType = "checkin" | "payment" | "newMember" | "access" | "renewal";

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  timeAgo: {
    value: number;
    unit: "minutes" | "hours" | "days"
  };
  details: string;
}

const activityIcons: Record<ActivityType, React.ReactNode> = {
  checkin: <CalendarClock className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />,
  newMember: <UserPlus className="h-4 w-4" />,
  access: <DoorOpen className="h-4 w-4" />,
  renewal: <CreditCard className="h-4 w-4" />,
};

const activityClasses: Record<ActivityType, string> = {
  checkin: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200",
  payment: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200",
  newMember: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
  access: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200",
  renewal: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200",
};

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "checkin",
    user: {
      name: "ג'ון דו",
      initials: "גד",
    },
    timeAgo: {
      value: 2,
      unit: "minutes"
    },
    details: "נכנס לאימון ערב",
  },
  {
    id: "2",
    type: "payment",
    user: {
      name: "שרה וילסון",
      initials: "שו",
    },
    timeAgo: {
      value: 23,
      unit: "minutes"
    },
    details: "שילמה 59.99 ₪ עבור תוכנית חודשית",
  },
  {
    id: "3",
    type: "newMember",
    user: {
      name: "מייקל צ'ן",
      initials: "מצ",
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
      name: "אמילי ג'ונסון",
      initials: "אג",
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
      name: "רוברט סמית",
      initials: "רס",
    },
    timeAgo: {
      value: 3,
      unit: "hours"
    },
    details: "חידש חברות פלטינום ל-12 חודשים",
  },
];

function getTimeAgoText(activity: Activity): string {
  const { value, unit } = activity.timeAgo;
  
  if (unit === "minutes") {
    return tFormat("minutesAgo", { time: value });
  } else if (unit === "hours") {
    if (value === 1) {
      return t("dayAgo");
    }
    return tFormat("hoursAgo", { time: value });
  } else {
    if (value === 1) {
      return t("dayAgo");
    }
    return tFormat("daysAgo", { time: value });
  }
}

export function RecentActivityCard() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>{t("recentActivity")}</CardTitle>
          <CardDescription>{t("latestActivity")}</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">אפשרויות נוספות</span>
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
                      <span className="mr-1">{t(activity.type)}</span>
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
                <p className="text-xs text-muted-foreground">{getTimeAgoText(activity)}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
