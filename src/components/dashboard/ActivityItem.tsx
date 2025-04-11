
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ActivityIcon, ActivityType } from "./ActivityIcon";
import { t, tFormat } from "@/utils/translations";

export interface Activity {
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

interface ActivityItemProps {
  activity: Activity;
}

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

export function ActivityItem({ activity }: ActivityItemProps) {
  return (
    <div className="flex items-start gap-4">
      <Avatar className="h-9 w-9 border">
        <AvatarImage src={activity.user.avatar} alt={activity.user.name} />
        <AvatarFallback>{activity.user.initials}</AvatarFallback>
      </Avatar>
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium leading-none">
            {activity.user.name}
          </p>
          <ActivityIcon type={activity.type} />
        </div>
        <p className="text-sm text-muted-foreground">{activity.details}</p>
        <p className="text-xs text-muted-foreground">{getTimeAgoText(activity)}</p>
      </div>
    </div>
  );
}
