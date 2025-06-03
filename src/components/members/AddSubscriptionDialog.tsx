"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { format } from "date-fns"
import { he } from "date-fns/locale"
import { useToast } from "@/hooks/use-toast"
import {
  Loader2,
  CreditCard,
  Banknote,
  Building,
  CheckSquare,
  ArrowLeft,
  ArrowRight,
  ShieldCheck,
  CreditCardIcon,
} from "lucide-react"
import { SubscriptionService, type GroupSubscription, type PaymentDetails } from "@/services/SubscriptionService"
import EnhancedHypPaymentModal from "@/components/payments/EnhancedHypPaymentModal"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { useOrganization } from "@/contexts/OrganizationContext"

interface AddSubscriptionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  memberId: string
  memberName: string
  memberEmail?: string
  memberPhone?: string
  onSubscriptionAdded: () => void
}

type Duration = "1" | "2" | "3" | "4" | "6" | "12"
type PaymentMethod = "cash" | "card" | "bank" | "check" | "hyp"
type DocumentType =
  | "none"
  | "unofficial_transaction"
  | "unofficial"
  | "receipt"
  | "credit_invoice"
  | "tax_invoice"
  | "tax_invoice_receipt"

export const AddSubscriptionDialog = ({
  open,
  onOpenChange,
  memberId,
  memberName,
  memberEmail = "",
  memberPhone = "",
  onSubscriptionAdded,
}: AddSubscriptionDialogProps) => {
  const { toast } = useToast()
  const { currentOrganization } = useOrganization()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [groupSubscriptions, setGroupSubscriptions] = useState<GroupSubscription[]>([])

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps = 2] = useState(2)

  // Subscription details
  const [subscriptionId, setSubscriptionId] = useState("")
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState("")
  const [duration, setDuration] = useState<Duration>("1")
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [documentType, setDocumentType] = useState<DocumentType>("tax_invoice_receipt")

  // Payment details
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [sendReceipt, setSendReceipt] = useState(true)
  const [installments, setInstallments] = useState(1)
  const [showInstallments, setShowInstallments] = useState(false)

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

  // HYP payment modal state
  const [hypModalOpen, setHypModalOpen] = useState(false)
  const [hypPaymentId, setHypPaymentId] = useState<string | null>(null)

  // Fetch group subscriptions when dialog opens
  useEffect(() => {
    if (open && currentOrganization) {
      fetchGroupSubscriptions()
      setCurrentStep(1)
    }
  }, [open, currentOrganization])

  const fetchGroupSubscriptions = async () => {
    if (!currentOrganization) return;
    
    try {
      setIsLoading(true)
      const data = await SubscriptionService.fetchGroupSubscriptions(currentOrganization.id)
      setGroupSubscriptions(data)

      // Set default values if we have subscriptions
      if (data.length > 0) {
        setSubscriptionId(data[0].id)
        setUnitPrice(data[0].price_per_month)
        updateTotalAmount(data[0].price_per_month, quantity, duration)
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

  // Update end date when start date or duration changes
  useEffect(() => {
    if (startDate && duration) {
      const start = new Date(startDate)
      const end = new Date(start)
      end.setMonth(start.getMonth() + Number.parseInt(duration))
      setEndDate(format(end, "yyyy-MM-dd"))
    }
  }, [startDate, duration])

  // Update unit price when subscription changes
  useEffect(() => {
    if (subscriptionId) {
      const selectedSubscription = groupSubscriptions.find((sub) => sub.id === subscriptionId)
      if (selectedSubscription) {
        setUnitPrice(selectedSubscription.price_per_month)
        updateTotalAmount(selectedSubscription.price_per_month, quantity, duration)
      }
    }
  }, [subscriptionId, groupSubscriptions])

  // Update total amount when unit price, quantity, or duration changes
  useEffect(() => {
    updateTotalAmount(unitPrice, quantity, duration)
  }, [unitPrice, quantity, duration])

  // Control installments visibility based on payment method
  useEffect(() => {
    setShowInstallments(paymentMethod === "card" || paymentMethod === "hyp")
    if (!showInstallments) {
      setInstallments(1)
    }
  }, [paymentMethod])

  const updateTotalAmount = (price: number, qty: number, dur: string) => {
    const durationMonths = Number.parseInt(dur)
    setTotalAmount(price * qty * durationMonths)
  }

  const handleNextStep = () => {
    if (currentStep < totalSteps && documentType !== "none") {
      setCurrentStep(currentStep + 1)
    } else if (documentType === "none") {
      // If no document is needed, process payment directly
      handleSubmit()
    }
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
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

    // If payment method is HYP and we're on step 2 or no document is needed, open the HYP payment modal
    if (paymentMethod === "hyp" && (currentStep === 2 || documentType === "none")) {
      setHypModalOpen(true)
      return
    }

    setIsSubmitting(true)

    try {
      // Get subscription name
      const selectedSubscription = groupSubscriptions.find((sub) => sub.id === subscriptionId)
      const membershipType = selectedSubscription?.name || ""

      // Prepare payment details based on method
      const paymentDetails: PaymentDetails = {
        payment_method: paymentMethod,
        amount: totalAmount,
        duration: Number.parseInt(duration),
        subscription_type: membershipType,
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
        case "hyp":
          paymentDetails.hypDetails = {
            paymentId: hypPaymentId || "",
          }
          break
        // Cash doesn't need extra details
      }

      // Add installment details if applicable
      if (showInstallments && installments > 1) {
        paymentDetails.installments = installments
        paymentDetails.installmentAmount = Math.ceil(totalAmount / installments)
      }

      // Add receipt preferences
      paymentDetails.sendReceipt = sendReceipt
      paymentDetails.receiptEmail = memberEmail

      await SubscriptionService.addSubscription(memberId, {
        membershipType,
        subscriptionId,
        status: "active", // Default to active
        paymentStatus: "paid", // Default to paid
        durationMonths: Number.parseInt(duration),
        startDate: startDate,
        endDate: endDate,
        quantity: quantity,
        unitPrice: unitPrice,
        totalAmount: totalAmount,
        notes: notes,
        documentType: documentType,
        paymentDetails,
      })

      toast({
        title: "הוסף בהצלחה",
        description: `מנוי חדש נוסף ל${memberName} עד לתאריך ${format(new Date(endDate), "dd/MM/yyyy")}`,
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

  // Handle successful HYP payment
  const handleHypPaymentSuccess = async (paymentId: string) => {
    setHypPaymentId(paymentId)

    // Close the HYP modal and submit the subscription
    setHypModalOpen(false)

    // Small delay to ensure the modal is closed before submitting
    setTimeout(() => {
      handleSubmit()
    }, 500)
  }

  // Handle canceled HYP payment
  const handleHypPaymentCancel = () => {
    setHypModalOpen(false)
  }

  // Calculate installment price
  const getInstallmentPrice = () => {
    if (totalAmount && installments > 1) {
      return Math.ceil(totalAmount / installments)
    }
    return totalAmount
  }

  // Get installment options
  const getInstallmentOptions = () => {
    const durationMonths = Number.parseInt(duration)
    const maxInstallments = Math.min(durationMonths * 2, 12)
    const options = []

    for (let i = 1; i <= maxInstallments; i++) {
      options.push(i)
    }

    return options
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: he })
    } catch (e) {
      return dateString
    }
  }

  // Get document type display name
  const getDocumentTypeDisplayName = (type: DocumentType): string => {
    const documentTypes = {
      none: "ללא מסמכים",
      unofficial_transaction: "עסקה לא רשמית",
      unofficial: "לא רשמי",
      receipt: "קבלה",
      credit_invoice: "חשבונית זיכוי",
      tax_invoice: "חשבונית מס",
      tax_invoice_receipt: "חשבונית מס קבלה",
    }
    return documentTypes[type]
  }

  // Get step 2 title based on document type
  const getStep2Title = (): string => {
    switch (documentType) {
      case "receipt":
        return "קבלה"
      case "tax_invoice":
        return "חשבונית מס"
      case "tax_invoice_receipt":
        return "חשבונית מס קבלה"
      case "credit_invoice":
        return "חשבונית זיכוי"
      case "unofficial_transaction":
        return "עסקה לא רשמית"
      case "unofficial":
        return "מסמך לא רשמי"
      default:
        return "תשלום"
    }
  }

  // Render step indicator
  const renderStepIndicator = () => {
    // If no document is needed, don't show step indicator
    if (documentType === "none") {
      return null
    }

    return (
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary",
            )}
          >
            1
          </div>
          <div className="mx-2 h-1 w-16 bg-gray-200">
            <div className={cn("h-full bg-primary", currentStep > 1 ? "w-full" : "w-0")} />
          </div>
          <div
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium",
              currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-primary/20 text-primary",
            )}
          >
            2
          </div>
        </div>
        <div className="text-sm font-medium">{currentStep === 1 ? "פרטי המנוי" : getStep2Title()}</div>
      </div>
    )
  }

  // Render step 1: Subscription details
  const renderStep1 = () => {
    return (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="subscriptionType" className="text-red-500 after:content-['*'] after:mr-1">
            קבוצה
          </Label>
          <Select value={subscriptionId} onValueChange={setSubscriptionId}>
            <SelectTrigger id="subscriptionType" className="text-right">
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

        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-red-500 after:content-['*'] after:mr-1">
              מתאריך
            </Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="duration" className="text-red-500 after:content-['*'] after:mr-1">
              תקופה
            </Label>
            <Select value={duration} onValueChange={(value) => setDuration(value as Duration)}>
              <SelectTrigger id="duration" className="text-right">
                <SelectValue placeholder="בחר תקופה" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">חודש אחד</SelectItem>
                <SelectItem value="2">חודשיים</SelectItem>
                <SelectItem value="3">שלושה חודשים</SelectItem>
                <SelectItem value="4">ארבעה חודשים</SelectItem>
                <SelectItem value="6">חצי שנה</SelectItem>
                <SelectItem value="12">שנה</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate">עד תאריך</Label>
            <Input
              id="endDate"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="text-right"
              disabled
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-red-500 after:content-['*'] after:mr-1">
              עלות המנוי
            </Label>
            <Input
              id="amount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(Number(e.target.value))}
              className="text-right"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="documentType" className="text-red-500 after:content-['*'] after:mr-1">
              סוג מסמך
            </Label>
            <Select value={documentType} onValueChange={(value) => setDocumentType(value as DocumentType)}>
              <SelectTrigger id="documentType" className="text-right">
                <SelectValue placeholder="בחר סוג מסמך" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא מסמכים</SelectItem>
                <SelectItem value="unofficial_transaction">עסקה לא רשמית</SelectItem>
                <SelectItem value="unofficial">לא רשמי</SelectItem>
                <SelectItem value="receipt">קבלה</SelectItem>
                <SelectItem value="credit_invoice">חשבונית זיכוי</SelectItem>
                <SelectItem value="tax_invoice">חשבונית מס</SelectItem>
                <SelectItem value="tax_invoice_receipt">חשבונית מס קבלה</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">הערות</Label>
          <Textarea
            id="notes"
            placeholder="הערות נוספות..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Show payment options directly if no document is needed */}
        {documentType === "none" && (
          <div className="border p-3 rounded-md mt-4">
            <Label className="mb-2 block font-medium">אפשרויות תשלום</Label>

            <div className="grid grid-cols-5 gap-2 mb-4">
              <Button
                type="button"
                variant={paymentMethod === "cash" ? "default" : "outline"}
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => setPaymentMethod("cash")}
              >
                <Banknote className="h-4 w-4" />
                <span className="text-xs">מזומן</span>
              </Button>

              <Button
                type="button"
                variant={paymentMethod === "check" ? "default" : "outline"}
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => setPaymentMethod("check")}
              >
                <CheckSquare className="h-4 w-4" />
                <span className="text-xs">צ'קים</span>
              </Button>

              <Button
                type="button"
                variant={paymentMethod === "bank" ? "default" : "outline"}
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => setPaymentMethod("bank")}
              >
                <Building className="h-4 w-4" />
                <span className="text-xs">העברה בנקאית</span>
              </Button>

              <Button
                type="button"
                variant={paymentMethod === "card" ? "default" : "outline"}
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => setPaymentMethod("card")}
              >
                <CreditCard className="h-4 w-4" />
                <span className="text-xs">כרטיס אשראי</span>
              </Button>

              <Button
                type="button"
                variant={paymentMethod === "hyp" ? "default" : "outline"}
                className="flex flex-col items-center gap-1 py-3 h-auto"
                onClick={() => setPaymentMethod("hyp")}
              >
                <div className="relative">
                  <CreditCardIcon className="h-4 w-4" />
                  <ShieldCheck className="h-3 w-3 absolute -top-1 -right-1 text-blue-500" />
                </div>
                <span className="text-xs">HYP</span>
              </Button>
            </div>
          </div>
        )}

        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center">
            <div className="font-medium">סה"כ:</div>
            <div className="text-xl font-bold">₪{totalAmount}</div>
          </div>
          <div className="text-sm text-gray-500 mt-1">
            עבור מנוי חדש מתאריך {formatDate(startDate)} עד תאריך {formatDate(endDate)}
          </div>
        </div>
      </div>
    )
  }

  // Render step 2: Payment details
  const renderStep2 = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-right">{getStep2Title()}</h2>

        {/* Receipt details section */}
        <div className="space-y-4 border-b pb-6">
          <div className="flex justify-end">
            <div className="w-1/3">
              <Label htmlFor="receiptDate" className="text-red-500 after:content-['*'] after:mr-1">
                תאריך
              </Label>
              <Input
                id="receiptDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-right"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div>
              <Label htmlFor="itemDescription" className="text-red-500 after:content-['*'] after:mr-1">
                פריטים
              </Label>
              <Input
                id="itemDescription"
                value={`עבור מנוי חדש מתאריך ${formatDate(startDate)} עד תאריך ${formatDate(endDate)}`}
                readOnly
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="itemUnitPrice" className="text-red-500 after:content-['*'] after:mr-1">
                מחיר יחידה
              </Label>
              <Input
                id="itemUnitPrice"
                type="number"
                value={unitPrice}
                onChange={(e) => setUnitPrice(Number(e.target.value))}
                className="text-right"
              />
            </div>
            <div>
              <Label htmlFor="itemTotal">סה"כ</Label>
              <Input id="itemTotal" type="number" value={unitPrice * quantity} readOnly className="text-right" />
            </div>
          </div>

          <div className="flex justify-end">
            <div className="w-1/4">
              <Label htmlFor="totalAmount">סה"כ</Label>
              <Input
                id="totalAmount"
                type="number"
                value={totalAmount}
                onChange={(e) => setTotalAmount(Number(e.target.value))}
                className="text-right font-bold"
              />
            </div>
          </div>
        </div>

        <div className="text-right font-semibold mb-2">סכום ששולם עד כה:</div>
        <Input type="number" value={0} readOnly className="text-right font-bold text-lg mb-4 w-[200px] ml-auto" />

        {/* Payment options tabs */}
        <div className="w-full">
          <div className="flex border-b">
            <div className="flex w-full justify-between">
              {/* Cash tab */}
              <div
                className={`flex items-center justify-center py-2 px-4 cursor-pointer ${
                  paymentMethod === "cash" ? "border-b-2 border-primary" : ""
                }`}
                onClick={() => setPaymentMethod("cash")}
              >
                <div className="flex items-center">
                  <Banknote className="h-4 w-4 mr-2" />
                  <span>מזומן</span>
                </div>
                <div className="mr-2 font-bold">0</div>
              </div>

              {/* Bank transfer tab */}
              <div
                className={`flex items-center justify-center py-2 px-4 cursor-pointer ${
                  paymentMethod === "bank" ? "border-b-2 border-primary" : ""
                }`}
                onClick={() => setPaymentMethod("bank")}
              >
                <div className="flex items-center">
                  <Building className="h-4 w-4 mr-2" />
                  <span>העברה בנקאית</span>
                </div>
                <div className="mr-2 font-bold">0</div>
              </div>

              {/* Check tab */}
              <div
                className={`flex items-center justify-center py-2 px-4 cursor-pointer ${
                  paymentMethod === "check" ? "border-b-2 border-primary" : ""
                }`}
                onClick={() => setPaymentMethod("check")}
              >
                <div className="flex items-center">
                  <CheckSquare className="h-4 w-4 mr-2" />
                  <span>צ'קים</span>
                </div>
                <div className="mr-2 font-bold">0</div>
              </div>

              {/* Credit card tab */}
              <div
                className={`flex items-center justify-center py-2 px-4 cursor-pointer ${
                  paymentMethod === "card" ? "border-b-2 border-primary" : ""
                }`}
                onClick={() => setPaymentMethod("card")}
              >
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" />
                  <span>כרטיס אשראי</span>
                </div>
                <div className="mr-2 font-bold">{paymentMethod === "card" ? totalAmount : 0}</div>
              </div>

              {/* HYP tab */}
              <div
                className={`flex items-center justify-center py-2 px-4 cursor-pointer ${
                  paymentMethod === "hyp" ? "border-b-2 border-primary" : ""
                }`}
                onClick={() => setPaymentMethod("hyp")}
              >
                <div className="flex items-center">
                  <CreditCardIcon className="h-4 w-4 mr-2" />
                  <span>HYP</span>
                </div>
                <div className="mr-2 font-bold">0</div>
              </div>
            </div>
          </div>

          {/* Payment method specific content */}
          <div className="mt-6 p-4 border rounded-md">
            {paymentMethod === "cash" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <Label>סכום ששולם עד כה:</Label>
                  <div className="font-bold">₪0</div>
                </div>
              </div>
            )}

            {paymentMethod === "bank" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="bankAccountNumber">מספר חשבון</Label>
                    <Input
                      id="bankAccountNumber"
                      placeholder="מספר חשבון"
                      value={bankAccountNumber}
                      onChange={(e) => setBankAccountNumber(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor="transferReference">סכום להעברה</Label>
                    <div className="flex">
                      <Input
                        id="transferAmount"
                        type="number"
                        value={totalAmount}
                        onChange={(e) => setTotalAmount(Number(e.target.value))}
                        className="text-right"
                      />
                      <span className="mr-2">₪</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "check" && (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-4">
                  <Button variant="outline" size="sm" className="flex items-center">
                    <span className="mr-1">+</span> הוסף צ'ק
                  </Button>
                  <div className="flex items-center">
                    <Label htmlFor="autoCalcCheck" className="mr-2">
                      חשבונית אוטומטית
                    </Label>
                    <Switch id="autoCalcCheck" />
                  </div>
                </div>

                <div className="grid grid-cols-6 gap-4 mb-4 text-sm font-medium text-gray-500">
                  <div>תאריך</div>
                  <div>בנק</div>
                  <div>מס' צ'ק</div>
                  <div>סניף</div>
                  <div>מספר חשבון</div>
                  <div>סכום</div>
                </div>

                <div className="grid grid-cols-6 gap-2">
                  <Input
                    type="date"
                    value={checkDate}
                    onChange={(e) => setCheckDate(e.target.value)}
                    className="text-sm"
                  />
                  <Select value={bankName} onValueChange={setBankName}>
                    <SelectTrigger className="text-sm">
                      <SelectValue placeholder="בחר בנק" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="leumi">לאומי</SelectItem>
                      <SelectItem value="poalim">הפועלים</SelectItem>
                      <SelectItem value="discount">דיסקונט</SelectItem>
                      <SelectItem value="mizrahi">מזרחי טפחות</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="מס' צ'ק"
                    value={checkNumber}
                    onChange={(e) => setCheckNumber(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="סניף"
                    value={bankBranch}
                    onChange={(e) => setBankBranch(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    placeholder="מספר חשבון"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value)}
                    className="text-sm"
                  />
                  <Input
                    type="number"
                    placeholder="סכום"
                    value={totalAmount}
                    onChange={(e) => setTotalAmount(Number(e.target.value))}
                    className="text-sm"
                  />
                </div>
              </div>
            )}

            {paymentMethod === "card" && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardAmount">סכום אשראי</Label>
                    <Input
                      id="cardAmount"
                      type="number"
                      value={totalAmount}
                      onChange={(e) => setTotalAmount(Number(e.target.value))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="installments">מספר התשלומים</Label>
                    <div className="flex items-center">
                      <Select value={installments.toString()} onValueChange={(val) => setInstallments(Number(val))}>
                        <SelectTrigger>
                          <SelectValue placeholder="1" />
                        </SelectTrigger>
                        <SelectContent>
                          {getInstallmentOptions().map((num) => (
                            <SelectItem key={num} value={num.toString()}>
                              {num}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button variant="outline" size="sm" className="mr-2">
                        חלק שווה
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center">
                  <Label htmlFor="transferFee">העמסת עברה לקוח</Label>
                  <Switch id="transferFee" />
                </div>

                <div className="flex justify-between items-center">
                  <Label htmlFor="autoCalcCard">חשבונית אוטומטית</Label>
                  <Switch id="autoCalcCard" />
                </div>
              </div>
            )}

            {paymentMethod === "hyp" && (
              <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <div className="flex items-start">
                  <ShieldCheck className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                  <div>
                    <h3 className="font-medium text-blue-800 mb-2">תשלום מאובטח באמצעות HYP</h3>
                    <p className="text-sm text-blue-700 mb-2">לחץ על "הקדם" כדי לעבור למסך התשלום המאובטח של HYP.</p>
                    <ul className="text-sm text-blue-700 list-disc list-inside">
                      <li>תשלום מאובטח ומוצפן</li>
                      <li>תמיכה בכל כרטיסי האשראי</li>
                      <li>קבלה דיגיטלית תישלח למייל</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center">
            <Label htmlFor="sendReceipt">האם ברצונך לשלוח מסמך ללקוח?</Label>
            <Checkbox id="sendReceipt" checked={sendReceipt} onCheckedChange={(checked) => setSendReceipt(!!checked)} />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes">הערות</Label>
          <Textarea
            id="notes"
            placeholder="הערות נוספות..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="min-h-[80px]"
          />
        </div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <div className="flex justify-center items-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>מנוי חדש</DialogTitle>
          </DialogHeader>

          {renderStepIndicator()}

          <div className="py-2">
            {/* Basic form content for demonstration */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subscriptionType">סוג מנוי</Label>
                <Select value={subscriptionId} onValueChange={setSubscriptionId}>
                  <SelectTrigger>
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
            </div>
          </div>

          <DialogFooter className="flex justify-between sm:justify-between">
            {currentStep === 1 ? (
              <>
                <Button variant="outline" onClick={() => onOpenChange(false)}>
                  ביטול
                </Button>
                <Button onClick={handleNextStep} disabled={isSubmitting}>
                  {documentType === "none" ? "הקדם" : (
                    <>
                      הבא <ArrowLeft className="mr-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handlePreviousStep} disabled={isSubmitting}>
                  <ArrowRight className="ml-2 h-4 w-4" /> הקודם
                </Button>
                <Button onClick={handleSubmit} disabled={isSubmitting || isLoading}>
                  {isSubmitting ? "מוסיף..." : "הקדם"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* HYP Payment Modal */}
      <EnhancedHypPaymentModal
        open={hypModalOpen}
        onOpenChange={setHypModalOpen}
        amount={totalAmount}
        memberId={memberId}
        memberName={memberName}
        memberEmail={memberEmail}
        memberPhone={memberPhone}
        memberAddress=""
        description={`מנוי ${groupSubscriptions.find((sub) => sub.id === subscriptionId)?.name || ""} - ${duration} חודשים`}
        payments={installments > 1 ? installments.toString() : "1"}
        onPaymentSuccess={handleHypPaymentSuccess}
        onPaymentCancel={handleHypPaymentCancel}
      />
    </>
  )
}
