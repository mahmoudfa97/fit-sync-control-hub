"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { MemberFormData } from "@/services/MemberService"
import { t } from "@/utils/translations/index"

interface AddMemberDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  newMember: MemberFormData
  setNewMember: React.Dispatch<React.SetStateAction<MemberFormData>>
  onAddMember: () => void
  isSubmitting?: boolean
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
  const today = new Date()
  const insuranceEndDate = new Date(today)
  insuranceEndDate.setFullYear(insuranceEndDate.getFullYear() + 1)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>הוספת חבר חדש</DialogTitle>
          <DialogDescription>הזן את פרטי החבר החדש למטה.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="name">שם פרטי</Label>
              <Input
                id="name"
                placeholder="שם פרטי"
                value={newMember.name}
                onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="last_name">שם משפחה</Label>
              <Input
                id="last_name"
                placeholder="שם משפחה"
                value={newMember.last_name}
                onChange={(e) => setNewMember({ ...newMember, last_name: e.target.value })}
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
              onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="phone">מספר טלפון</Label>
            <Input
              id="phone"
              placeholder="05xxxxxxxx"
              value={newMember.phone}
              onChange={(e) => setNewMember({ ...newMember, phone: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="dateOfBirth">{t(`dateofbirth`)}</Label>
              <div className="grid grid-cols-3 gap-2">
                {/* Year Select */}
                <Select
                  value={newMember.birthYear || ""}
                  onValueChange={(year) => {
                    const updatedMember = { ...newMember, birthYear: year }
                    // Update the full date if all components are selected
                    if (year && updatedMember.birthMonth && updatedMember.birthDay) {
                      updatedMember.dateOfBirth = `${year}-${updatedMember.birthMonth.padStart(2, "0")}-${updatedMember.birthDay.padStart(2, "0")}`
                    }
                    setNewMember(updatedMember)
                  }}
                >
                  <SelectTrigger id="birthYear">
                    <SelectValue placeholder="שנה" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 100 }, (_, i) => {
                      const year = (new Date().getFullYear() - 100 + i).toString()
                      return (
                        <SelectItem key={year} value={year}>
                          {year}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Month Select */}
                <Select
                  value={newMember.birthMonth || ""}
                  onValueChange={(month) => {
                    const updatedMember = { ...newMember, birthMonth: month }
                    // Update the full date if all components are selected
                    if (updatedMember.birthYear && month && updatedMember.birthDay) {
                      updatedMember.dateOfBirth = `${updatedMember.birthYear}-${month.padStart(2, "0")}-${updatedMember.birthDay.padStart(2, "0")}`
                    }
                    setNewMember(updatedMember)
                  }}
                >
                  <SelectTrigger id="birthMonth">
                    <SelectValue placeholder="חודש" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 12 }, (_, i) => {
                      const month = (i + 1).toString().padStart(2, "0")
                      const monthNames = [
                        "ינואר",
                        "פברואר",
                        "מרץ",
                        "אפריל",
                        "מאי",
                        "יוני",
                        "יולי",
                        "אוגוסט",
                        "ספטמבר",
                        "אוקטובר",
                        "נובמבר",
                        "דצמבר",
                      ]
                      return (
                        <SelectItem key={month} value={month}>
                          {monthNames[i]}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>

                {/* Day Select */}
                <Select
                  value={newMember.birthDay || ""}
                  onValueChange={(day) => {
                    const updatedMember = { ...newMember, birthDay: day }
                    // Update the full date if all components are selected
                    if (updatedMember.birthYear && updatedMember.birthMonth && day) {
                      updatedMember.dateOfBirth = `${updatedMember.birthYear}-${updatedMember.birthMonth.padStart(2, "0")}-${day.padStart(2, "0")}`
                    }
                    setNewMember(updatedMember)
                  }}
                >
                  <SelectTrigger id="birthDay">
                    <SelectValue placeholder="יום" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {Array.from({ length: 31 }, (_, i) => {
                      const day = (i + 1).toString().padStart(2, "0")
                      return (
                        <SelectItem key={day} value={day}>
                          {day}
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="gender">מגדר</Label>
              <Select
                value={newMember.gender}
                onValueChange={(value: "male" | "female" | "") => setNewMember({ ...newMember, gender: value })}
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

          {/* Insurance Section */}
          <div className="border p-3 rounded-md mt-2">
            <div className="flex items-center justify-between mb-2">
              <Label htmlFor="hasInsurance" className="font-medium">
                ביטוח
              </Label>
              <Switch
                id="hasInsurance"
                checked={newMember.hasInsurance}
                onCheckedChange={(checked) => setNewMember({ ...newMember, hasInsurance: checked })}
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
                      value={newMember.insuranceStartDate || today.toISOString().split("T")[0]}
                      onChange={(e) => setNewMember({ ...newMember, insuranceStartDate: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="insuranceEndDate">תאריך סיום</Label>
                    <Input
                      id="insuranceEndDate"
                      type="date"
                      value={newMember.insuranceEndDate || insuranceEndDate.toISOString().split("T")[0]}
                      onChange={(e) => setNewMember({ ...newMember, insuranceEndDate: e.target.value })}
                    />
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Welcome Message Section */}
          <div className="border p-3 rounded-md mt-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="sendWelcomeMessage" className="font-medium">
                שלח הודעת ברוכים הבאים
              </Label>
              <Switch
                id="sendWelcomeMessage"
                checked={newMember.sendWelcomeMessage || false}
                onCheckedChange={(checked) => setNewMember({ ...newMember, sendWelcomeMessage: checked })}
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button onClick={onAddMember} disabled={isSubmitting}>
            {isSubmitting ? "מוסיף..." : "הוסף חבר"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
