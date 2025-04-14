"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { CalendarIcon } from "lucide-react"
import { format } from "date-fns"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import type { TablesInsert } from "@/integrations/supabase/types"

interface CreateMembershipModalProps {
  isOpen: boolean
  onClose: () => void
  profileId: string
  onSuccess: () => void
}

export function CreateMembershipModal({ isOpen, onClose, profileId, onSuccess }: CreateMembershipModalProps) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  // Form state
  const [membershipType, setMembershipType] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)
  const [status, setStatus] = useState("active")
  const [paymentStatus, setPaymentStatus] = useState("paid")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!membershipType) {
      toast({
        title: "שגיאה",
        description: "יש למלא את סוג המנוי",
        variant: "destructive",
      })
      return
    }

    try {
      setLoading(true)

      const newMembership: TablesInsert<"memberships"> = {
        member_id: profileId,
        membership_type: membershipType,
        start_date: startDate.toISOString(),
        end_date: endDate ? endDate.toISOString() : null,
        status,
        payment_status: paymentStatus,
      }

      const { error } = await supabase.from("memberships").insert(newMembership)

      if (error) throw error

      toast({
        title: "המנוי נוצר בהצלחה",
        description: "המנוי החדש נוסף ללקוח",
      })

      onSuccess()
      onClose()
    } catch (error: any) {
      console.error("Error creating membership:", error)
      toast({
        title: "שגיאה ביצירת המנוי",
        description: error.message || "אירעה שגיאה בעת יצירת המנוי",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>יצירת מנוי חדש</DialogTitle>
          <DialogDescription>הוסף מנוי חדש ללקוח</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="membership-type">סוג מנוי</Label>
              <Select value={membershipType} onValueChange={setMembershipType}>
                <SelectTrigger id="membership-type">
                  <SelectValue placeholder="בחר סוג מנוי" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="מנוי שנתי">מנוי שנתי</SelectItem>
                  <SelectItem value="מנוי חודשי">מנוי חודשי</SelectItem>
                  <SelectItem value="מנוי רבעוני">מנוי רבעוני</SelectItem>
                  <SelectItem value="מנוי סטודנט">מנוי סטודנט</SelectItem>
                  <SelectItem value="מנוי VIP">מנוי VIP</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="start-date">תאריך התחלה</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="start-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-right font-normal", !startDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {startDate ? format(startDate, "dd/MM/yyyy") : "בחר תאריך"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="end-date">תאריך סיום</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="end-date"
                    variant={"outline"}
                    className={cn("w-full justify-start text-right font-normal", !endDate && "text-muted-foreground")}
                  >
                    <CalendarIcon className="ml-2 h-4 w-4" />
                    {endDate ? format(endDate, "dd/MM/yyyy") : "בחר תאריך (אופציונלי)"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={setEndDate}
                    initialFocus
                    disabled={(date) => date < startDate}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">סטטוס</Label>
              <Select value={status} onValueChange={setStatus}>
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
              <Label htmlFor="payment-status">סטטוס תשלום</Label>
              <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                <SelectTrigger id="payment-status">
                  <SelectValue placeholder="בחר סטטוס תשלום" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="paid">שולם</SelectItem>
                  <SelectItem value="pending">ממתין לתשלום</SelectItem>
                  <SelectItem value="failed">נכשל</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              ביטול
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "מעבד..." : "שמור"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
