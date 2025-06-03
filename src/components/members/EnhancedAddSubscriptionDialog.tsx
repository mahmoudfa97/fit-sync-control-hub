"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { toast } from "sonner"
import { format, addMonths, addDays } from "date-fns"
import { he } from "date-fns/locale"
import { 
  Calendar as CalendarIcon, 
  CreditCard, 
  FileText, 
  PlusCircle, 
  CheckCircle,
  AlertTriangle,
  Mail,
  Phone
} from "lucide-react"
import { SubscriptionService, type GroupSubscription, type PaymentDetails } from "@/services/SubscriptionService"
import { WhatsAppTemplateForm } from "@/components/notifacations/sms/whatsapp-template-form"

interface EnhancedAddSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
  memberEmail?: string
  memberPhone?: string
  onSubscriptionAdded: () => void
}

const membershipTypes = [
  { value: "monthly", label: "חודשי", duration: 1, price: 150 },
  { value: "quarterly", label: "רבעוני", duration: 3, price: 400 },
  { value: "semi-annual", label: "חצי שנתי", duration: 6, price: 750 },
  { value: "annual", label: "שנתי", duration: 12, price: 1400 },
]

const paymentMethods = [
  { value: "cash", label: "מזומן", icon: "💵" },
  { value: "credit_card", label: "כרטיס אשראי", icon: "💳" },
  { value: "bank_transfer", label: "העברה בנקאית", icon: "🏦" },
  { value: "check", label: "המחאה", icon: "📝" },
  { value: "hyp", label: "HYP Payment", icon: "🔒" },
]

