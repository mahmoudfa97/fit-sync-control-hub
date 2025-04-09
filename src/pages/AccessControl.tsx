
import { useState } from "react";
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  Clock,
  DoorOpen,
  RefreshCw
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { 
  filterAccessRecordsByDate, 
  filterAccessRecordsByMember,
  updateAccessDevice
} from "@/store/slices/accessControlSlice";

const statusStyles = {
  active: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  inactive: "bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-500",
  maintenance: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-500",
};

const statusLabels = {
  active: "نشط",
  inactive: "غير نشط",
  maintenance: "في الصيانة"
};

const accessTypeStyles = {
  entry: "bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500",
  exit: "bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-500",
};

const accessTypeLabels = {
  entry: "دخول",
  exit: "خروج"
};

const accessMethodLabels = {
  card: "بطاقة",
  fingerprint: "بصمة",
  app: "تطبيق",
  receptionist: "موظف استقبال",
};

export default function AccessControl() {
  const dispatch = useAppDispatch();
  const { filteredRecords, accessDevices } = useAppSelector(state => state.accessControl);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("access-logs");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      dispatch(filterAccessRecordsByMember(term));
    } else {
      dispatch(filterAccessRecordsByDate(null));
    }
  };
  
  const handleFilterByDate = (date: string | null) => {
    dispatch(filterAccessRecordsByDate(date));
    setSearchTerm("");
  };
  
  const handleUpdateDeviceStatus = (deviceId: string, status: 'active' | 'inactive' | 'maintenance') => {
    const device = accessDevices.find(d => d.id === deviceId);
    
    if (device) {
      dispatch(updateAccessDevice({
        ...device,
        status: status,
        lastMaintenance: status === 'maintenance' ? new Date().toLocaleDateString('ar-SA') : device.lastMaintenance
      }));
      
      toast({
        title: "تم تحديث حالة الجهاز",
        description: `تم تحديث حالة ${device.name} إلى ${statusLabels[status]}`,
      });
    }
  };

  // Get unique dates from access records for the filter dropdown
  const uniqueDates = Array.from(
    new Set(
      useAppSelector(state => state.accessControl.accessRecords).map(record => record.date)
    )
  );

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">التحكم بالوصول</h1>
          <p className="text-muted-foreground">
            إدارة أجهزة الوصول وسجلات الدخول والخروج في صالتك الرياضية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          {activeTab === "access-logs" && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Calendar className="h-4 w-4" />
                  <span className="sr-only">تصفية حسب التاريخ</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuGroup>
                  <DropdownMenuItem onClick={() => handleFilterByDate(null)}>
                    جميع التواريخ
                  </DropdownMenuItem>
                  {uniqueDates.map(date => (
                    <DropdownMenuItem key={date} onClick={() => handleFilterByDate(date)}>
                      {date}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {activeTab === "access-logs" ? "إضافة تسجيل" : "إضافة جهاز"}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="access-logs" className="w-full" onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="access-logs">سجلات الدخول والخروج</TabsTrigger>
          <TabsTrigger value="devices">أجهزة التحكم بالوصول</TabsTrigger>
        </TabsList>
        
        <TabsContent value="access-logs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>سجلات الدخول والخروج</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">تنزيل السجلات</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">العضو</TableHead>
                    <TableHead>نوع التسجيل</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الوقت</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>طريقة التسجيل</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRecords.length > 0 ? (
                    filteredRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>{record.memberInitials}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{record.memberName}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={accessTypeStyles[record.type]}>
                            {accessTypeLabels[record.type]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {record.date}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span>{record.time}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          {record.location}
                        </TableCell>
                        <TableCell>
                          {accessMethodLabels[record.method]}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        لم يتم العثور على سجلات.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="devices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>أجهزة التحكم بالوصول</CardTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <Download className="h-4 w-4" />
                  <span className="sr-only">تنزيل تقرير</span>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الجهاز</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الموقع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>آخر صيانة</TableHead>
                    <TableHead className="text-right">إجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accessDevices.map((device) => (
                    <TableRow key={device.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <DoorOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{device.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {device.type === 'reader' ? 'قارئ بطاقات' : 
                         device.type === 'gate' ? 'بوابة' : 
                         device.type === 'turnstile' ? 'دوار' : 'باب'}
                      </TableCell>
                      <TableCell>
                        {device.location}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={statusStyles[device.status]}>
                          {statusLabels[device.status]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {device.lastMaintenance}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              إجراءات <ChevronDown className="ml-1 h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleUpdateDeviceStatus(device.id, 'active')}>
                              تفعيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDeviceStatus(device.id, 'inactive')}>
                              إلغاء التفعيل
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateDeviceStatus(device.id, 'maintenance')}>
                              وضع في الصيانة
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <RefreshCw className="mr-2 h-4 w-4" />
                              إعادة تشغيل
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardShell>
  );
}
