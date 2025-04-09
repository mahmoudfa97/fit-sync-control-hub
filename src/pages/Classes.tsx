
import { useState } from "react";
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  Users,
  Clock
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
import { useToast } from "@/hooks/use-toast";

import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { filterClassesByDay, filterClassesByInstructor } from "@/store/slices/classesSlice";

const levelLabels = {
  beginner: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  all: "الكل",
};

export default function Classes() {
  const dispatch = useAppDispatch();
  const { filteredClasses } = useAppSelector(state => state.classes);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      dispatch(filterClassesByInstructor(term));
    } else {
      dispatch(filterClassesByDay(null));
    }
  };
  
  const handleFilterByDay = (day: string | null) => {
    dispatch(filterClassesByDay(day));
    setSearchTerm("");
  };

  // Get unique days from the schedule
  const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">الحصص والجدول</h1>
          <p className="text-muted-foreground">
            إدارة الحصص الجماعية وجدول الصالة الرياضية.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث في الحصص..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
            />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <Calendar className="h-4 w-4" />
                <span className="sr-only">تصفية حسب اليوم</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => handleFilterByDay(null)}>
                  جميع الأيام
                </DropdownMenuItem>
                {days.map(day => (
                  <DropdownMenuItem key={day} onClick={() => handleFilterByDay(day)}>
                    {day}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            إضافة حصة
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>جدول الحصص الجماعية</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <Download className="h-4 w-4" />
              <span className="sr-only">تنزيل الجدول</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>الحصة</TableHead>
                <TableHead>المدرب</TableHead>
                <TableHead>الجدول</TableHead>
                <TableHead>الموقع</TableHead>
                <TableHead>المستوى</TableHead>
                <TableHead className="text-center">المقاعد</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClasses.length > 0 ? (
                filteredClasses.map((classItem) => (
                  <TableRow key={classItem.id}>
                    <TableCell className="font-medium">
                      <Badge variant="outline" className={classItem.categoryColor}>
                        {classItem.name}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {classItem.instructor}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{classItem.schedule.days.join('، ')}</span>
                        </div>
                        <div className="flex items-center gap-1 text-sm">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>
                            {classItem.schedule.startTime} - {classItem.schedule.endTime}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {classItem.location}
                    </TableCell>
                    <TableCell>
                      {levelLabels[classItem.level]}
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{classItem.enrolled}/{classItem.capacity}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-100 rounded-full mt-1 overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full"
                          style={{ width: `${(classItem.enrolled / classItem.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    لم يتم العثور على حصص.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>البرامج الأكثر شعبية</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredClasses
                .sort((a, b) => b.enrolled - a.enrolled)
                .slice(0, 5)
                .map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={classItem.categoryColor}>
                      {classItem.name}
                    </Badge>
                    <span className="text-sm text-muted-foreground">{classItem.instructor}</span>
                  </div>
                  <span className="font-medium">{classItem.enrolled} مشترك</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>المدربين النشطين</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from(
                new Set(filteredClasses.map(c => c.instructor))
              ).map((instructor, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="font-medium">{instructor}</span>
                  <span className="text-sm text-muted-foreground">
                    {filteredClasses.filter(c => c.instructor === instructor).length} حصص
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>إحصائيات الحصص</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">إجمالي الحصص</span>
                <span className="font-medium">{filteredClasses.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">متوسط الحضور</span>
                <span className="font-medium">
                  {Math.round(
                    filteredClasses.reduce((acc, curr) => acc + curr.enrolled, 0) / 
                    filteredClasses.length
                  )} مشترك
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">أكثر الأيام نشاطًا</span>
                <span className="font-medium">
                  {
                    days.sort((a, b) => 
                      filteredClasses.filter(c => c.schedule.days.includes(b)).length -
                      filteredClasses.filter(c => c.schedule.days.includes(a)).length
                    )[0]
                  }
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
