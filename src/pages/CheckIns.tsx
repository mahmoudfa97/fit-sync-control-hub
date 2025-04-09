
import { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { toast } from "sonner";
import { Plus, Search } from "lucide-react";
import { useAppDispatch, useAppSelector } from "@/hooks/redux";
import { addCheckIn } from "@/store/slices/checkInsSlice";
import { recordCheckIn } from "@/store/slices/membersSlice";

export default function CheckIns() {
  const dispatch = useAppDispatch();
  const { checkIns } = useAppSelector((state) => state.checkIns);
  const { members } = useAppSelector((state) => state.members);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [addCheckInOpen, setAddCheckInOpen] = useState(false);
  const [newCheckIn, setNewCheckIn] = useState({
    memberId: "",
    notes: "",
  });
  
  const filteredCheckIns = checkIns.filter(
    (checkIn) =>
      checkIn.memberName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddCheckIn = () => {
    if (!newCheckIn.memberId) {
      toast.error("يرجى اختيار عضو");
      return;
    }
    
    const member = members.find((m) => m.id === newCheckIn.memberId);
    if (!member) {
      toast.error("العضو غير موجود");
      return;
    }
    
    const now = new Date();
    
    dispatch(
      addCheckIn({
        id: `checkin-${Date.now()}`,
        memberId: newCheckIn.memberId,
        memberName: member.name,
        checkInTime: now.toISOString(),
        notes: newCheckIn.notes,
      })
    );
    
    dispatch(recordCheckIn(newCheckIn.memberId));
    
    toast.success("تم تسجيل الحضور بنجاح");
    setNewCheckIn({
      memberId: "",
      notes: "",
    });
    setAddCheckInOpen(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ar-SA", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">تسجيل الحضور</h1>
          <p className="text-muted-foreground">
            تتبع وإدارة حضور الأعضاء في الصالة
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="البحث عن عضو..."
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddCheckInOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            تسجيل حضور
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>العضو</TableHead>
                <TableHead>التاريخ</TableHead>
                <TableHead>الوقت</TableHead>
                <TableHead>ملاحظات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCheckIns.length > 0 ? (
                filteredCheckIns.map((checkIn) => (
                  <TableRow key={checkIn.id}>
                    <TableCell className="font-medium">{checkIn.memberName}</TableCell>
                    <TableCell>{formatDate(checkIn.checkInTime)}</TableCell>
                    <TableCell>{formatTime(checkIn.checkInTime)}</TableCell>
                    <TableCell>{checkIn.notes || "-"}</TableCell>
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

      <Dialog open={addCheckInOpen} onOpenChange={setAddCheckInOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تسجيل حضور جديد</DialogTitle>
            <DialogDescription>
              سجل حضور عضو في الصالة الرياضية.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberId">العضو</Label>
              <Select
                value={newCheckIn.memberId}
                onValueChange={(value) => setNewCheckIn({ ...newCheckIn, memberId: value })}
              >
                <SelectTrigger id="memberId">
                  <SelectValue placeholder="اختر العضو" />
                </SelectTrigger>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      {member.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="notes">ملاحظات (اختياري)</Label>
              <Input
                id="notes"
                placeholder="أدخل أي ملاحظات إضافية"
                value={newCheckIn.notes}
                onChange={(e) => setNewCheckIn({ ...newCheckIn, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCheckInOpen(false)}>
              إلغاء
            </Button>
            <Button onClick={handleAddCheckIn}>تسجيل الحضور</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
