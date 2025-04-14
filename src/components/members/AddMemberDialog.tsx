
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
import { type Member } from "@/store/slices/membersSlice";
import { MemberFormData } from "@/services/MemberService";

interface AddMemberDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  newMember: MemberFormData;
  setNewMember: React.Dispatch<React.SetStateAction<MemberFormData>>;
  onAddMember: () => void;
  isSubmitting?: boolean;
}

export const AddMemberDialog = ({
  open,
  onOpenChange,
  newMember,
  setNewMember,
  onAddMember,
  isSubmitting = false,
}: AddMemberDialogProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>הוספת חבר חדש</DialogTitle>
          <DialogDescription>
            הזן את פרטי החבר החדש למטה.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="name">שם פרטי</Label>
              <Input
                id="name"
                placeholder="שם פרטי"
                value={newMember.name}
                onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="last_name">שם משפחה</Label>
              <Input
                id="last_name"
                placeholder="שם משפחה"
                value={newMember.last_name}
                onChange={(e) => setNewMember({...newMember, last_name: e.target.value})}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">אימייל</Label>
            <Input
              id="email"
              type="email"
              placeholder="email@example.com"
              value={newMember.email}
              onChange={(e) => setNewMember({...newMember, email: e.target.value})}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">מספר טלפון</Label>
            <Input
              id="phone"
              placeholder="05xxxxxxxx"
              value={newMember.phone}
              onChange={(e) => setNewMember({...newMember, phone: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="age">גיל</Label>
              <Input
                id="age"
                type="number"
                placeholder="גיל"
                value={newMember.age}
                onChange={(e) => setNewMember({...newMember, age: e.target.value})}
              />
            </div>
            <div>
              <Label htmlFor="gender">מגדר</Label>
              <Select
                value={newMember.gender}
                onValueChange={(value: "male" | "female" | "") => 
                  setNewMember({...newMember, gender: value})
                }
              >
                <SelectTrigger id="gender">
                  <SelectValue placeholder="בחר מגדר" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">זכר</SelectItem>
                  <SelectItem value="female">נקבה</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="membershipType">סוג המנוי</Label>
            <Select
              value={newMember.membershipType}
              onValueChange={(value) => setNewMember({...newMember, membershipType: value})}
            >
              <SelectTrigger id="membershipType">
                <SelectValue placeholder="בחר סוג מנוי" />
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
            <Label htmlFor="status">סטטוס</Label>
            <Select
              value={newMember.status}
              onValueChange={(value: Member['status']) => 
                setNewMember({...newMember, status: value})
              }
            >
              <SelectTrigger id="status">
                <SelectValue placeholder="בחר סטטוס" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">פעיל</SelectItem>
                <SelectItem value="inactive">לא פעיל</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="expired">פג תוקף</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="paymentStatus">סטטוס תשלום</Label>
            <Select
              value={newMember.paymentStatus}
              onValueChange={(value: Member['paymentStatus']) => 
                setNewMember({...newMember, paymentStatus: value})
              }
            >
              <SelectTrigger id="paymentStatus">
                <SelectValue placeholder="בחר סטטוס תשלום" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">שולם</SelectItem>
                <SelectItem value="pending">ממתין</SelectItem>
                <SelectItem value="overdue">באיחור</SelectItem>
                <SelectItem value="canceled">בוטל</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button onClick={onAddMember} disabled={isSubmitting}>
            {isSubmitting ? 'מוסיף...' : 'הוסף חבר'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
