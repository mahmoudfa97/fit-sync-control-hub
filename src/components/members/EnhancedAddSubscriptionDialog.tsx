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
  Plus, Trash2,
  ShieldCheck,
  CreditCardIcon,
  FileText,
} from "lucide-react"
import { SubscriptionService, type GroupSubscription, type PaymentDetails } from "@/services/SubscriptionService"
import EnhancedHypPaymentModal from "@/components/payments/EnhancedHypPaymentModal"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { supabase } from "@/integrations/supabase/client"
import { Card } from "../ui/card"

// Document types
const DOCUMENT_TYPES = [
  { value: "none", label: "ללא מסמכים" },
  { value: "320", label: "קבלה (Receipt)" },
  { value: "305", label: "חשבונית מס (Tax Invoice)" },
  { value: "330", label: "חשבונית מס/קבלה (Tax Invoice/Receipt)" },
  { value: "400", label: "חשבונית זיכוי (Credit Invoice)" },
  { value: "405", label: "חשבונית מס/קבלה זיכוי (Credit Tax Invoice/Receipt)" },
]

// Payment types
const PAYMENT_TYPES = [
  { value: "1", label: "מזומן (Cash)" },
  { value: "2", label: "המחאה (Check)" },
  { value: "3", label: "כרטיס אשראי (Credit Card)" },
  { value: "4", label: "העברה בנקאית (Bank Transfer)" },
  { value: "5", label: "הוראת קבע (Standing Order)" },
  { value: "9", label: "אחר (Other)" },
]

// Credit card types
const CREDIT_CARD_TYPES = [
  { value: "1", label: "ישראכרט (Isracard)" },
  { value: "2", label: "ויזה (Visa)" },
  { value: "3", label: "דיינרס (Diners)" },
  { value: "4", label: "אמריקן אקספרס (American Express)" },
  { value: "5", label: "מאסטרקארד (Mastercard)" },
  { value: "6", label: "לאומי קארד (Leumi Card)" },
  { value: "7", label: "אחר (Other)" },
]

// Credit card deal types
const CREDIT_CARD_DEAL_TYPES = [
  { value: "1", label: "רגיל (Regular)" },
  { value: "2", label: "תשלומים (Installments)" },
  { value: "3", label: "קרדיט (Credit)" },
  { value: "4", label: "חיוב נדחה (Delayed Charge)" },
]

// VAT types
const VAT_TYPES = [
  { value: "INC", label: 'כולל מע"מ (Including VAT)' },
  { value: "EXC", label: 'לא כולל מע"מ (Excluding VAT)' },
  { value: "FREE", label: 'פטור ממע"מ (VAT Free)' },
]



interface Item {
  catalog_number: string
  details: string
  price: number
  amount: number
  vat_type: string
}

interface Payment {
  payment_type: string
  payment_sum: number
  cc_type?: string
  cc_type_name?: string
  cc_number?: string
  cc_deal_type?: string
  cc_num_of_payments?: number
  cc_payment_num?: number
  check_number?: string
  check_date?: string
  bank_name?: string
  bank_branch?: string
  bank_account?: string
}

interface DocumentData {
  type: string
  transaction_id: string
  customer_name: string
  customer_email: string
  customer_address: string
  customer_phone: string
  forceItems: number
  show_items_including_vat: number
  item: Item[]
  payment: Payment[]
  price_total: number
  comment: string
  send_email: boolean
  email_to_client: string
  lang: string
  paper_type: string
}

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

interface DocumentItem {
  catalog_number: string
  details: string
  price: number
  amount: number
  vat_type: string
}

interface DocumentPayment {
  payment_type: string
  payment_sum: number
  cc_type?: string
  cc_type_name?: string
  cc_number?: string
  cc_deal_type?: string
  cc_num_of_payments?: number
  cc_payment_num?: number
  check_number?: string
  check_date?: string
  bank_name?: string
  bank_branch?: string
  bank_account?: string
}

interface DocumentData {
  type: string
  transaction_id: string
  customer_name: string
  customer_email: string
  customer_address: string
  customer_phone: string
  forceItems: number
  show_items_including_vat: number
  item: DocumentItem[]
  payment: DocumentPayment[]
  price_total: number
  comment: string
  send_email: boolean
  email_to_client: string
  lang: string
  paper_type: string
}

