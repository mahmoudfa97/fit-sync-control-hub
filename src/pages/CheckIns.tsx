
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
import { t } from "@/utils/translations";

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
      toast.error(t("memberRequired"));
      return;
    }
    
    const member = members.find((m) => m.id === newCheckIn.memberId);
    if (!member) {
      toast.error(t("memberNotFound"));
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
    
    toast.success(t("checkInAdded"));
    setNewCheckIn({
      memberId: "",
      notes: "",
    });
    setAddCheckInOpen(false);
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("he-IL", {
      weekday: "long",
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };
  
  return (
    <DashboardShell>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">{t("checkinsTitle")}</h1>
          <p className="text-muted-foreground">
            {t("checkinsDesc")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative w-full md:w-auto">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder={t("searchMember")}
              className="pl-8 w-full md:w-[300px]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setAddCheckInOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {t("addCheckIn")}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("checkInLog")}</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>{t("memberName")}</TableHead>
                <TableHead>{t("checkInDate")}</TableHead>
                <TableHead>{t("checkInTime")}</TableHead>
                <TableHead>{t("notes")}</TableHead>
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
                    {t("noCheckIns")}
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
            <DialogTitle>{t("newCheckIn")}</DialogTitle>
            <DialogDescription>
              {t("newCheckInDesc")}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="memberId">{t("memberName")}</Label>
              <Select
                value={newCheckIn.memberId}
                onValueChange={(value) => setNewCheckIn({ ...newCheckIn, memberId: value })}
              >
                <SelectTrigger id="memberId">
                  <SelectValue placeholder={t("chooseMember")} />
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
              <Label htmlFor="notes">{t("optionalNotes")}</Label>
              <Input
                id="notes"
                placeholder={t("enterNotes")}
                value={newCheckIn.notes}
                onChange={(e) => setNewCheckIn({ ...newCheckIn, notes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddCheckInOpen(false)}>
              {t("cancel")}
            </Button>
            <Button onClick={handleAddCheckIn}>{t("addCheckIn")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
