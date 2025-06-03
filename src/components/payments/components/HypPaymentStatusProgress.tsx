
"use client"

import React from "react"
import { Progress } from "@/components/ui/progress"
import { useHypPayment } from "./HypPaymentProvider"

export const HypPaymentStatusProgress: React.FC = () => {
  const { checkingStatus, statusCheckProgress } = useHypPayment()

  if (!checkingStatus) {
    return null
  }

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-gray-500">בודק סטטוס תשלום...</span>
        <span className="text-sm text-gray-500">{Math.round(statusCheckProgress)}%</span>
      </div>
      <Progress value={statusCheckProgress} className="h-2" />
    </div>
  )
}
