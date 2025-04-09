
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Avatar, 
  AvatarFallback, 
  AvatarImage 
} from "@/components/ui/avatar";
import { BadgeAlert } from "lucide-react";
import { t, tFormat } from "@/utils/translations";

interface ExpiringMembership {
  id: string;
  name: string;
  initials: string;
  avatar?: string;
  expiryDate: string;
  daysLeft: number;
  plan: string;
}

const EXPIRING_MEMBERSHIPS: ExpiringMembership[] = [
  {
    id: "1",
    name: "מרים העבדאללה",
    initials: "מה",
    expiryDate: "15 אפריל, 2025",
    daysLeft: 3,
    plan: "פיטנס פלוס",
  },
  {
    id: "2",
    name: "פהד אל-שמרי",
    initials: "פש",
    expiryDate: "17 אפריל, 2025",
    daysLeft: 5,
    plan: "תוכנית בסיסית",
  },
  {
    id: "3",
    name: "נורה אל-קחטני",
    initials: "נק",
    expiryDate: "18 אפריל, 2025",
    daysLeft: 6,
    plan: "תוכנית פרימיום",
  },
  {
    id: "4",
    name: "עבדאללה אל-ע'אמדי",
    initials: "עג",
    expiryDate: "20 אפריל, 2025",
    daysLeft: 8,
    plan: "חבילה חודשית",
  },
];

export function MembershipExpiryCard() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center gap-2">
          <BadgeAlert className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>{t("upcomingExpiry")}</CardTitle>
            <CardDescription>{t("membersWithExpiringSubs")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {EXPIRING_MEMBERSHIPS.map((member) => (
            <div key={member.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={member.avatar} alt={member.name} />
                  <AvatarFallback>{member.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{member.name}</p>
                  <p className="text-xs text-muted-foreground">{member.plan}</p>
                </div>
              </div>
              <div className="flex flex-col items-end">
                <p className={`text-sm font-medium ${member.daysLeft <= 3 ? "text-destructive" : "text-amber-500"}`}>
                  {tFormat("daysLeft", { days: member.daysLeft })}
                </p>
                <p className="text-xs text-muted-foreground">{tFormat("expiresOn", { date: member.expiryDate })}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm">
          {t("sendReminders")}
        </Button>
        <Button size="sm">{t("viewAll")}</Button>
      </CardFooter>
    </Card>
  );
}
