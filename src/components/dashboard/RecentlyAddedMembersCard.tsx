
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
import { t } from "@/utils/translations";
import { UserPlus } from "lucide-react";

interface RecentMember {
  id: string;
  name: string;
  initials: string;
  joinDate: string;
  membershipType: string;
}

const recentMembers: RecentMember[] = [
  {
    id: "1",
    name: "דנה אברהם",
    initials: "דא",
    joinDate: "היום",
    membershipType: "פרימיום"
  },
  {
    id: "2",
    name: "עמית ברק",
    initials: "עב",
    joinDate: "אתמול",
    membershipType: "סטנדרט"
  },
  {
    id: "3",
    name: "גיל שרון",
    initials: "גש",
    joinDate: "10/04/2024",
    membershipType: "בסיסי"
  },
  {
    id: "4",
    name: "תמר וינברג",
    initials: "תו",
    joinDate: "08/04/2024",
    membershipType: "פרימיום פלוס"
  },
];

export function RecentlyAddedMembersCard() {
  return (
    <Card className="col-span-1 lg:col-span-1">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{t("recentlyAddedMembers")}</CardTitle>
            <CardDescription>לקוחות חדשים שהצטרפו לאחרונה</CardDescription>
          </div>
          <UserPlus className="h-5 w-5 opacity-70" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentMembers.map((member) => (
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
                  <div className="text-sm font-medium">{member.joinDate}</div>
                  <div className="text-xs text-muted-foreground">הצטרף/ה</div>
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
