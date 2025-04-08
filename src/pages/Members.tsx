
import { useState } from "react";
import { 
  CalendarClock,
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  UserPlus 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Badge
} from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Member {
  id: string;
  name: string;
  email: string;
  membershipType: string;
  status: "active" | "inactive" | "pending" | "expired";
  joinDate: string;
  lastCheckIn: string;
  paymentStatus: "paid" | "overdue" | "pending";
  initials: string;
  avatar?: string;
}

const members: Member[] = [
  {
    id: "1",
    name: "سارة الحمدان",
    email: "sarah.alh@example.com",
    membershipType: "بريميوم",
    status: "active",
    joinDate: "5 يناير، 2024",
    lastCheckIn: "اليوم 8:45 ص",
    paymentStatus: "paid",
    initials: "سح"
  },
  {
    id: "2",
    name: "خالد العمري",
    email: "khalid.a@example.com",
    membershipType: "قياسي",
    status: "active",
    joinDate: "12 فبراير، 2024",
    lastCheckIn: "اليوم 7:30 ص",
    paymentStatus: "paid",
    initials: "خع"
  },
  {
    id: "3",
    name: "منى الزهراني",
    email: "mona.z@example.com",
    membershipType: "بريميوم",
    status: "active",
    joinDate: "8 نوفمبر، 2023",
    lastCheckIn: "بالأمس 6:15 م",
    paymentStatus: "paid",
    initials: "مز"
  },
  {
    id: "4",
    name: "أحمد السعيد",
    email: "ahmed.s@example.com",
    membershipType: "قياسي",
    status: "inactive",
    joinDate: "21 مارس، 2023",
    lastCheckIn: "2 أبريل، 2025",
    paymentStatus: "overdue",
    initials: "أس"
  },
  {
    id: "5",
    name: "نورة الشمري",
    email: "noura.s@example.com",
    membershipType: "بريميوم بلس",
    status: "active",
    joinDate: "3 ديسمبر، 2023",
    lastCheckIn: "اليوم 10:20 ص",
    paymentStatus: "paid",
    initials: "نش"
  },
  {
    id: "6",
    name: "محمد العتيبي",
    email: "mohammed.o@example.com",
    membershipType: "شهري",
    status: "active",
    joinDate: "18 فبراير، 2024",
    lastCheckIn: "بالأمس 8:00 م",
    paymentStatus: "pending",
    initials: "مع"
  },
  {
    id: "7",
    name: "ليلى القاسم",
    email: "layla.q@example.com",
    membershipType: "سنوي",
    status: "expired",
    joinDate: "5 أبريل، 2023",
    lastCheckIn: "20 مارس، 2024",
    paymentStatus: "overdue",
    initials: "لق"
  },
];

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
  expired: "bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500",
};

const paymentStatusStyles = {
  paid: "text-green-600",
  overdue: "text-red-600",
  pending: "text-amber-600",
};

const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
  pending: "معلق",
  expired: "منتهي"
};

const paymentStatusLabels = {
  paid: "مدفوع",
  overdue: "متأخر",
  pending: "معلق"
};

export default function Members() {
  const [searchTerm, setSearchTerm] = useState("");
  
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الأعضاء</h1>
          <p className="text-muted-foreground">
            إدارة ومتابعة أعضاء صالتك الرياضية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث في الأعضاء..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
                <span className="sr-only">فلترة</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem>الأعضاء النشطين</DropdownMenuItem>
                <DropdownMenuItem>الأعضاء غير النشطين</DropdownMenuItem>
                <DropdownMenuItem>العضويات المنتهية</DropdownMenuItem>
                <DropdownMenuItem>المدفوعات المتأخرة</DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <UserPlus className="mr-2 h-4 w-4" />
            إضافة عضو
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>دليل الأعضاء</CardTitle>
          <div className="flex items-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  جميع الأعضاء
                  <ChevronDown className="h-4 w-4 opacity-50" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>جميع الأعضاء</DropdownMenuItem>
                <DropdownMenuItem>الأعضاء النشطين</DropdownMenuItem>
                <DropdownMenuItem>الأعضاء غير النشطين</DropdownMenuItem>
                <DropdownMenuItem>العضويات المنتهية</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">تنزيل CSV</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[250px]">العضو</TableHead>
                <TableHead>العضوية</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>آخر تسجيل حضور</TableHead>
                <TableHead>الدفع</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback>{member.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{member.membershipType}</span>
                        <span className="text-xs text-muted-foreground">منذ {member.joinDate}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[member.status]}>
                        {statusLabels[member.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{member.lastCheckIn}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`font-medium ${paymentStatusStyles[member.paymentStatus]}`}>
                        {paymentStatusLabels[member.paymentStatus]}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            إجراءات <ChevronDown className="ml-1 h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>عرض الملف الشخصي</DropdownMenuItem>
                          <DropdownMenuItem>تعديل العضو</DropdownMenuItem>
                          <DropdownMenuItem>تسجيل حضور</DropdownMenuItem>
                          <DropdownMenuItem>إدارة الخطة</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            إلغاء التفعيل
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    لم يتم العثور على أعضاء.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
