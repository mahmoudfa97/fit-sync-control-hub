
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
    name: "مريم العبدالله",
    initials: "مع",
    expiryDate: "15 أبريل، 2025",
    daysLeft: 3,
    plan: "فتنس بلس",
  },
  {
    id: "2",
    name: "فهد الشمري",
    initials: "فش",
    expiryDate: "17 أبريل، 2025",
    daysLeft: 5,
    plan: "الخطة الأساسية",
  },
  {
    id: "3",
    name: "نورة القحطاني",
    initials: "نق",
    expiryDate: "18 أبريل، 2025",
    daysLeft: 6,
    plan: "الخطة المميزة",
  },
  {
    id: "4",
    name: "عبدالله الغامدي",
    initials: "عغ",
    expiryDate: "20 أبريل، 2025",
    daysLeft: 8,
    plan: "الباقة الشهرية",
  },
];

export function MembershipExpiryCard() {
  return (
    <Card className="col-span-1 lg:col-span-2">
      <CardHeader className="flex flex-row items-center">
        <div className="flex items-center gap-2">
          <BadgeAlert className="h-5 w-5 text-amber-500" />
          <div>
            <CardTitle>العضويات المنتهية قريبًا</CardTitle>
            <CardDescription>الأعضاء ذوو الاشتراكات المنتهية قريبًا</CardDescription>
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
                  متبقي {member.daysLeft} أيام
                </p>
                <p className="text-xs text-muted-foreground">تنتهي في {member.expiryDate}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 flex justify-between">
        <Button variant="outline" size="sm">
          إرسال تذكيرات
        </Button>
        <Button size="sm">عرض الكل</Button>
      </CardFooter>
    </Card>
  );
}
