
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addClass, cancelClass, reactivateClass } from "@/store/slices/classesSlice";

const weekdays = [
  { value: "sunday", label: "الأحد" },
  { value: "monday", label: "الإثنين" },
  { value: "tuesday", label: "الثلاثاء" },
  { value: "wednesday", label: "الأربعاء" },
  { value: "thursday", label: "الخميس" },
  { value: "friday", label: "الجمعة" },
  { value: "saturday", label: "السبت" },
];

export default function Classes() {
  const dispatch = useAppDispatch();
  const { classes } = useAppSelector((state) => state.classes);
  const { staff } = useAppSelector((state) => state.staff);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addClassOpen, setAddClassOpen] = useState(false);
  const [newClass, setNewClass] = useState({
    name: "",
    trainerId: "",
    dayOfWeek: "sunday",
    startTime: "08:00",
    endTime: "09:00",
    maxCapacity: 15,
    description: "",
    level: "beginner" as "beginner" | "intermediate" | "advanced",
  });
  
  const filteredClasses = classes.filter(
    (gymClass) =>
      gymClass.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      gymClass.trainerName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddClass = () => {
    if (!newClass.name || !newClass.trainerId) {
      toast.error("يرجى تعبئة جميع الحقول المطلوبة");
      return;
    }
    
    const trainer = staff.find((s) => s.id === newClass.trainerId);
    if (!trainer) {
      toast.error("المدرب غير موجود");
      return;
    }
    
    dispatch(
      addClass({
        id: `class-${Date.now()}`,
        name: newClass.name,
        trainerId: newClass.trainerId,
        trainerName: trainer.name,
        dayOfWeek: newClass.dayOfWeek,
        startTime: newClass.startTime,
        endTime: newClass.endTime,
        maxCapacity: newClass.maxCapacity,
        currentEnrollment: 0,
        description: newClass.description,
        level: newClass.level,
        status: "active",
      })
    );
    
    toast.success("تمت إضافة الحصة بنجاح");
    setNewClass({
      name: "",
      trainerId: "",
      dayOfWeek: "sunday",
      startTime: "08:00",
      endTime: "09:00",
      maxCapacity: 15,
      description: "",
      level: "beginner",
    });
    setAddClassOpen(false);
  };
  
  const getDayName = (day: string) => {
    const found = weekdays.find((d) => d.value === day);
    return found ? found.label : day;
  };
  
  const getLevelName = (level: string) => {
    switch (level) {
      case "beginner": return "مبتدئ";
      case "intermediate": return "متوسط";
      case "advanced": return "متقدم";
      default: return level;
    }
  };
  
  const handleCancelClass = (classId: string) => {
    dispatch(cancelClass(classId));
    toast.success("تم إلغاء الحصة بنجاح");
  };
  
  const handleReactivateClass = (classId: string) => {
    dispatch(reactivateClass(classId));
    toast.success("تم إعادة تفعيل الحصة بنجاح");
  };
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الحصص</h1>
          <p className="text-muted-foreground">
            إدارة وجدولة الحصص والفعاليات في الصالة الرياضية
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث عن حصة أو مدرب..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddClassOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            إضافة حصة
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>جدول الحصص</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>اسم الحصة</TableHead>
                <TableHead>المدرب</TableHead>
                <TableHead>اليوم</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>المستوى</TableHead>
                <TableHead>الحالة</TableHead>
                <TableHead>التسجيل</TableHead>
                <TableHead className="text-right">إجراءات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((gymClass) => (
                  <TableRow key={gymClass.id}>
                    <TableCell className="font-medium">{gymClass.name}</TableCell>
                    <TableCell>{gymClass.trainerName}</TableCell>
                    <TableCell>{getDayName(gymClass.dayOfWeek)}</TableCell>
                    <TableCell>{`${gymClass.startTime} - ${gymClass.endTime}`}</TableCell>
                    <TableCell>{getLevelName(gymClass.level)}</TableCell>
                    <TableCell>
                      {gymClass.status === "active" ? (
                        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                          نشط
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-500">
                          ملغي
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>{`${gymClass.currentEnrollment} / ${gymClass.maxCapacity}`}</TableCell>
                    <TableCell className="text-right">
                      {gymClass.status === "active" ? (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-destructive"
                          onClick={() => handleCancelClass(gymClass.id)}
                        >
                          إلغاء الحصة
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleReactivateClass(gymClass.id)}
                        >
                          إعادة تفعيل
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={8} className="h-24 text-center">
                    لم يتم العثور على حصص.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={addClassOpen} onOpenChange={setAddClassOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>إضافة حصة جديدة</DialogTitle>
            <DialogDescription>
              أدخل معلومات الحصة الجديدة.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">اسم الحصة</Label>
              <Input
                id="name"
                placeholder="أدخل اسم الحصة"
                value={newClass.name}
                onChange={(e) => setNewClass({ ...newClass, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="trainerId">المدرب</Label>
              <Select
                value={newClass.trainerId}
                onValueChange={(value) => setNewClass({ ...newClass, trainerId: value })}
              >
                <SelectTrigger id="trainerId">
                  <SelectValue placeholder="اختر المدرب" />
                </SelectTrigger>
                <SelectContent>
                  {staff
                    .filter((s) => s.department === "التدريب")
                    .map((trainer) => (
                      <SelectItem key={trainer.id} value={trainer.id}>
                        {trainer.name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="dayOfWeek">اليوم</Label>
                <Select
                  value={newClass.dayOfWeek}
                  onValueChange={(value) => setNewClass({ ...newClass, dayOfWeek: value })}
                >
                  <SelectTrigger id="dayOfWeek">
                    <SelectValue placeholder="اختر اليوم" />
                  </SelectTrigger>
                  <SelectContent>
                    {weekdays.map((day) => (
                      <SelectItem key={day.value} value={day.value}>
                        {day.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="level">المستوى</Label>
                <Select
                  value={newClass.level}
                  onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                    setNewClass({ ...newClass, level: value })}
                >
                  <SelectTrigger id="level">
                    <SelectValue placeholder="اختر المستوى" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">مبتدئ</SelectItem>
                    <SelectItem value="intermediate">متوسط</SelectItem>
                    <SelectItem value="advanced">متقدم</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">وقت البدء</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newClass.startTime}
                  onChange={(e) => setNewClass({ ...newClass, startTime: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="endTime">وقت الانتهاء</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newClass.endTime}
                  onChange={(e) => setNewClass({ ...newClass, endTime: e.target.value })}
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="maxCapacity">الحد الأقصى للمشاركين</Label>
              <Input
                id="maxCapacity"
                type="number"
                value={newClass.maxCapacity}
                onChange={(e) => setNewClass({ ...newClass, maxCapacity: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="description">الوصف</Label>
              <Textarea
                id="description"
                placeholder="أدخل وصفاً للحصة"
                value={newClass.description}
                onChange={(e) => setNewClass({ ...newClass, description: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddClassOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddClass}>إضافة الحصة</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
