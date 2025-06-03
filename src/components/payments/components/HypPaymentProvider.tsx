"use client"

import React, { createContext, useContext, useRef, useEffect } from "react"
import HypPaymentService from "@/services/HypPaymentService"

interface HypPaymentContextType {
  startStatusChecking: (paymentId: string) => void
  stopStatusChecking: () => void
  checkingStatus: boolean
  statusCheckProgress: number
}

const HypPaymentContext = createContext<HypPaymentContextType | undefined>(undefined)

export const useHypPayment = () => {
  const context = useContext(HypPaymentContext)
  if (!context) {
    throw new Error("useHypPayment must be used within HypPaymentProvider")
  }
  return context
}

interface HypPaymentProviderProps {
  children: React.ReactNode
  paymentId: string | null
  paymentUrl: string | null
  paymentStatus: "pending" | "success" | "failed" | null
  receiptUrl: string | null
  onPaymentSuccess: (paymentId: string) => void
  onPaymentFailed: () => void
}

export const HypPaymentProvider: React.FC<HypPaymentProviderProps> = ({
  children,
  paymentId,
  paymentStatus,
  onPaymentSuccess,
  onPaymentFailed,
}) => {
  const [checkingStatus, setCheckingStatus] = React.useState(false)
  const [statusCheckProgress, setStatusCheckProgress] = React.useState(0)
  const statusCheckIntervalRef = useRef<number | null>(null)
  const statusCheckTimeoutRef = useRef<number | null>(null)

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (statusCheckIntervalRef.current) {
        clearInterval(statusCheckIntervalRef.current)
      }
      if (statusCheckTimeoutRef.current) {
        clearTimeout(statusCheckTimeoutRef.current)
      }
    }
  }, [])

  // Auto-start status checking when payment is pending
  useEffect(() => {
    if (paymentId && paymentStatus === "pending") {
      startStatusChecking(paymentId)
    }
  }, [paymentId, paymentStatus])

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
        onPaymentFailed()
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

  const stopStatusChecking = () => {
    if (statusCheckIntervalRef.current) {
      clearInterval(statusCheckIntervalRef.current)
      statusCheckIntervalRef.current = null
    }
    if (statusCheckTimeoutRef.current) {
      clearTimeout(statusCheckTimeoutRef.current)
      statusCheckTimeoutRef.current = null
    }
    setCheckingStatus(false)
  }

  // Check payment status
  const checkPaymentStatus = async (id: string) => {
    try {
      const { verified, status, data } = await HypPaymentService.verifyPayment(id)

      if (verified) {
        // Stop checking
        stopStatusChecking()
        setStatusCheckProgress(100)

        // Update payment status in database
        await HypPaymentService.updatePaymentStatus(id, "paid", {
          payment_details: {
            ...data,
            transactionId: data?.transaction_id,
            referenceId: data?.reference_id,
          },
        })

        onPaymentSuccess(id)
      } else if (status === "failed" || status === "canceled") {
        // Stop checking
        stopStatusChecking()
        await HypPaymentService.updatePaymentStatus(id, "failed")
        onPaymentFailed()
      }
    } catch (error) {
      console.error("Failed to check payment status:", error)
      // Don't set failed status here - we'll keep trying until timeout
    }
  }

  const contextValue: HypPaymentContextType = {
    startStatusChecking,
    stopStatusChecking,
    checkingStatus,
    statusCheckProgress,
  }

  return (
    <HypPaymentContext.Provider value={contextValue}>
      {children}
    </HypPaymentContext.Provider>
  )
}
