
import React from "react";
import { Button } from "@/components/ui/button";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { membershipTypes } from "./MembershipTypes";

interface NewMemberForm {
  name: string;
  email: string;
  phone: string;
  membershipType: string;
  status: "active" | "inactive" | "pending" | "expired";
  paymentStatus: "paid" | "overdue" | "pending";
}

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMember: NewMemberForm;
  setNewMember: React.Dispatch<React.SetStateAction<NewMemberForm>>;
  onAddMember: () => void;
}

export const AddMemberDialog = ({
  open,
  onOpenChange,
  newMember,
  setNewMember,
  onAddMember,
}: AddMemberDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            إلغاء
          </Button>
          <Button onClick={onAddMember}>
            إضافة عضو
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
