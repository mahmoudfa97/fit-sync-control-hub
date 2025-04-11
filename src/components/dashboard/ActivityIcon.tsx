
import { ReactNode } from "react";
import { 
  CalendarClock, 
  CreditCard, 
  DoorOpen, 
  DollarSign, 
  UserPlus 
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ActivityType = "checkin" | "payment" | "newMember" | "access" | "renewal";

const activityIcons: Record<ActivityType, ReactNode> = {
  checkin: <CalendarClock className="h-4 w-4" />,
  payment: <DollarSign className="h-4 w-4" />,
  newMember: <UserPlus className="h-4 w-4" />,
  access: <DoorOpen className="h-4 w-4" />,
  renewal: <CreditCard className="h-4 w-4" />,
};

export const activityClasses: Record<ActivityType, string> = {
  checkin: "bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-200",
  payment: "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200",
  newMember: "bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-200",
  access: "bg-amber-100 text-amber-600 dark:bg-amber-900 dark:text-amber-200",
  renewal: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-200",
};

interface ActivityIconProps {
  type: ActivityType;
}

export function ActivityIcon({ type }: ActivityIconProps) {
  return (
    <div className={cn(
      "flex h-5 items-center rounded-full px-2 text-xs font-semibold",
      activityClasses[type]
    )}>
      <span className="flex items-center gap-0.5">
        {activityIcons[type]}
        <span className="mr-1">{type}</span>
      </span>
    </div>
  );
}
