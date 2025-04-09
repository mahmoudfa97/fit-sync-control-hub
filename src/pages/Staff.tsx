
import { useState } from "react";
import { 
  CalendarClock,
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  UserPlus,
  Briefcase
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
import { addStaffMember, filterStaffByDepartment, searchStaff } from "@/store/slices/staffSlice";

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
  on_leave: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
};

const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
  on_leave: "في إجازة"
};

const departments = [
  { value: "التدريب", label: "التدريب" },
  { value: "الإدارة", label: "الإدارة" },
  { value: "الاستقبال", label: "الاستقبال" },
  { value: "التغذية", label: "التغذية" },
  { value: "الصيانة", label: "الصيانة" },
];

const roles = [
  { value: "مدرب شخصي", label: "مدرب شخصي", dept: "التدريب" },
  { value: "مدرب يوغا", label: "مدرب يوغا", dept: "التدريب" },
  { value: "مدرب زومبا", label: "مدرب زومبا", dept: "التدريب" },
  { value: "مدير النادي", label: "مدير النادي", dept: "الإدارة" },
  { value: "مدير العمليات", label: "مدير العمليات", dept: "الإدارة" },
  { value: "موظف استقبال", label: "موظف استقبال", dept: "الاستقبال" },
  { value: "مستشار تغذية", label: "مستشار تغذية", dept: "التغذية" },
  { value: "مسؤول النظافة", label: "مسؤول النظافة", dept: "الصيانة" },
];

export default function Staff() {
  const dispatch = useAppDispatch();
  const { staff, filteredStaff } = useAppSelector(state => state.staff);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addStaffOpen, setAddStaffOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    name: "",
    email: "",
    phone: "",
    role: "",
    department: "",
    status: "active" as "active" | "inactive" | "on_leave",
  });
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      dispatch(searchStaff(term));
    } else {
      dispatch(filterStaffByDepartment(null));
    }
  };
  
  const handleFilterByDepartment = (department: string | null) => {
    dispatch(filterStaffByDepartment(department));
    setSearchTerm("");
  };
  
  const filteredRoles = newStaff.department 
    ? roles.filter(role => role.dept === newStaff.department)
    : roles;
  
  const handleAddStaff = () => {
    if (!newStaff.name || !newStaff.email || !newStaff.role || !newStaff.department) {
      toast({
        title: "خطأ في البيانات",
        description: "يرجى إدخال جميع البيانات المطلوبة",
        variant: "destructive",
      });
      return;
    }
    
    const today = new Date();
    const hireDateStr = `${today.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][today.getMonth()]}، ${today.getFullYear()}`;
    
    const nameParts = newStaff.name.split(' ');
    const initials = nameParts.length > 1 
      ? `${nameParts[0][0]}${nameParts[1][0]}`
      : `${nameParts[0][0]}${nameParts[0][1] || ''}`;
    
    // Default work days
    const workDays = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس'];
    
    dispatch(
      addStaffMember({
        id: `staff-${Date.now()}`,
        name: newStaff.name,
        email: newStaff.email,
        phone: newStaff.phone,
        role: newStaff.role,
        department: newStaff.department,
        hireDate: hireDateStr,
        status: newStaff.status,
        schedule: {
          days: workDays,
          shift: "صباحي (6ص - 2م)",
        },
        initials: initials,
        joinDate: today.toISOString(), // For backward compatibility
      })
    );
    
    toast({
      title: "تم إضافة الموظف بنجاح",
      description: `تمت إضافة ${newStaff.name} إلى فريق العمل`,
    });
    
    setNewStaff({
      name: "",
      email: "",
      phone: "",
      role: "",
      department: "",
      status: "active",
    });
    
    setAddStaffOpen(false);
  };

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الموظفين</h1>
          <p className="text-muted-foreground">
            إدارة ومتابعة فريق العمل في صالتك الرياضية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث في الموظفين..."
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
                <DropdownMenuItem onClick={() => handleFilterByDepartment(null)}>
                  جميع الأقسام
                </DropdownMenuItem>
                {departments.map(dept => (
                  <DropdownMenuItem key={dept.value} onClick={() => handleFilterByDepartment(dept.value)}>
                    {dept.label}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button onClick={() => setAddStaffOpen(true)}>
            <UserPlus className="mr-2 h-4 w-4" />
            إضافة موظف
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>دليل الموظفين</CardTitle>
          <div className="flex items-center gap-2">
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
                <TableHead className="w-[250px]">الموظف</TableHead>
                <TableHead>القسم</TableHead>
                <TableHead>المسمى الوظيفي</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>تاريخ التوظيف</TableHead>
                <TableHead>جدول العمل</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStaff.length > 0 ? (
                filteredStaff.map((staff) => (
                  <TableRow key={staff.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={staff.avatar} alt={staff.name} />
                          <AvatarFallback>{staff.initials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">{staff.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {staff.department}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <span>{staff.role}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={statusStyles[staff.status]}>
                        {statusLabels[staff.status]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {staff.hireDate}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-xs text-muted-foreground">
                          {staff.schedule.days.join("، ")}
                        </div>
                        <div className="text-xs font-medium">
                          {staff.schedule.shift}
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    لم يتم العثور على موظفين.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Staff Dialog */}
      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>إضافة موظف جديد</DialogTitle>
            <DialogDescription>
              أدخل معلومات الموظف الجديد أدناه.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">الاسم</Label>
              <Input
                id="name"
                placeholder="اسم الموظف"
                value={newStaff.name}
                onChange={(e) => setNewStaff({...newStaff, name: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">البريد الإلكتروني</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={newStaff.email}
                onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="phone">رقم الهاتف</Label>
              <Input
                id="phone"
                placeholder="05xxxxxxxx"
                value={newStaff.phone}
                onChange={(e) => setNewStaff({...newStaff, phone: e.target.value})}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="department">القسم</Label>
              <Select
                value={newStaff.department}
                onValueChange={(value) => setNewStaff({...newStaff, department: value, role: ""})}
              >
                <SelectTrigger id="department">
                  <SelectValue placeholder="اختر القسم" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept.value} value={dept.value}>
                      {dept.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="role">المسمى الوظيفي</Label>
              <Select
                value={newStaff.role}
                onValueChange={(value) => setNewStaff({...newStaff, role: value})}
                disabled={!newStaff.department}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="اختر المسمى الوظيفي" />
                </SelectTrigger>
                <SelectContent>
                  {filteredRoles.map((role) => (
                    <SelectItem key={role.value} value={role.value}>
                      {role.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">الحالة</Label>
              <Select
                value={newStaff.status}
                onValueChange={(value: "active" | "inactive" | "on_leave") => 
                  setNewStaff({...newStaff, status: value})
                }
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">نشط</SelectItem>
                  <SelectItem value="inactive">غير نشط</SelectItem>
                  <SelectItem value="on_leave">في إجازة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddStaffOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddStaff}>
              إضافة موظف
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
