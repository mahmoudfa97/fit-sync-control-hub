
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { t, tFormat } from "@/utils/translations";
import { CalendarClock } from "lucide-react";

interface ExpiringMember {
  id: string;
  name: string;
  initials: string;
  daysLeft: number;
  expiryDate: string;
  membershipType: string;
}

const expiringMembers: ExpiringMember[] = [
  {
    id: "1",
    name: "אבי כהן",
    initials: "אכ",
    daysLeft: 3,
    expiryDate: "14/04/2024",
    membershipType: "פרימיום"
  },
  {
    id: "2",
    name: "נועה לוי",
    initials: "נל",
    daysLeft: 5,
    expiryDate: "16/04/2024",
    membershipType: "סטנדרט"
  },
  {
    id: "3",
    name: "יוסי גולדברג",
    initials: "יג",
    daysLeft: 7,
    expiryDate: "18/04/2024",
    membershipType: "פרימיום פלוס"
  },
  {
    id: "4",
    name: "מיכל דוידוב",
    initials: "מד",
    daysLeft: 8,
    expiryDate: "19/04/2024",
    membershipType: "בסיסי"
  },
];

export function ExpiringMembersCard() {
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("expiringMembers")}</CardTitle>
            <CardDescription>מנויים שעומדים להסתיים בקרוב</CardDescription>
          </div>
          <CalendarClock className="h-5 w-5 opacity-70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {expiringMembers.map((member) => (
            <div key={member.id}>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {member.initials}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium">{member.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {member.membershipType}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-medium text-destructive">
                    {tFormat("daysLeft", { days: member.daysLeft })}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tFormat("expiresOn", { date: member.expiryDate })}
                  </div>
                </div>
              </div>
              <Separator className="mt-4" />
            </div>
          ))}
        </div>
        <Button variant="ghost" className="w-full mt-4 text-primary">
          {t("viewAll")}
        </Button>
      </CardContent>
    </Card>
  );
}
