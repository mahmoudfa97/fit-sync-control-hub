"use client"

import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, CreditCard, AlertTriangle, ChevronLeft, PhoneCall } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { EnhancedHypPaymentService } from "@/services/EnhancedHypPaymentService"
import { Progress } from "@/components/ui/progress"

interface EnhancedHypPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  memberId: string
  memberName: string
  memberEmail?: string
  memberPhone?: string
  memberAddress?: string
  description?: string
  payments?: string // Number of payments, e.g., "1" or "3-12" for range
  onPaymentSuccess: (paymentId: string) => void
  onPaymentCancel: () => void
}

export const EnhancedHypPaymentModal = ({
  open,
  onOpenChange,
  amount,
  memberId,
  memberName,
  memberEmail = "",
  memberPhone = "",
  memberAddress = "",
  description = "תשלום מנוי",
  payments = "1",
  onPaymentSuccess,
  onPaymentCancel,
}: EnhancedHypPaymentModalProps) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed" | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [secretTransactionId, setSecretTransactionId] = useState<string | null>(null)
  const [iframeHeight, setIframeHeight] = useState(500)
  const [showFallback, setShowFallback] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusCheckProgress, setStatusCheckProgress] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [isApiPermissionError, setIsApiPermissionError] = useState(false)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const statusCheckIntervalRef = useRef<number | null>(null)
  const statusCheckTimeoutRef = useRef<number | null>(null)

  // Initialize payment when modal opens
  useEffect(() => {
    if (open && !paymentUrl && !paymentStatus) {
      initializePayment()
    }

    // Check for payment success on return from payment page
    const checkForPaymentSuccess = async () => {
      // Get the secretTransactionId from localStorage
      const storedTransactionId = localStorage.getItem("hyp_transaction_id")
      const storedPaymentId = localStorage.getItem("hyp_payment_id")

      if (storedTransactionId && storedPaymentId && open) {
        try {
          setCheckingStatus(true)
          setStatusCheckProgress(50)

          // Validate the payment
          const result = await EnhancedHypPaymentService.handlePaymentSuccess(
            storedTransactionId,
            storedPaymentId,
            {
              name: memberName,
              email: memberEmail || "",
              address: memberAddress,
            },
            description,
          )

          if (result.success) {
            setPaymentStatus("success")
            setReceiptUrl(result.receiptUrl || null)
            setStatusCheckProgress(100)

            toast({
              title: "התשלום הושלם בהצלחה",
              description: "התשלום עבור המנוי התקבל בהצלחה",
            })

            // Call success callback after a short delay
            setTimeout(() => {
              onPaymentSuccess(storedPaymentId)
            }, 2000)
          }
        } catch (error) {
          console.error("Error checking payment success:", error)
          setPaymentStatus("failed")
        } finally {
          setCheckingStatus(false)
          // Clear the stored transaction ID
          localStorage.removeItem("hyp_transaction_id")
          localStorage.removeItem("hyp_payment_id")
        }
      }
    }

    checkForPaymentSuccess()

    // Cleanup status checking on unmount
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
      }
      if (statusCheckTimeoutRef.current) {
        clearTimeout(statusCheckTimeoutRef.current)
      }
    }
  }, [open])

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      // Stop any status checking
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }

      setTimeout(() => {
        setPaymentUrl(null)
        setPaymentStatus(null)
        setPaymentId(null)
        setSecretTransactionId(null)
        setShowFallback(false)
        setIframeError(false)
        setCheckingStatus(false)
        setStatusCheckProgress(0)
        setShowReceipt(false)
        setReceiptUrl(null)
        setErrorMessage(null)
        setIsApiPermissionError(false)
      }, 300)
    }
  }, [open])

  // Check iframe loading
  useEffect(() => {
    if (paymentUrl) {
      // If iframe fails to load, show fallback after 10 seconds
      const timeoutId = setTimeout(() => {
        if (!iframeRef.current?.contentWindow?.location) {
          setIframeError(true)
        }
      }, 10000)

      return () => clearTimeout(timeoutId)
    }
  }, [paymentUrl])

  // Initialize payment
  const initializePayment = async () => {
    try {
      setIsLoading(true)
      setIframeError(false)
      setShowFallback(false)
      setErrorMessage(null)
      setIsApiPermissionError(false)

      console.log("Initializing payment with amount:", amount)

      const paymentResponse = await EnhancedHypPaymentService.createSecurePayment({
        amount,
        description,
        customerId: memberId,
        customerName: memberName,
        customerEmail: memberEmail,
        customerPhone: memberPhone,
        payments,
        metadata: {
          memberId,
          memberName,
          description,
          source: "subscription_dialog",
        },
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      })

      console.log("Payment response received:", paymentResponse)

      setPaymentId(paymentResponse.id)
      setPaymentUrl(paymentResponse.paymentUrl || null)
      setSecretTransactionId(paymentResponse.secretTransactionId || null)
      setPaymentStatus("pending")

      // Store payment ID for validation after redirect
      if (paymentResponse.id) {
        localStorage.setItem("hyp_payment_id", paymentResponse.id)
      }
    } catch (error) {
      console.error("Failed to initialize payment:", error)

      // Check for API permission error
      if (error instanceof Error && error.message.includes("API_CLEARING")) {
        setIsApiPermissionError(true)
        setErrorMessage("חשבון ה-HYP שלך אינו מורשה לבצע תשלומים דרך ה-API. יש לפנות לתמיכה של HYP להפעלת התכונה.")
      } else {
        // Show generic error message
        setShowFallback(true)
        setErrorMessage(error instanceof Error ? error.message : "אירעה שגיאה בעת יצירת התשלום. נסה שנית.")
      }

      toast({
        title: "שגיאה",
        description: error instanceof Error ? error.message : "אירעה שגיאה בעת יצירת התשלום. נסה שנית.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle cancel
  const handleCancel = () => {
    // No need to update payment status in database since we're not saving pending payments
    // Just clean up localStorage
    localStorage.removeItem("hyp_transaction_id")
    localStorage.removeItem("hyp_payment_id")
    localStorage.removeItem("hyp_payment_details")

    // Stop any status checking
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current)
    }
    if (statusCheckTimeoutRef.current) {
      clearTimeout(statusCheckTimeoutRef.current)
    }

    onPaymentCancel()
    onOpenChange(false)
  }

  // Handle iframe load error
  const handleIframeError = () => {
    setIframeError(true)
  }

  // Open payment in new window
  const openPaymentInNewWindow = () => {
    if (paymentUrl) {
      window.open(paymentUrl, "_blank", "width=800,height=600")
      toast({
        title: "תשלום נפתח בחלון חדש",
        description: "לאחר השלמת התשלום, חזור לחלון זה לבדיקת הסטטוס",
      })
    }
  }

  // Handle showing receipt
  const handleViewReceipt = () => {
    setShowReceipt(true)
  }

  // Render API permission error
  const renderApiPermissionError = () => {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">שגיאת הרשאות HYP</h3>
        <p className="text-center text-gray-600 mb-4">
          {errorMessage || "חשבון ה-HYP שלך אינו מורשה לבצע תשלומים דרך ה-API. יש לפנות לתמיכה של HYP להפעלת התכונה."}
        </p>
        <div className="flex flex-col gap-3 items-center">
          <p className="text-sm text-gray-500 mb-2">
            יש לפנות לתמיכה של HYP ולבקש להפעיל את תכונת API_CLEARING בחשבון שלך.
          </p>
          <Button
            variant="outline"
            className="flex items-center"
            onClick={() => window.open("https://www.hyp.co.il/contact", "_blank")}
          >
            <PhoneCall className="h-4 w-4 mr-2" />
            פנה לתמיכה של HYP
          </Button>
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mt-2">
            סגור
          </Button>
        </div>
      </div>
    )
  }

  // Render different UI based on status
  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-center text-gray-600">מכין את התשלום...</p>
        </div>
      )
    }

    if (isApiPermissionError) {
      return renderApiPermissionError()
    }

    if (showReceipt && receiptUrl) {
      return (
        <div className="flex flex-col">
          <div className="mb-4">
            <Button variant="outline" size="sm" className="flex items-center" onClick={() => setShowReceipt(false)}>
              <ChevronLeft className="h-4 w-4 mr-1" />
              חזרה
            </Button>
          </div>
          <div className="border rounded-md overflow-hidden">
            <iframe src={receiptUrl} width="100%" height={550} frameBorder="0" />
          </div>
          <div className="flex justify-center mt-4">
            <Button onClick={() => window.open(receiptUrl, "_blank")}>הורד קבלה</Button>
          </div>
        </div>
      )
    }

    if (paymentStatus === "success") {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">התשלום הושלם בהצלחה!</h3>
          <p className="text-center text-gray-600 mb-4">התשלום עבור המנוי התקבל בהצלחה. תודה!</p>
          <div className="flex gap-3">
            {receiptUrl && <Button onClick={handleViewReceipt}>צפה בקבלה</Button>}
            <Button onClick={() => onOpenChange(false)}>סגור</Button>
          </div>
        </div>
      )
    }

    if (paymentStatus === "failed") {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <XCircle className="h-16 w-16 text-red-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">התשלום נכשל</h3>
          <p className="text-center text-gray-600 mb-4">
            {errorMessage || "אירעה שגיאה בעת ביצוע התשלום. נסה שנית או בחר אמצעי תשלום אחר."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              סגור
            </Button>
            <Button onClick={initializePayment}>נסה שנית</Button>
          </div>
        </div>
      )
    }

    if (showFallback) {
      return (
        <div className="flex flex-col items-center justify-center py-10">
          <AlertTriangle className="h-16 w-16 text-amber-500 mb-4" />
          <h3 className="text-xl font-semibold mb-2">לא ניתן להתחבר למערכת HYP</h3>
          <p className="text-center text-gray-600 mb-4">
            {errorMessage || "אירעה שגיאה בהתחברות למערכת התשלומים. אנא נסה שנית או בחר אמצעי תשלום אחר."}
          </p>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              חזור
            </Button>
            <Button onClick={initializePayment}>נסה שנית</Button>
          </div>
        </div>
      )
    }

    if (paymentUrl) {
      return (
        <div className="flex flex-col">
          {checkingStatus && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">בודק סטטוס תשלום...</span>
                <span className="text-sm text-gray-500">{Math.round(statusCheckProgress)}%</span>
              </div>
              <Progress value={statusCheckProgress} className="h-2" />
            </div>
          )}

          {iframeError ? (
            <div className="bg-amber-50 p-4 rounded-lg mb-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-amber-500 mr-2 mt-0.5" />
                <div>
                  <h4 className="font-medium text-amber-800">לא ניתן לטעון את מסך התשלום</h4>
                  <p className="text-sm text-amber-700 mt-1">
                    אנא נסה להמשיך את התשלום בחלון חדש או בחר שיטת תשלום אחרת.
                  </p>
                  <div className="mt-3">
                    <Button onClick={openPaymentInNewWindow} className="mr-2">
                      פתח בחלון חדש
                    </Button>
                    <Button variant="outline" onClick={handleCancel}>
                      ביטול
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="border rounded-md overflow-hidden">
              <iframe
                ref={iframeRef}
                src={paymentUrl}
                width="100%"
                height={iframeHeight}
                frameBorder="0"
                allow="payment"
                onLoad={() => setIframeHeight(550)}
                onError={handleIframeError}
              />
            </div>
          )}

          <p className="text-sm text-gray-500 mt-3 text-center flex items-center justify-center">
            <CreditCard className="h-4 w-4 mr-1" />
            התשלום מאובטח ומבוצע באמצעות HYP, מערכת סליקה מאובטחת.
          </p>
        </div>
      )
    }

    return null
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>תשלום מאובטח באמצעות HYP</DialogTitle>
        </DialogHeader>

        <div className="py-4">{renderContent()}</div>

        <DialogFooter>
          {paymentStatus !== "success" && !showReceipt && (
            <Button variant="outline" onClick={handleCancel} disabled={isLoading}>
              ביטול
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default EnhancedHypPaymentModal
