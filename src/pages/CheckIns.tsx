
import { useState } from "react";
import { 
  Calendar, 
  ChevronDown, 
  Download, 
  Filter, 
  Plus, 
  Search,
  CalendarClock
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
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
import { addCheckIn, filterCheckInsByDate, filterCheckInsByMember } from "@/store/slices/checkInsSlice";
import { recordCheckIn } from "@/store/slices/membersSlice";

export default function CheckIns() {
  const dispatch = useAppDispatch();
  const { filteredCheckIns } = useAppSelector(state => state.checkIns);
  const { members } = useAppSelector(state => state.members);
  const { toast } = useToast();
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addCheckInOpen, setAddCheckInOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState("");
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
    if (term) {
      dispatch(filterCheckInsByMember(term));
    } else {
      dispatch(filterCheckInsByDate(null));
    }
  };
  
  const handleAddCheckIn = () => {
    if (!selectedMemberId) {
      toast({
        title: "خطأ",
        description: "الرجاء اختيار عضو",
        variant: "destructive",
      });
      return;
    }
    
    const member = members.find(m => m.id === selectedMemberId);
    
    if (!member) {
      toast({
        title: "خطأ",
        description: "لم يتم العثور على العضو",
        variant: "destructive",
      });
      return;
    }
    
    const now = new Date();
    const dayNames = ["الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة", "السبت"];
    const dayName = dayNames[now.getDay()];
    const dateStr = `${dayName}، ${now.getDate()} ${['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'][now.getMonth()]}`;
    const hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const timeStr = `${hours}:${minutes} ${hours >= 12 ? 'م' : 'ص'}`;
    
    const checkInData = {
      id: `checkin-${Date.now()}`,
      memberId: member.id,
      memberName: member.name,
      memberInitials: member.initials,
      memberAvatar: member.avatar,
      timestamp: now.toISOString(),
      date: dateStr,
      time: timeStr
    };
    
    dispatch(addCheckIn(checkInData));
    dispatch(recordCheckIn(member.id));
    
    toast({
      title: "تم تسجيل الحضور",
      description: `تم تسجيل حضور ${member.name} بنجاح`,
    });
    
    setSelectedMemberId("");
    setAddCheckInOpen(false);
  };
  
  const handleFilterByDate = (date: string | null) => {
    dispatch(filterCheckInsByDate(date));
    setSearchTerm("");
  };

  // Get unique dates from check-ins for the filter dropdown
  const uniqueDates = Array.from(
    new Set(
      useAppSelector(state => state.checkIns.checkIns).map(record => record.date)
    )
  );

  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">سجل الحضور</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة تسجيلات حضور الأعضاء في صالتك الرياضية.
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
          <Button onClick={() => setAddCheckInOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            تسجيل حضور
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>سجل تسجيلات الحضور</CardTitle>
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
                <TableHead className="w-[250px]">العضو</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>النوع</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckIns.length > 0 ? (
                filteredCheckIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={checkIn.memberAvatar} alt={checkIn.memberName} />
                          <AvatarFallback>{checkIn.memberInitials}</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{checkIn.memberName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {checkIn.date}
                    </TableCell>
                    <TableCell>
                      {checkIn.time}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-500">
                        دخول
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    لم يتم العثور على سجلات حضور.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add Check-In Dialog */}
      <Dialog open={addCheckInOpen} onOpenChange={setAddCheckInOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>تسجيل حضور عضو</DialogTitle>
            <DialogDescription>
              اختر العضو الذي تريد تسجيل حضوره.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="member">العضو</Label>
              <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
                <SelectTrigger id="member">
                  <SelectValue placeholder="اختر العضو" />
                </SelectTrigger>
                <SelectContent>
                  {members
                    .filter(m => m.status === "active")
                    .map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2 py-2">
              <CalendarClock className="h-5 w-5 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                سيتم تسجيل الحضور بتاريخ ووقت الآن
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCheckInOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddCheckIn}>
              تسجيل الحضور
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
