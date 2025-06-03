
"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import HypPaymentService from "@/services/HypPaymentService"
import { HypPaymentProvider } from "./components/HypPaymentProvider"
import { HypPaymentContent } from "./components/HypPaymentContent"

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
  const [receiptUrl, setReceiptUrl] = useState<string | null>(null)

  // Initialize payment when modal opens
  useEffect(() => {
    if (open && !paymentUrl && !paymentStatus) {
      initializePayment()
    }

    // Reset state when modal closes
    if (!open) {
      setTimeout(() => {
        setPaymentUrl(null)
        setPaymentStatus(null)
        setPaymentId(null)
        setReceiptUrl(null)
      }, 300)
    }
  }, [open])

  // Initialize payment
  const initializePayment = async () => {
    try {
      setIsLoading(true)

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

    } catch (error) {
      console.error("Failed to initialize payment:", error)
      toast({
        title: "שגיאה",
        description: "אירעה שגיאה בעת יצירת התשלום. נסה שנית.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async (id: string) => {
    setPaymentStatus("success")
    
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
  }

  const handlePaymentFailed = () => {
    setPaymentStatus("failed")
    toast({
      title: "התשלום נכשל",
      description: "התשלום לא הושלם. נסה שנית או בחר אמצעי תשלום אחר.",
      variant: "destructive",
    })
  }

  // Handle cancel
  const handleCancel = () => {
    if (paymentId) {
      HypPaymentService.updatePaymentStatus(paymentId, "canceled")
    }

    onPaymentCancel()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>תשלום באמצעות HYP</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <HypPaymentProvider
            paymentId={paymentId}
            paymentUrl={paymentUrl}
            paymentStatus={paymentStatus}
            receiptUrl={receiptUrl}
            onPaymentSuccess={handlePaymentSuccess}
            onPaymentFailed={handlePaymentFailed}
          >
            <HypPaymentContent
              isLoading={isLoading}
              paymentStatus={paymentStatus}
              paymentUrl={paymentUrl}
              receiptUrl={receiptUrl}
              onRetry={initializePayment}
            />
          </HypPaymentProvider>
        </div>

        <DialogFooter>
          {paymentStatus !== "success" && (
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
