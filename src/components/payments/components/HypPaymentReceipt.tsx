
"use client"

import React from "react"
import { ChevronLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HypPaymentReceiptProps {
  receiptUrl: string
  onBack: () => void
}

export const HypPaymentReceipt: React.FC<HypPaymentReceiptProps> = ({
  receiptUrl,
  onBack,
}) => {
  return (
    <div className="flex flex-col">
      <div className="mb-4">
        <Button variant="outline" size="sm" className="flex items-center" onClick={onBack}>
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
