
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
import { Switch } from "@/components/ui/switch";
import { membershipTypes } from "./MembershipTypes";
import { type Member } from "@/store/slices/membersSlice";
import { MemberFormData } from "@/services/MemberService";
import { t } from "@/utils/translations";
import { DatePicker } from "../ui/date-picker";

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
  // Calculate insurance end date as today + 1 year
  const today = new Date();
  const insuranceEndDate = new Date(today);
  insuranceEndDate.setFullYear(insuranceEndDate.getFullYear() + 1);
  const formattedEndDate = insuranceEndDate.toISOString().split('T')[0];
  
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
              <Label htmlFor="dateOfBirth">{t(`dateofbirth`)}</Label>
              <DatePicker date={undefined} onSelect={(e) => setNewMember({...newMember, dateOfBirth: e.target.value})} />
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
            <Label htmlFor="status">סטטוס</Label>
            <Input
              disabled
              id="status"
              value={t(`active`)} // Assuming you have a translation function
            />
    <Label htmlFor="paymentStatus"> סטטוס תשלום</Label>
              <Input
                id="paymentStatus"
                disabled
                value={t(`pending`)} // Assuming you have a translation function>
                />
          </div>
          
          {/* Insurance Section */}
          <div className="border p-3 rounded-md mt-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="hasInsurance" className="font-medium">ביטוח</Label>
              <Switch 
                id="hasInsurance" 
                checked={newMember.hasInsurance}
                onCheckedChange={(checked) => 
                  setNewMember({...newMember, hasInsurance: checked})
                }
              />
            </div>
            
            {newMember.hasInsurance && (
              <>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <div>
                    <Label htmlFor="insuranceStartDate">תאריך התחלה</Label>
                    <Input
                      id="insuranceStartDate"
                      type="date"
                      value={today.toISOString().split('T')[0]}
                      disabled
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceEndDate">תאריך סיום</Label>
                    <Input
                      id="insuranceEndDate"
                      type="date"
                      value={formattedEndDate}
                      disabled
                    />
                  </div>
                </div>

              </>
            )}
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