export default function EnhancedAddSubscriptionDialog({
  open,
  onOpenChange,
  memberId,
  memberName,
  memberEmail,
  memberPhone,
  onSubscriptionAdded
}: EnhancedAddSubscriptionDialogProps) {
  const [membershipType, setMembershipType] = useState("")
  const [customDuration, setCustomDuration] = useState("")
  const [startDate, setStartDate] = useState<Date>(new Date())
  const [endDate, setEndDate] = useState<Date>(addMonths(new Date(), 1))
  const [paymentMethod, setPaymentMethod] = useState("")
  const [amount, setAmount] = useState("")
  const [discount, setDiscount] = useState("")
  const [finalAmount, setFinalAmount] = useState("")
  const [notes, setNotes] = useState("")
  const [sendNotification, setSendNotification] = useState(true)
  const [sendReceipt, setSendReceipt] = useState(false)
  const [groupSubscriptions, setGroupSubscriptions] = useState<GroupSubscription[]>([])
  const [selectedGroupSubscription, setSelectedGroupSubscription] = useState("")
  const [loading, setLoading] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Payment method specific states
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardHolderName: ""
  })
  const [checkDetails, setCheckDetails] = useState({
    checkNumber: "",
    bankName: "",
    accountNumber: ""
  })
  const [bankDetails, setBankDetails] = useState({
    accountNumber: "",
    bankName: "",
    branchNumber: ""
  })
  const [hypDetails, setHypDetails] = useState({
    paymentMethod: "credit_card",
    redirectUrl: window.location.origin + "/payments/success"
  })

  // Installments
  const [installments, setInstallments] = useState(1)
  const [installmentAmount, setInstallmentAmount] = useState("")

  // Receipt details
  const [receiptEmail, setReceiptEmail] = useState(memberEmail || "")

  useEffect(() => {
    if (open) {
      fetchGroupSubscriptions()
    }
  }, [open])

  useEffect(() => {
    if (membershipType) {
      const selected = membershipTypes.find(t => t.value === membershipType)
      if (selected) {
        setAmount(selected.price.toString())
        setEndDate(addMonths(startDate, selected.duration))
      }
    } else if (customDuration) {
      const months = parseInt(customDuration)
      if (!isNaN(months)) {
        setEndDate(addMonths(startDate, months))
      }
    }
  }, [membershipType, customDuration, startDate])

  useEffect(() => {
    const baseAmount = parseFloat(amount) || 0
    const discountAmount = parseFloat(discount) || 0
    const final = Math.max(0, baseAmount - discountAmount)
    setFinalAmount(final.toString())
    
    if (installments > 1) {
      setInstallmentAmount((final / installments).toFixed(2))
    } else {
      setInstallmentAmount(final.toString())
    }
  }, [amount, discount, installments])

  const fetchGroupSubscriptions = async () => {
    try {
      setLoading(true)
      const subscriptions = await SubscriptionService.fetchGroupSubscriptions()
      setGroupSubscriptions(subscriptions)
    } catch (error) {
      console.error("Error fetching group subscriptions:", error)
      toast.error("שגיאה בטעינת מנויי קבוצה")
    } finally {
      setLoading(false)
    }
  }

  const calculateEndDate = (start: Date, type: string, customMonths?: number) => {
    if (type === "custom" && customMonths) {
      return addMonths(start, customMonths)
    }
    
    const membershipType = membershipTypes.find(t => t.value === type)
    if (membershipType) {
      return addMonths(start, membershipType.duration)
    }
    
    return addMonths(start, 1)
  }

  const handleSubmit = async () => {
    if (!membershipType && !selectedGroupSubscription) {
      toast.error("אנא בחר סוג מנוי")
      return
    }

    if (!paymentMethod) {
      toast.error("אנא בחר אמצעי תשלום")
      return
    }

    if (!finalAmount || parseFloat(finalAmount) <= 0) {
      toast.error("אנא הזן סכום תקין")
      return
    }

    setIsSubmitting(true)

    try {
      const subscriptionData = {
        membershipType: membershipType || selectedGroupSubscription,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        totalAmount: parseFloat(finalAmount),
        discount: parseFloat(discount) || 0,
        notes,
      }

      const paymentDetails: PaymentDetails = {
        payment_method: paymentMethod,
        ...(paymentMethod === "credit_card" && { cardDetails }),
        ...(paymentMethod === "check" && { checkDetails }),
        ...(paymentMethod === "bank_transfer" && { bankDetails }),
        ...(paymentMethod === "hyp" && { hypDetails }),
        installments,
        installmentAmount: parseFloat(installmentAmount),
        sendReceipt,
        receiptEmail,
      }

      await SubscriptionService.addSubscription(memberId, subscriptionData, paymentDetails)

      toast.success("המנוי נוסף בהצלחה!")
      onSubscriptionAdded()
      onOpenChange(false)
      
      // Reset form
      resetForm()
    } catch (error) {
      console.error("Error adding subscription:", error)
      toast.error("שגיאה בהוספת המנוי")
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setMembershipType("")
    setCustomDuration("")
    setStartDate(new Date())
    setEndDate(addMonths(new Date(), 1))
    setPaymentMethod("")
    setAmount("")
    setDiscount("")
    setFinalAmount("")
    setNotes("")
    setSendNotification(true)
    setSendReceipt(false)
    setSelectedGroupSubscription("")
    setCardDetails({ cardNumber: "", expiryDate: "", cvv: "", cardHolderName: "" })
    setCheckDetails({ checkNumber: "", bankName: "", accountNumber: "" })
    setBankDetails({ accountNumber: "", bankName: "", branchNumber: "" })
    setHypDetails({ paymentMethod: "credit_card", redirectUrl: window.location.origin + "/payments/success" })
    setInstallments(1)
    setInstallmentAmount("")
    setReceiptEmail(memberEmail || "")
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">הוספת מנוי חדש</DialogTitle>
          <DialogDescription>
            הוסף מנוי חדש עבור {memberName}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="subscription" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="subscription">פרטי מנוי</TabsTrigger>
            <TabsTrigger value="payment">תשלום</TabsTrigger>
            <TabsTrigger value="notifications">התראות</TabsTrigger>
            <TabsTrigger value="summary">סיכום</TabsTrigger>
          </TabsList>

          <TabsContent value="subscription" className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <Label>סוג מנוי</Label>
                <Select value={membershipType} onValueChange={setMembershipType}>
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג מנוי" />
                  </SelectTrigger>
                  <SelectContent>
                    {membershipTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label} - ₪{type.price}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>תאריך התחלה</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(startDate, "PPP", { locale: he })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div>
                  <Label>תאריך סיום</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(endDate, "PPP", { locale: he })}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label>סכום בסיס</Label>
                  <Input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>הנחה</Label>
                  <Input
                    type="number"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>סכום סופי</Label>
                  <Input
                    type="number"
                    value={finalAmount}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div>
                <Label>הערות</Label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="הערות נוספות..."
                  rows={3}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="payment" className="space-y-6">
            
            <div className="space-y-4">
              <div>
                <Label>אמצעי תשלום</Label>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  {paymentMethods.map((method) => (
                    <div key={method.value} className="flex items-center space-x-2">
                      <RadioGroupItem value={method.value} id={method.value} />
                      <Label htmlFor={method.value} className="flex items-center gap-2">
                        <span>{method.icon}</span>
                        {method.label}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>

              {/* Payment method specific fields */}
              {paymentMethod === "credit_card" && (
                <Card>
                  <CardHeader>
                    <CardTitle>פרטי כרטיס אשראי</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>מספר כרטיס</Label>
                      <Input
                        value={cardDetails.cardNumber}
                        onChange={(e) => setCardDetails({...cardDetails, cardNumber: e.target.value})}
                        placeholder="1234 5678 9012 3456"
                      />
                    </div>
                    <div>
                      <Label>תוקף</Label>
                      <Input
                        value={cardDetails.expiryDate}
                        onChange={(e) => setCardDetails({...cardDetails, expiryDate: e.target.value})}
                        placeholder="MM/YY"
                      />
                    </div>
                    <div>
                      <Label>CVV</Label>
                      <Input
                        value={cardDetails.cvv}
                        onChange={(e) => setCardDetails({...cardDetails, cvv: e.target.value})}
                        placeholder="123"
                      />
                    </div>
                    <div>
                      <Label>שם בעל הכרטיס</Label>
                      <Input
                        value={cardDetails.cardHolderName}
                        onChange={(e) => setCardDetails({...cardDetails, cardHolderName: e.target.value})}
                        placeholder="שם מלא"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>מספר תשלומים</Label>
                  <Select value={installments.toString()} onValueChange={(value) => setInstallments(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 10, 12].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? "תשלום" : "תשלומים"}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>סכום לתשלום</Label>
                  <Input
                    value={installmentAmount}
                    readOnly
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="sendReceipt"
                  checked={sendReceipt}
                  onCheckedChange={setSendReceipt}
                />
                <Label htmlFor="sendReceipt">שלח קבלה במייל</Label>
              </div>

              {sendReceipt && (
                <div>
                  <Label>כתובת מייל לקבלה</Label>
                  <Input
                    type="email"
                    value={receiptEmail}
                    onChange={(e) => setReceiptEmail(e.target.value)}
                    placeholder="email@example.com"
                  />
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="sendNotification"
                  checked={sendNotification}
                  onCheckedChange={setSendNotification}
                />
                <Label htmlFor="sendNotification">שלח התראת WhatsApp</Label>
              </div>

              {sendNotification && memberPhone && (
                <Card>
                  <CardHeader>
                    <CardTitle>שליחת הודעת WhatsApp</CardTitle>
                    <CardDescription>שלח הודעה ל{memberName}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <WhatsAppTemplateForm
                      recipientPhone={memberPhone}
                      onSent={(result) => {
                        if (result.success) {
                          toast.success("הודעת WhatsApp נשלחה בהצלחה!")
                        } else {
                          toast.error("שגיאה בשליחת הודעת WhatsApp")
                        }
                      }}
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="summary" className="space-y-6">
            
            <Card>
              <CardHeader>
                <CardTitle>סיכום המנוי</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-muted-foreground">חבר</Label>
                    <p className="font-medium">{memberName}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">סוג מנוי</Label>
                    <p className="font-medium">{membershipTypes.find(t => t.value === membershipType)?.label || selectedGroupSubscription}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">תקופה</Label>
                    <p className="font-medium">
                      {format(startDate, "dd/MM/yyyy")} - {format(endDate, "dd/MM/yyyy")}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">סכום סופי</Label>
                    <p className="font-medium text-lg">₪{finalAmount}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">אמצעי תשלום</Label>
                    <p className="font-medium">{paymentMethods.find(m => m.value === paymentMethod)?.label}</p>
                  </div>
                  <div>
                    <Label className="text-sm text-muted-foreground">תשלומים</Label>
                    <p className="font-medium">{installments} × ₪{installmentAmount}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                ביטול
              </Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? "מוסיף..." : "הוסף מנוי"}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
