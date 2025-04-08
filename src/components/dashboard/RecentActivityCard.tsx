
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

type ActivityType = "checkin" | "payment" | "new-member" | "access" | "renewal";

interface Activity {
  id: string;
  type: ActivityType;
  user: {
    name: string;
    avatar?: string;
    initials: string;
  };
  time: string;
  details: string;
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

const ACTIVITIES: Activity[] = [
  {
    id: "1",
    type: "checkin",
    user: {
      name: "John Doe",
      initials: "JD",
    },
    time: "2 min ago",
    details: "Checked in for evening workout",
  },
  {
    id: "2",
    type: "payment",
    user: {
      name: "Sarah Wilson",
      initials: "SW",
    },
    time: "23 min ago",
    details: "Made payment of $59.99 for monthly plan",
  },
  {
    id: "3",
    type: "new-member",
    user: {
      name: "Michael Chen",
      initials: "MC",
    },
    time: "1 hour ago",
    details: "Registered for new premium membership",
  },
  {
    id: "4",
    type: "access",
    user: {
      name: "Emily Johnson",
      initials: "EJ",
    },
    time: "2 hours ago",
    details: "Accessed gym through south entrance",
  },
  {
    id: "5",
    type: "renewal",
    user: {
      name: "Robert Smith",
      initials: "RS",
    },
    time: "3 hours ago",
    details: "Renewed platinum membership for 12 months",
  },
];

export function RecentActivityCard() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest activity across your gym</CardDescription>
        </div>
        <Button variant="ghost" size="icon">
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">More options</span>
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
                      <span className="ml-1">{activity.type.replace("-", " ")}</span>
                    </span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">{activity.details}</p>
                <p className="text-xs text-muted-foreground">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
