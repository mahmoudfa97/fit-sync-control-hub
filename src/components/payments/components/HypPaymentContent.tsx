
"use client"

import React, { useState } from "react"
import { Loader2, CheckCircle, XCircle, AlertTriangle, ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { HypPaymentFrame } from "./HypPaymentFrame"
import { HypPaymentReceipt } from "./HypPaymentReceipt"
import { HypPaymentStatusProgress } from "./HypPaymentStatusProgress"

interface HypPaymentContentProps {
  isLoading: boolean
  paymentStatus: "pending" | "success" | "failed" | null
  paymentUrl: string | null
  receiptUrl: string | null
  onRetry: () => void
}

export const HypPaymentContent: React.FC<HypPaymentContentProps> = ({
  isLoading,
  paymentStatus,
  paymentUrl,
  receiptUrl,
  onRetry,
}) => {
  const [showReceipt, setShowReceipt] = useState(false)
  const [showFallback, setShowFallback] = useState(false)

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
      <HypPaymentReceipt
        receiptUrl={receiptUrl}
        onBack={() => setShowReceipt(false)}
      />
    )
  }

  if (paymentStatus === "success") {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
        <h3 className="text-xl font-semibold mb-2">התשלום הושלם בהצלחה!</h3>
        <p className="text-center text-gray-600 mb-4">התשלום עבור המנוי התקבל בהצלחה. תודה!</p>
        <div className="flex gap-3">
          {receiptUrl && (
            <Button onClick={() => setShowReceipt(true)}>צפה בקבלה</Button>
          )}
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
          <Button onClick={onRetry}>נסה שנית</Button>
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
          <Button onClick={onRetry}>נסה שנית</Button>
        </div>
      </div>
    )
  }

  if (paymentUrl) {
    return (
      <div className="flex flex-col">
        <HypPaymentStatusProgress />
        <HypPaymentFrame
          paymentUrl={paymentUrl}
          onError={() => setShowFallback(true)}
        />
      </div>
    )
  }

  return null
}
