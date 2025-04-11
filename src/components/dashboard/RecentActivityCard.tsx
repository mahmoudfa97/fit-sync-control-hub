
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MoreHorizontal } from "lucide-react";
import { Button } from "../ui/button";
import { t } from "@/utils/translations";
import { ActivityItem } from "./ActivityItem";
import { ACTIVITIES } from "./ActivityData";

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
            <ActivityItem key={activity.id} activity={activity} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
