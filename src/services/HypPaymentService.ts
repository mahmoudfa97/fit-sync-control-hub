
import { supabase } from "@/integrations/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Define the HYP API endpoints and credentials
const HYP_API_KEY = import.meta.env.VITE_HYP_API_KEY
const HYP_MERCHANT_ID = import.meta.env.VITE_HYP_MERCHANT_ID
const HYP_API_ENDPOINT = import.meta.env.VITE_HYP_API_ENDPOINT
const HYP_ENVIRONMENT = import.meta.env.VITE_HYP_ENVIRONMENT || "development"

// Payment interface types
export interface HypPaymentRequest {
  amount: number
  currency?: string
  description?: string
  customerId?: string
  customerEmail?: string
  customerName?: string
  customerPhone?: string
  metadata?: Record<string, any>
  successUrl?: string
  cancelUrl?: string
  paymentMethod?: "card" | "bit" | "paybox" | "apple_pay" | "google_pay"
}

export interface HypPaymentResponse {
  id: string
  status: "pending" | "completed" | "failed" | "canceled"
  amount: number
  currency: string
  paymentUrl?: string
  redirectUrl?: string
  createdAt: string
  referenceId?: string
  transactionId?: string
  customerDetails?: {
    email?: string
    name?: string
    phone?: string
  }
}

export interface HypPaymentRecord {
  id: string
  payment_id: string
  member_id: string
  amount: number
  status: string
  payment_method: string
  payment_date: string
  description?: string
  receipt_number?: string
  transaction_id?: string
  reference_id?: string
  metadata?: any
}

// Create the HYP Payment Service
export const HypPaymentService = {
  /**
   * Create a new payment intent with HYP
   */
  async createPayment(request: HypPaymentRequest): Promise<HypPaymentResponse> {
    try {
      console.log("Creating HYP payment:", request)

      // Add some default values for better tracking
      const metadata = {
        source: "gym_management_system",
        platform: "web",
        version: "1.0",
        ...request.metadata,
      }

      const response = await fetch(`${HYP_API_ENDPOINT}/v1/payments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${HYP_API_KEY}`,
          "X-Merchant-Id": HYP_MERCHANT_ID,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || "ILS",
          description: request.description || "מנוי למועדון כושר",
          customer: {
            id: request.customerId,
            email: request.customerEmail,
            name: request.customerName,
            phone: request.customerPhone,
          },
          metadata,
          success_url: request.successUrl || window.location.origin + "/payment/success",
          cancel_url: request.cancelUrl || window.location.origin + "/payment/cancel",
          payment_method: request.paymentMethod || "card",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "שגיאה ביצירת תשלום")
      }

      const data = await response.json()

      return {
        id: data.id,
        status: data.status,
        amount: data.amount,
        currency: data.currency,
        paymentUrl: data.payment_url,
        redirectUrl: data.redirect_url,
        createdAt: data.created_at,
        referenceId: data.reference_id,
        transactionId: data.transaction_id,
        customerDetails: data.customer,
      }
    } catch (error) {
      console.error("Error creating HYP payment:", error)
      throw error
    }
  },

  /**
   * Save payment record to Supabase with better integration
   */
  async savePaymentRecord(memberId: string, paymentResponse: HypPaymentResponse, metadata: any = {}): Promise<string> {
    try {
      const paymentId = uuidv4()
      const receiptNumber = `REC-HYP-${Date.now().toString().slice(-6)}`

      // Merge metadata with payment response details for better tracking
      const fullMetadata = {
        ...metadata,
        hyp_payment_id: paymentResponse.id,
        hyp_status: paymentResponse.status,
        hyp_reference_id: paymentResponse.referenceId,
        hyp_transaction_id: paymentResponse.transactionId,
        payment_details: {
          payment_method: "hyp",
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          hypDetails: {
            paymentId: paymentResponse.id,
            transactionId: paymentResponse.transactionId,
            referenceId: paymentResponse.referenceId,
          },
        },
        customer: paymentResponse.customerDetails,
      }

      const paymentDate = new Date().toISOString()

      // Update the payments table with consistent data format
      const { error } = await supabase.from("payments").insert({
        id: paymentId,
        member_id: memberId,
        amount: paymentResponse.amount,
        payment_method: "hyp",
        payment_date: paymentDate,
        status: paymentResponse.status === "completed" ? "paid" : "pending",
        description: metadata.description || "תשלום באמצעות HYP",
        receipt_number: receiptNumber,
        payment_details: fullMetadata as any,
      })

      if (error) {
        console.error("Error inserting payment record:", error)
        throw error
      }

      return paymentId
    } catch (error) {
      console.error("Error saving payment record:", error)
      throw error
    }
  },

  /**
   * Verify payment status with HYP with enhanced error handling
   */
  async verifyPayment(paymentId: string): Promise<{ verified: boolean; status: string; data?: any }> {
    try {
      // Add exponential backoff for retries
      const maxRetries = 3
      let retryCount = 0
      let lastError: any = null

      while (retryCount < maxRetries) {
        try {
          const response = await fetch(`${HYP_API_ENDPOINT}/v1/payments/${paymentId}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${HYP_API_KEY}`,
              "X-Merchant-Id": HYP_MERCHANT_ID,
            },
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.message || "שגיאה באימות תשלום")
          }

          const data = await response.json()
          return {
            verified: data.status === "completed",
            status: data.status,
            data,
          }
        } catch (error) {
          lastError = error
          retryCount++
          // Exponential backoff: wait longer between each retry
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)))
        }
      }

      // If we get here, all retries failed
      console.error("All verification retries failed:", lastError)
      throw lastError
    } catch (error) {
      console.error("Error verifying HYP payment:", error)
      throw error
    }
  },

  /**
   * Update payment status in Supabase with more details
   */
  async updatePaymentStatus(paymentId: string, status: string, additionalData: any = {}): Promise<void> {
    try {
      // Update main payments table - simplified to avoid type issues
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData,
      }

      const { error } = await supabase
        .from("payments")
        .update(updateData)
        .eq("id", paymentId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  },

  /**
   * Get HYP payment details by ID
   */
  async getHypPaymentById(hypPaymentId: string): Promise<any> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("payment_details->hyp_payment_id", hypPaymentId)
        .single()

      if (error) {
        throw error
      }

      return data
    } catch (error) {
      console.error("Error fetching HYP payment:", error)
      throw error
    }
  },

  /**
   * Get member's HYP payments
   */
  async getMemberHypPayments(memberId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .eq("payment_method", "hyp")
        .order("payment_date", { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error fetching member's HYP payments:", error)
      throw error
    }
  },

  /**
   * Generate payment receipt with HYP branding
   */
  async generateHypReceipt(paymentId: string): Promise<string> {
    try {
      // This would typically call your receipt generation service
      // For now, just return a placeholder URL
      return `/receipts/hyp-${paymentId}.pdf`
    } catch (error) {
      console.error("Error generating HYP receipt:", error)
      throw error
    }
  },
}

export default HypPaymentService
