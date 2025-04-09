
import { useState } from "react";
import { 
  CalendarClock,
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  UserPlus,
  X
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addMember, filterMembers, recordCheckIn } from "@/store/slices/membersSlice";

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

const membershipTypes = [
  { value: "قياسي", label: "قياسي" },
  { value: "بريميوم", label: "بريميوم" },
  { value: "بريميوم بلس", label: "بريميوم بلس" },
  { value: "شهري", label: "شهري" },
  { value: "سنوي", label: "سنوي" },
];

export default function Members() {
  const dispatch = useAppDispatch();
  const { filteredMembers } = useAppSelector(state => state.members);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addMemberOpen, setAddMemberOpen] = useState(false);
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    phone: "",
    membershipType: "قياسي",
    status: "active" as "active" | "inactive" | "pending" | "expired",
    paymentStatus: "paid" as "paid" | "overdue" | "pending",
  });
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    dispatch(filterMembers({ status: null, searchTerm: term }));
  };
  
  const handleFilterChange = (status: string | null) => {
    dispatch(filterMembers({ status, searchTerm }));
  };
  
  const handleAddMember = () => {
    if (!newMember.name || !newMember.email) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال اسم وبريد إلكتروني صالحين",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const joinDateStr = `${today.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][today.getMonth()]}، ${today.getFullYear()}`;
    
    const nameParts = newMember.name.split(' ');
    const initials = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}${nameParts[0][1] || ''}`;
    
    const memberToAdd = {
      id: `member-${Date.now()}`,
      name: newMember.name,
      email: newMember.email,
      phone: newMember.phone,
      membershipType: newMember.membershipType,
      status: newMember.status,
      joinDate: joinDateStr,
      lastCheckIn: "لم يسجل بعد",
      paymentStatus: newMember.paymentStatus,
      initials: initials,
    };
    
    dispatch(addMember(memberToAdd));
    
    toast({
      title: "تم إضافة العضو بنجاح",
      description: `تمت إضافة ${newMember.name} إلى قائمة الأعضاء`,
    });
    
    setNewMember({
      name: "",
      email: "",
      phone: "",
      membershipType: "قياسي",
      status: "active",
      paymentStatus: "paid",
    });
    
    setAddMemberOpen(false);
  };
  
  const handleCheckIn = (memberId: string) => {
    dispatch(recordCheckIn(memberId));
    toast({
      title: "تم تسجيل الحضور",
      description: "تم تسجيل حضور العضو بنجاح",
    });
  };

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
              onChange={(e) => handleSearch(e.target.value)}
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
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                  جميع الأعضاء
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                  الأعضاء النشطين
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>
                  الأعضاء غير النشطين
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("expired")}>
                  العضويات المنتهية
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("pending")}>
                  العضويات المعلقة
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddMemberOpen(true)}>
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
                <DropdownMenuItem onClick={() => handleFilterChange(null)}>
                  جميع الأعضاء
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("active")}>
                  الأعضاء النشطين
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("inactive")}>
                  الأعضاء غير النشطين
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleFilterChange("expired")}>
                  العضويات المنتهية
                </DropdownMenuItem>
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
                          <DropdownMenuItem onClick={() => handleCheckIn(member.id)}>
                            تسجيل حضور
                          </DropdownMenuItem>
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
      
      {/* Add Member Dialog */}
      <Dialog open={addMemberOpen} onOpenChange={setAddMemberOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة عضو جديد</DialogTitle>
            <DialogDescription>
              أدخل معلومات العضو الجديد أدناه.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                placeholder="اسم العضو"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={newMember.email}
                onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                placeholder="05xxxxxxxx"
                value={newMember.phone}
                onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="membershipType">نوع العضوية</Label>
              <Select
                value={newMember.membershipType}
                onValueChange={(value) => setNewMember({...newMember, membershipType: value})}
              >
                <SelectTrigger id="membershipType">
                  <SelectValue placeholder="اختر نوع العضوية" />
                </SelectTrigger>
                <SelectContent>
                  {membershipTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={newMember.status}
                onValueChange={(value: "active" | "inactive" | "pending" | "expired") => 
                  setNewMember({...newMember, status: value})
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="expired">منتهي</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="paymentStatus">حالة الدفع</Label>
              <Select
                value={newMember.paymentStatus}
                onValueChange={(value: "paid" | "overdue" | "pending") => 
                  setNewMember({...newMember, paymentStatus: value})
                }
              >
                <SelectTrigger id="paymentStatus">
                  <SelectValue placeholder="اختر حالة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">مدفوع</SelectItem>
                  <SelectItem value="pending">معلق</SelectItem>
                  <SelectItem value="overdue">متأخر</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddMemberOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddMember}>
              إضافة عضو
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
