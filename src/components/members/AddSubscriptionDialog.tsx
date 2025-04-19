"use client"

import { useState, useEffect } from "react"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Member } from "@/store/slices/membersSlice"
import { useToast } from "@/hooks/use-toast"
import { CreditCard, Banknote, Building, CheckSquare, Loader2 } from "lucide-react"
import { SubscriptionService, type GroupSubscription, type PaymentDetails } from "@/services/SubscriptionService"

interface AddSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
  onSubscriptionAdded: () => void
}

type Duration = "1" | "2" | "3" | "4" | "6" | "12"
type PaymentMethod = "cash" | "card" | "bank" | "check"

export const AddSubscriptionDialog = ({
  open,
  onOpenChange,
  memberId,
  memberName,
  onSubscriptionAdded,
}: AddSubscriptionDialogProps) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [groupSubscriptions, setGroupSubscriptions] = useState<GroupSubscription[]>([])

  const [subscriptionId, setSubscriptionId] = useState("")
  const [membershipType, setMembershipType] = useState("")
  const [duration, setDuration] = useState<Duration>("1")
  const [status, setStatus] = useState<Member["status"]>("active")
  const [paymentStatus, setPaymentStatus] = useState<Member["paymentStatus"]>("paid")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [amount, setAmount] = useState<number>(0)

  // Payment method specific details
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardHolderName, setCardHolderName] = useState("")

  const [checkNumber, setCheckNumber] = useState("")
  const [checkDate, setCheckDate] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankBranch, setBankBranch] = useState("")

  const [transferReference, setTransferReference] = useState("")

  // Fetch group subscriptions when dialog opens
  useEffect(() => {
    if (open) {
      fetchGroupSubscriptions()
    }
  }, [open])

  const fetchGroupSubscriptions = async () => {
    try {
      setIsLoading(true)
      const data = await SubscriptionService.fetchGroupSubscriptions()
      setGroupSubscriptions(data)

      // Set default values if we have subscriptions
      if (data.length > 0) {
        setSubscriptionId(data[0].id)
        setMembershipType(data[0].name)
        setAmount(data[0].price_per_month)
      }
    } catch (error) {
      console.error("Error fetching group subscriptions:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בטעינת סוגי המנויים",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Update amount when subscription or duration changes
  useEffect(() => {
    if (subscriptionId && duration) {
      const selectedSubscription = groupSubscriptions.find((sub) => sub.id === subscriptionId)
      if (selectedSubscription) {
        const price = SubscriptionService.getSubscriptionPrice(selectedSubscription, Number.parseInt(duration))
        setAmount(price)
      }
    }
  }, [subscriptionId, duration, groupSubscriptions])

  // Update membership type when subscription changes
  useEffect(() => {
    if (subscriptionId) {
      const selectedSubscription = groupSubscriptions.find((sub) => sub.id === subscriptionId)
      if (selectedSubscription) {
        setMembershipType(selectedSubscription.name)
      }
    }
  }, [subscriptionId, groupSubscriptions])

  // Calculate end date
  const getEndDate = () => {
    const today = new Date()
    const endDate = new Date(today)
    endDate.setMonth(today.getMonth() + Number.parseInt(duration))
    return endDate.toLocaleDateString("he-IL")
  }

  const handleSubmit = async () => {
    if (!memberId || !subscriptionId) {
      toast({
        title: "שגיאה",
        description: "נא למלא את כל השדות הנדרשים",
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Prepare payment details based on method
      const paymentDetails: PaymentDetails = {
        paymentMethod,
        amount,
      }

      switch (paymentMethod) {
        case "card":
          paymentDetails.cardDetails = {
            cardNumber: cardNumber.slice(-4), // Only store last 4 for security
            cardExpiry,
            cardHolderName,
          }
          break
        case "check":
          paymentDetails.checkDetails = {
            checkNumber,
            checkDate,
            bankName,
          }
          break
        case "bank":
          paymentDetails.bankDetails = {
            accountNumber: bankAccountNumber,
            bankName,
            branch: bankBranch,
            reference: transferReference,
          }
          break
        // Cash doesn't need extra details
      }

      await SubscriptionService.addSubscription(memberId, {
        membershipType,
        subscriptionId,
        status,
        paymentStatus,
        durationMonths: Number.parseInt(duration),
        paymentDetails,
      })

      toast({
        title: "הוסף בהצלחה",
        description: `מנוי חדש נוסף ל${memberName} עד לתאריך ${getEndDate()}`,
      })

      onSubscriptionAdded()
      onOpenChange(false)
    } catch (error) {
      console.error("Error adding subscription:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת הוספת המנוי. נסה שנית.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate price per month
  const getPricePerMonth = () => {
    if (amount && duration) {
      return Math.round(amount / Number.parseInt(duration))
    }
    return 0
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>הוספת מנוי ל{memberName}</DialogTitle>
          <DialogDescription>בחר את סוג המנוי ואת משך הזמן שלו</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="subscriptionType">סוג המנוי</Label>
              <Select value={subscriptionId} onValueChange={setSubscriptionId}>
                <SelectTrigger id="subscriptionType">
                  <SelectValue placeholder="בחר סוג מנוי" />
                </SelectTrigger>
                <SelectContent>
                  {groupSubscriptions.map((subscription) => (
                    <SelectItem key={subscription.id} value={subscription.id}>
                      {subscription.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="duration">משך המנוי</Label>
              <Select value={duration} onValueChange={(value) => setDuration(value as Duration)}>
                <SelectTrigger id="duration">
                  <SelectValue placeholder="בחר תקופה" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">חודש (₪{getPricePerMonth()} לחודש)</SelectItem>
                  <SelectItem value="2">חודשיים (₪{getPricePerMonth()} לחודש)</SelectItem>
                  <SelectItem value="3">שלושה חודשים (₪{getPricePerMonth()} לחודש)</SelectItem>
                  <SelectItem value="4">ארבעה חודשים (₪{getPricePerMonth()} לחודש)</SelectItem>
                  <SelectItem value="6">חצי שנה (₪{getPricePerMonth()} לחודש)</SelectItem>
                  <SelectItem value="12">שנה (₪{getPricePerMonth()} לחודש)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>תאריך התחלה</Label>
                <Input type="text" value={new Date().toLocaleDateString("he-IL")} disabled />
              </div>
              <div>
                <Label>תאריך סיום</Label>
                <Input type="text" value={getEndDate()} disabled />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="status">סטטוס המנוי</Label>
              <Select value={status} onValueChange={(value) => setStatus(value as Member["status"])}>
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
                value={paymentStatus}
                onValueChange={(value) => setPaymentStatus(value as Member["paymentStatus"])}
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

            <div className="grid gap-2">
              <Label htmlFor="amount">סכום לתשלום</Label>
              <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
            </div>

            <div className="border p-3 rounded-md">
              <Label className="mb-2 block font-medium">אמצעי תשלום</Label>

              <Tabs
                defaultValue="cash"
                value={paymentMethod}
                onValueChange={(value) => setPaymentMethod(value as PaymentMethod)}
              >
                <TabsList className="grid grid-cols-4 mb-4">
                  <TabsTrigger value="cash" className="flex flex-col items-center gap-1 pt-2">
                    <Banknote className="h-4 w-4" />
                    <span>מזומן</span>
                  </TabsTrigger>
                  <TabsTrigger value="card" className="flex flex-col items-center gap-1 pt-2">
                    <CreditCard className="h-4 w-4" />
                    <span>כרטיס אשראי</span>
                  </TabsTrigger>
                  <TabsTrigger value="bank" className="flex flex-col items-center gap-1 pt-2">
                    <Building className="h-4 w-4" />
                    <span>העברה בנקאית</span>
                  </TabsTrigger>
                  <TabsTrigger value="check" className="flex flex-col items-center gap-1 pt-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>המחאה</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cash">
                  <div className="text-gray-500 text-sm">תשלום במזומן יתקבל ישירות בקופת המועדון.</div>
                </TabsContent>

                <TabsContent value="card">
                  <div className="grid gap-2">
                    <Label htmlFor="cardNumber">מספר כרטיס</Label>
                    <Input
                      id="cardNumber"
                      placeholder="**** **** **** ****"
                      maxLength={16}
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    <div>
                      <Label htmlFor="cardExpiry">תוקף (MM/YY)</Label>
                      <Input
                        id="cardExpiry"
                        placeholder="MM/YY"
                        maxLength={5}
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="cardCvv">CVV</Label>
                      <Input
                        id="cardCvv"
                        placeholder="123"
                        maxLength={3}
                        value={cardCvv}
                        onChange={(e) => setCardCvv(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="cardHolderName">שם בעל הכרטיס</Label>
                    <Input
                      id="cardHolderName"
                      placeholder="Israel Israeli"
                      value={cardHolderName}
                      onChange={(e) => setCardHolderName(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="bank">
                  <div className="grid gap-2">
                    <Label htmlFor="bankName">שם הבנק</Label>
                    <Input
                      id="bankName"
                      placeholder="לאומי / פועלים / מזרחי וכו'"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="bankBranch">מספר סניף</Label>
                    <Input
                      id="bankBranch"
                      placeholder="123"
                      value={bankBranch}
                      onChange={(e) => setBankBranch(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="bankAccountNumber">מספר חשבון</Label>
                    <Input
                      id="bankAccountNumber"
                      placeholder="123456789"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="transferReference">אסמכתא</Label>
                    <Input
                      id="transferReference"
                      placeholder="מספר אסמכתא להעברה"
                      value={transferReference}
                      onChange={(e) => setTransferReference(e.target.value)}
                    />
                  </div>
                </TabsContent>

                <TabsContent value="check">
                  <div className="grid gap-2">
                    <Label htmlFor="checkNumber">מספר המחאה</Label>
                    <Input
                      id="checkNumber"
                      placeholder="12345"
                      value={checkNumber}
                      onChange={(e) => setCheckNumber(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="checkDate">תאריך המחאה</Label>
                    <Input
                      id="checkDate"
                      type="date"
                      value={checkDate}
                      onChange={(e) => setCheckDate(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2 mt-2">
                    <Label htmlFor="checkBankName">שם הבנק</Label>
                    <Input
                      id="checkBankName"
                      placeholder="לאומי / פועלים / מזרחי וכו'"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
            ביטול
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
            {isSubmitting ? "מוסיף..." : "הוסף מנוי"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
