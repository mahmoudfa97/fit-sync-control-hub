"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle, XCircle, CreditCard, AlertTriangle, ChevronLeft } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import HypPaymentService from "@/services/HypPaymentService"
import { Progress } from "@/components/ui/progress"

interface HypPaymentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  amount: number
  memberId: string
  memberName: string
  memberEmail?: string
  memberPhone?: string
  description?: string
  onPaymentSuccess: (paymentId: string) => void
  onPaymentCancel: () => void
}

export const HypPaymentModal: React.FC<HypPaymentModalProps> = ({
  open,
  onOpenChange,
  amount,
  memberId,
  memberName,
  memberEmail,
  memberPhone,
  description = "תשלום מנוי",
  onPaymentSuccess,
  onPaymentCancel,
}) => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [paymentUrl, setPaymentUrl] = useState<string | null>(null)
  const [paymentStatus, setPaymentStatus] = useState<"pending" | "success" | "failed" | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [iframeHeight, setIframeHeight] = useState(500)
  const [showFallback, setShowFallback] = useState(false)
  const [iframeError, setIframeError] = useState(false)
  const [checkingStatus, setCheckingStatus] = useState(false)
  const [statusCheckProgress, setStatusCheckProgress] = useState(0)
  const [showReceipt, setShowReceipt] = useState(false)
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

  const iframeRef = useRef<HTMLIFrameElement>(null)
  const statusCheckIntervalRef = useRef<number | null>(null)
  const statusCheckTimeoutRef = useRef<number | null>(null)

  // Initialize payment when modal opens
  useEffect(() => {
    if (open && !paymentUrl && !paymentStatus) {
      initializePayment()
    }

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
        setShowFallback(false)
        setIframeError(false)
        setCheckingStatus(false)
        setStatusCheckProgress(0)
        setShowReceipt(false)
        setReceiptUrl(null)
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

      const paymentResponse = await HypPaymentService.createPayment({
        amount,
        description,
        customerId: memberId,
        customerName: memberName,
        customerEmail: memberEmail,
        customerPhone: memberPhone,
        metadata: {
          memberId,
          memberName,
          description,
          source: "subscription_dialog",
        },
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      })

      setPaymentId(paymentResponse.id)
      setPaymentUrl(paymentResponse.paymentUrl || null)
      setPaymentStatus("pending")

      // Save payment record to Supabase
      await HypPaymentService.savePaymentRecord(memberId, paymentResponse, {
        description,
        memberName,
        memberEmail,
        memberPhone,
      })

      // Start status checking with progress
      startStatusChecking(paymentResponse.id)
    } catch (error) {
      console.error("Failed to initialize payment:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת התשלום. נסה שנית.",
        variant: "destructive",
      })

      // Show fallback option when HYP fails
      setShowFallback(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Start checking payment status with visual progress
  const startStatusChecking = (id: string) => {
    // Clear any existing interval
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current)
    }

    // Reset progress
    setStatusCheckProgress(0)
    setCheckingStatus(true)

    // Timeout after 2 minutes (120 seconds)
    const timeout = 120 * 1000
    const interval = 3000 // Check every 3 seconds
    const steps = timeout / interval
    let currentStep = 0

    // Set timeout to stop checking after timeout period
    statusCheckTimeoutRef.current = window.setTimeout(() => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
        statusCheckIntervalRef.current = null
      }

      // Only set to failed if still pending
      if (paymentStatus === "pending") {
        setPaymentStatus("failed")
        toast({
          title: "זמן התשלום הסתיים",
          description: "לא התקבל אישור לתשלום. נסה שנית או בחר אמצעי תשלום אחר.",
          variant: "destructive",
        })
      }

      setCheckingStatus(false)
    }, timeout)

    // Start interval for checking status
    statusCheckIntervalRef.current = window.setInterval(() => {
      currentStep++
      setStatusCheckProgress(Math.min((currentStep / steps) * 100, 100))

      checkPaymentStatus(id)
    }, interval)
  }

  // Check payment status
  const checkPaymentStatus = async (id: string) => {
    try {
      const { verified, status, data } = await HypPaymentService.verifyPayment(id)

      if (verified) {
        // Stop checking
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current)
        }
        if (statusCheckTimeoutRef.current) {
          clearTimeout(statusCheckTimeoutRef.current)
        }

        setPaymentStatus("success")
        setCheckingStatus(false)
        setStatusCheckProgress(100)

        // Update payment status in database
        await HypPaymentService.updatePaymentStatus(id, "paid", {
          payment_details: {
            ...data,
            transactionId: data?.transaction_id,
            referenceId: data?.reference_id,
          },
        })

        // Generate receipt URL
        const receiptUrl = await HypPaymentService.generateHypReceipt(id)
        setReceiptUrl(receiptUrl)

        toast({
          title: "התשלום הושלם בהצלחה",
          description: "התשלום עבור המנוי התקבל בהצלחה",
        })

        // Call success callback after a short delay
        setTimeout(() => {
          onPaymentSuccess(id)
        }, 2000)
      } else if (status === "failed" || status === "canceled") {
        // Stop checking
        if (statusCheckIntervalRef.current) {
          clearInterval(statusCheckIntervalRef.current)
        }
        if (statusCheckTimeoutRef.current) {
          clearTimeout(statusCheckTimeoutRef.current)
        }

        setPaymentStatus("failed")
        setCheckingStatus(false)

        await HypPaymentService.updatePaymentStatus(id, "failed")
        toast({
          title: "התשלום נכשל",
          description: "התשלום לא הושלם. נסה שנית או בחר אמצעי תשלום אחר.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Failed to check payment status:", error)
      // Don't set failed status here - we'll keep trying until timeout
    }
  }

  // Handle cancel
  const handleCancel = () => {
    if (paymentId) {
      HypPaymentService.updatePaymentStatus(paymentId, "canceled")
    }

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
            אירעה שגיאה בעת ביצוע התשלום. נסה שנית או בחר אמצעי תשלום אחר.
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
            אירעה שגיאה בהתחברות למערכת התשלומים. אנא נסה שנית או בחר אמצעי תשלום אחר.
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
          <DialogTitle>תשלום באמצעות HYP</DialogTitle>
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

export default HypPaymentModal