export const EnhancedAddSubscriptionDialog = ({
  open,
  onOpenChange,
  memberId,
  memberName,
  memberEmail = "",
  memberPhone = "",
  onSubscriptionAdded,
}: AddSubscriptionDialogProps) => {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [groupSubscriptions, setGroupSubscriptions] = useState<GroupSubscription[]>([])

  // Step management
  const [currentStep, setCurrentStep] = useState(1)
  const [totalSteps, setTotalSteps] = useState(2)

  // Subscription details
  const [subscriptionId, setSubscriptionId] = useState("")
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"))
  const [endDate, setEndDate] = useState("")
  const [duration, setDuration] = useState<Duration>("1")
  const [quantity, setQuantity] = useState(1)
  const [unitPrice, setUnitPrice] = useState(0)
  const [totalAmount, setTotalAmount] = useState(0)
  const [notes, setNotes] = useState("")
  const [documentType, setDocumentType] = useState("330") // Default to tax invoice/receipt

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
  const [cardType, setCardType] = useState("2") // Default to Visa
  const [cardDealType, setCardDealType] = useState("1") // Default to regular

  const [checkNumber, setCheckNumber] = useState("")
  const [checkDate, setCheckDate] = useState("")
  const [bankName, setBankName] = useState("")
  const [bankAccountNumber, setBankAccountNumber] = useState("")
  const [bankBranch, setBankBranch] = useState("")

  const [transferReference, setTransferReference] = useState("")

  // HYP payment modal state
  const [hypModalOpen, setHypModalOpen] = useState(false)
  const [hypPaymentId, setHypPaymentId] = useState<string | null>(null)

  // Document data
  const [documentData, setDocumentData] = useState<DocumentData>({
    type: "330", // Default to tax invoice/receipt
    transaction_id: "",
    customer_name: memberName,
    customer_email: memberEmail,
    customer_address: "",
    customer_phone: memberPhone,
    forceItems: 1,
    show_items_including_vat: 1,
    item: [
      {
        catalog_number: "",
        details: "מנוי חדר כושר",
        price: 0,
        amount: 1,
        vat_type: "INC",
      },
    ],
    payment: [
      {
        payment_type: "3", // Default to credit card
        payment_sum: 0,
        cc_type: "2", // Default to Visa
        cc_type_name: "Visa",
        cc_number: "",
        cc_deal_type: "1", // Default to regular
        cc_num_of_payments: 1,
        cc_payment_num: 1,
      },
    ],
    price_total: 0,
    comment: "",
    send_email: true,
    email_to_client: memberEmail,
    lang: "he", // Default to Hebrew
    paper_type: "A4",
  })

  // Document preview
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [documentId, setDocumentId] = useState<string | null>(null)
  const [showDocumentPreview, setShowDocumentPreview] = useState(false)

  // Fetch group subscriptions when dialog opens
  useEffect(() => {
    if (open) {
      fetchGroupSubscriptions()
      setCurrentStep(1)
      setShowDocumentPreview(false)
      setDocumentUrl(null)
      setDocumentId(null)

      // Reset document data with member details
      setDocumentData((prev) => ({
        ...prev,
        customer_name: memberName,
        customer_email: memberEmail,
        customer_phone: memberPhone,
        email_to_client: memberEmail,
      }))
    }
  }, [open, memberName, memberEmail, memberPhone])
// Handle payment change
const handlePaymentChange = (index: number, field: string, value: any) => {
  setDocumentData((prev) => {
    const updatedPayments = [...prev.payment]
    updatedPayments[index] = {
      ...updatedPayments[index],
      [field]: 
        field === "payment_sum" || 
        field === "cc_num_of_payments" || 
        field === "cc_payment_num" 
          ? Number(value) 
          : value,
    }
    return {
      ...prev,
      payment: updatedPayments,
    }
  })
}

// Add new payment
const addPayment = () => {
  setDocumentData((prev) => ({
    ...prev,
    payment: [
      ...prev.payment,
      {
        payment_type: "1", // Default to cash
        payment_sum: 0,
      },
    ],
  }))
}

// Remove payment
const removePayment = (index: number) => {
  if (documentData.payment.length <= 1) {
    toast({
      title: "שגיאה",
      description: "חייב להיות לפחות אמצעי תשלום אחד",
      variant: "destructive",
    })
    return
  }

  setDocumentData((prev) => ({
    ...prev,
    payment: prev.payment.filter((_, i) => i !== index),
  }))
}
  const fetchGroupSubscriptions = async () => {
    try {
      setIsLoading(true)
      const data = await SubscriptionService.fetchGroupSubscriptions()
      setGroupSubscriptions(data)

      // Set default values if we have subscriptions
      if (data.length > 0) {
        setSubscriptionId(data[0].id)
        setUnitPrice(data[0].price_per_month)
        updateTotalAmount(data[0].price_per_month, quantity, duration)

        // Update document item description
        setDocumentData((prev) => ({
          ...prev,
          item: [
            {
              ...prev.item[0],
              details: `מנוי ${data[0].name} - ${duration} חודשים`,
              price: data[0].price_per_month * Number.parseInt(duration),
              amount: quantity,
            },
          ],
          price_total: data[0].price_per_month * Number.parseInt(duration) * quantity,
          payment: [
            {
              ...prev.payment[0],
              payment_sum: data[0].price_per_month * Number.parseInt(duration) * quantity,
            },
          ],
        }))
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

      // Update document item description
      const selectedSubscription = groupSubscriptions.find((sub) => sub.id === subscriptionId)
      if (selectedSubscription) {
        setDocumentData((prev) => ({
          ...prev,
          item: [
            {
              ...prev.item[0],
              details: `מנוי ${selectedSubscription.name} - ${duration} חודשים`,
            },
          ],
        }))
      }
    }
  }, [startDate, duration, subscriptionId, groupSubscriptions])

  // Update unit price when subscription changes
  useEffect(() => {
    if (subscriptionId) {
      const selectedSubscription = groupSubscriptions.find((sub) => sub.id === subscriptionId)
      if (selectedSubscription) {
        setUnitPrice(selectedSubscription.price_per_month)
        updateTotalAmount(selectedSubscription.price_per_month, quantity, duration)

        // Update document item description
        setDocumentData((prev) => ({
          ...prev,
          item: [
            {
              ...prev.item[0],
              details: `מנוי ${selectedSubscription.name} - ${duration} חודשים`,
              price: selectedSubscription.price_per_month * Number.parseInt(duration),
              amount: quantity,
            },
          ],
        }))
      }
    }
  }, [subscriptionId, groupSubscriptions, duration])

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

    // Update document payment type
    let paymentType = "1" // Default to cash
    switch (paymentMethod) {
      case "cash":
        paymentType = "1"
        break
      case "check":
        paymentType = "2"
        break
      case "card":
        paymentType = "3"
        break
      case "bank":
        paymentType = "4"
        break
    }

    setDocumentData((prev) => ({
      ...prev,
      payment: [
        {
          ...prev.payment[0],
          payment_type: paymentType,
        },
      ],
    }))
  }, [paymentMethod])

  // Update document data when total amount changes
  useEffect(() => {
    setDocumentData((prev) => ({
      ...prev,
      price_total: totalAmount,
      payment: [
        {
          ...prev.payment[0],
          payment_sum: totalAmount,
        },
      ],
    }))
  }, [totalAmount])

  // Update document type when it changes
  useEffect(() => {
    setDocumentData((prev) => ({
      ...prev,
      type: documentType,
    }))

    // If document type is "none", set total steps to 1, otherwise 2
    setTotalSteps(documentType === "none" ? 1 : 2)
  }, [documentType])

  // Update document data when card details change
  useEffect(() => {
    if (paymentMethod === "card" || paymentMethod === "hyp") {
      const cardName = CREDIT_CARD_TYPES.find((card) => card.value === cardType)?.label.split(" ")[0] || "Visa"

      setDocumentData((prev) => ({
        ...prev,
        payment: [
          {
            ...prev.payment[0],
            cc_type: cardType,
            cc_type_name: cardName,
            cc_number: cardNumber.slice(-4),
            cc_deal_type: cardDealType,
            cc_num_of_payments: installments,
            cc_payment_num: 1,
          },
        ],
      }))
    }
  }, [paymentMethod, cardType, cardNumber, cardDealType, installments])

  // Update document data when check details change
  useEffect(() => {
    if (paymentMethod === "check") {
      setDocumentData((prev) => ({
        ...prev,
        payment: [
          {
            ...prev.payment[0],
            check_number: checkNumber,
            check_date: checkDate,
            bank_name: bankName,
          },
        ],
      }))
    }
  }, [paymentMethod, checkNumber, checkDate, bankName])

  // Update document data when bank details change
  useEffect(() => {
    if (paymentMethod === "bank") {
      setDocumentData((prev) => ({
        ...prev,
        payment: [
          {
            ...prev.payment[0],
            bank_name: bankName,
            bank_branch: bankBranch,
            bank_account: bankAccountNumber,
          },
        ],
      }))
    }
  }, [paymentMethod, bankName, bankBranch, bankAccountNumber])

  const updateTotalAmount = (price: number, qty: number, dur: string) => {
    const durationMonths = Number.parseInt(dur)
    const total = price * qty * durationMonths
    setTotalAmount(total)
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
        paymentMethod,
        amount: totalAmount,
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

      // If document type is not "none", create document
      if (documentType !== "none") {
        try {
          // Call the Edge Function to create document
          const { data, error } = await supabase.functions.invoke("hyp-create-document", {
            body: {
              developer_email: import.meta.env.VITE_HYP_DEVELOPER_EMAIL || localStorage.getItem("hyp_developer_email"),
              api_key: import.meta.env.VITE_HYP_API_KEY || localStorage.getItem("hyp_api_key"),
              ...documentData,
            },
          })

          if (error) {
            throw error
          }

          if (!data.success) {
            throw new Error(data.error || "Failed to create document")
          }

          // Set document URL and ID
          setDocumentUrl(data.doc_url)
          setDocumentId(data.doc_id)

          // Add document details to payment details
          paymentDetails.receiptUrl = data.doc_url
          paymentDetails.receiptNumber = data.doc_number
        } catch (error) {
          console.error("Error creating document:", error)
          toast({
            title: "שגיאה ביצירת מסמך",
            description: error instanceof Error ? error.message : "אירעה שגיאה ביצירת המסמך",
            variant: "destructive",
          })
          // Continue with subscription creation even if document creation fails
        }
      }

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

      // If document was created, show preview
      if (documentUrl) {
        setShowDocumentPreview(true)
      } else {
        onSubscriptionAdded()
        onOpenChange(false)
      }
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
  const getDocumentTypeDisplayName = (type: string): string => {
    const documentTypes: Record<string, string> = {
      none: "ללא מסמכים",
      "320": "קבלה",
      "305": "חשבונית מס",
      "330": "חשבונית מס קבלה",
      "400": "חשבונית זיכוי",
      "405": "חשבונית מס/קבלה זיכוי",
    }
    return documentTypes[type] || type
  }

  // Get step 2 title based on document type
  const getStep2Title = (): string => {
    return getDocumentTypeDisplayName(documentType)
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
 // Render payment fields based on payment type
  const renderPaymentFields = (payment: Payment, index: number) => {
    switch (payment.payment_type) {
      case "3": // Credit Card
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סוג כרטיס</Label>
                <Select
                  value={payment.cc_type || "2"}
                  onValueChange={(value) => {
                    const cardName = CREDIT_CARD_TYPES.find(card => card.value === value)?.label.split(" ")[0] || "Visa"
                    handlePaymentChange(index, "cc_type", value)
                    handlePaymentChange(index, "cc_type_name", cardName)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג כרטיס" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_CARD_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>4 ספרות אחרונות</Label>
                <Input
                  value={payment.cc_number || ""}
                  onChange={(e) => handlePaymentChange(index, "cc_number", e.target.value)}
                  maxLength={4}
                  placeholder="1234"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>סוג עסקה</Label>
                <Select
                  value={payment.cc_deal_type || "1"}
                  onValueChange={(value) => handlePaymentChange(index, "cc_deal_type", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="בחר סוג עסקה" />
                  </SelectTrigger>
                  <SelectContent>
                    {CREDIT_CARD_DEAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>מספר תשלומים</Label>
                <Input
                  type="number"
                  min="1"
                  value={payment.cc_num_of_payments || 1}
                  onChange={(e) => handlePaymentChange(index, "cc_num_of_payments", e.target.value)}
                />
              </div>
            </div>
          </div>
        )
      case "2": // Check
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>מספר המחאה</Label>
                <Input
                  value={payment.check_number || ""}
                  onChange={(e) => handlePaymentChange(index, "check_number", e.target.value)}
                  placeholder="123456"
                />
              </div>
              <div className="space-y-2">
                <Label>תאריך המחאה</Label>
                <Input
                  type="date"
                  value={payment.check_date || ""}
                  onChange={(e) => handlePaymentChange(index, "check_date", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>בנק</Label>
                <Input
                  value={payment.bank_name || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_name", e.target.value)}
                  placeholder="לאומי"
                />
              </div>
            </div>
          </div>
        )
      case "4": // Bank Transfer
        return (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>בנק</Label>
                <Input
                  value={payment.bank_name || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_name", e.target.value)}
                  placeholder="לאומי"
                />
              </div>
              <div className="space-y-2">
                <Label>סניף</Label>
                <Input
                  value={payment.bank_branch || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_branch", e.target.value)}
                  placeholder="123"
                />
              </div>
              <div className="space-y-2">
                <Label>מספר חשבון</Label>
                <Input
                  value={payment.bank_account || ""}
                  onChange={(e) => handlePaymentChange(index, "bank_account", e.target.value)}
                  placeholder="12345678"
                />
              </div>
            </div>
          </div>
        )
      default:
        return null
    }
  }

  // Render payment icon based on payment type
  const renderPaymentIcon = (paymentType: string) => {
    switch (paymentType) {
      case "1": // Cash
        return <Banknote className="h-4 w-4" />
      case "2": // Check
        return <CheckSquare className="h-4 w-4" />
      case "3": // Credit Card
        return <CreditCard className="h-4 w-4" />
      case "4": // Bank Transfer
        return <Building className="h-4 w-4" />
      default:
        return null
    }
  }
  // Render document preview
  const renderDocumentPreview = () => {
    if (!documentUrl) return null

    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-medium">המסמך נוצר בהצלחה</h3>
          <Button onClick={() => window.open(documentUrl, "_blank")} className="flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            פתח בחלון חדש
          </Button>
        </div>

        <div className="border rounded-md overflow-hidden">
          <iframe src={documentUrl} width="100%" height="600" frameBorder="0" />
        </div>

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            סגור
          </Button>
          <Button
            onClick={() => {
              onSubscriptionAdded()
              onOpenChange(false)
            }}
          >
            סיים
          </Button>
        </div>
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
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger id="documentType" className="text-right">
                <SelectValue placeholder="בחר סוג מסמך" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">ללא מסמכים</SelectItem>
                <SelectItem value="320">קבלה</SelectItem>
                <SelectItem value="305">חשבונית מס</SelectItem>
                <SelectItem value="330">חשבונית מס קבלה</SelectItem>
                <SelectItem value="400">חשבונית זיכוי</SelectItem>
                <SelectItem value="405">חשבונית מס/קבלה זיכוי</SelectItem>
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
                onChange={(e) => {
                  setDocumentData((prev) => ({
                    ...prev,
                    item: [
                      {
                        ...prev.item[0],
                        details: e.target.value,
                      },
                    ],
                  }))
                }}
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
                onChange={(e) => {
                  const newUnitPrice = Number(e.target.value)
                  setUnitPrice(newUnitPrice)
                  setDocumentData((prev) => ({
                    ...prev,
                    item: [
                      {
                        ...prev.item[0],
                        price: newUnitPrice * Number.parseInt(duration),
                      },
                    ],
                  }))
                }}
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

        {/* Payment options tabs */}
        <div className="w-full">
          {/* Payment method specific content */}
        
        </div>
        <div value="payments" className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">אמצעי תשלום</h3>
                  <Button onClick={addPayment} size="sm" className="flex items-center">
                    <Plus className="h-4 w-4 mr-2" />
                    הוסף אמצעי תשלום
                  </Button>
                </div>

                {documentData.payment.map((payment, index) => (
                  <Card key={index} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium flex items-center">
                        {renderPaymentIcon(payment.payment_type)}
                        <span className="mr-2">אמצעי תשלום {index + 1}</span>
                      </h4>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePayment(index)}
                        className="text-red-500 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-2">
                        <Label>סוג תשלום</Label>
                        <Select
                          value={payment.payment_type}
                          onValueChange={(value) => handlePaymentChange(index, "payment_type", value)}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="בחר סוג תשלום" />
                          </SelectTrigger>
                          <SelectContent>
                            {PAYMENT_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>סכום</Label>
                        <Input
                          type="number"
                          min="0"
                          step="0.01"
                          value={payment.payment_sum}
                          onChange={(e) => handlePaymentChange(index, "payment_sum", e.target.value)}
                        />
                      </div>
                    </div>

                    {renderPaymentFields(payment, index)}
                  </Card>
                ))}

                <div className="flex justify-end">
                  <div className="bg-gray-50 p-4 rounded-md">
                    <div className="text-lg font-bold">
                      סה"כ שולם: ₪
                      {documentData.payment.reduce((sum, payment) => sum + (payment.payment_sum || 0), 0).toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
        
      </div>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>מנוי חדש</DialogTitle>
          </DialogHeader>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : showDocumentPreview ? (
            renderDocumentPreview()
          ) : (
            <>
              {renderStepIndicator()}

              <div className="py-2">
                {currentStep === 1 && renderStep1()}
                {currentStep === 2 && renderStep2()}
              </div>
            </>
          )}

          {!showDocumentPreview && (
            <DialogFooter className="flex justify-between sm:justify-between">
              {currentStep === 1 ? (
                <>
                  <Button variant="outline" onClick={() => onOpenChange(false)}>
                    ביטול
                  </Button>
                  <Button onClick={handleNextStep} disabled={isSubmitting}>
                    {documentType === "none" ? (
                      "הקדם"
                    ) : (
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
          )}
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

export default EnhancedAddSubscriptionDialog
