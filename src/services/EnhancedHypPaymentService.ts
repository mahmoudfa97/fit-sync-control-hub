import { supabase } from "@/integrations/supabase/client"
import { v4 as uuidv4 } from "uuid"

// Define the HYP API response types based on official documentation
export interface HypSafeUrlResponse {
  success: boolean
  url: string
  secretTransactionId: string
  ksys_token: string
}

export interface HypValidationResponse {
  success: boolean
  cgp_id: string
  cgp_payment_total: number
  cgp_customer_cc_4_digits: string
  cgp_customer_cc_name: string
  cgp_ksys_transacion_id: string
  cgp_payment_date: string
  cgp_customer_name?: string
  cgp_customer_email?: string
  cgp_customer_phone?: string
}

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
  payments?: string // Number of payments, e.g., "1" or "3-12" for range
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
  secretTransactionId?: string
  customerDetails?: {
    email?: string
    name?: string
    phone?: string
  }
}

export interface HypReceiptResponse {
  success: boolean
  doc_url: string
  doc_id: string
  doc_number: string
}

// Create the Enhanced HYP Payment Service
export const EnhancedHypPaymentService = {
  /**
   * Create a new secure payment URL with HYP
   */
  async createSecurePayment(request: HypPaymentRequest): Promise<HypPaymentResponse> {
    try {
      console.log("Creating secure HYP payment:", request)

      // Direct fetch to the Edge Function to bypass Supabase client issues
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyp-create-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          amount: request.amount,
          currency: request.currency || "ILS",
          description: request.description || "מנוי למועדון כושר",
          customerId: request.customerId,
          customerName: request.customerName,
          customerEmail: request.customerEmail,
          customerPhone: request.customerPhone,
          metadata: request.metadata,
          successUrl: request.successUrl || window.location.origin + "/payment/success",
          cancelUrl: request.cancelUrl || window.location.origin + "/payment/cancel",
          payments: request.payments || "1",
        }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        console.error("Edge Function error response:", data)

        // Handle specific HYP API errors
        if (data.errNum === 200 && data.errMsg?.includes("API_CLEARING")) {
          throw new Error("שגיאת הרשאות HYP: נדרש להפעיל את תכונת API_CLEARING. אנא פנה לתמיכה של HYP.")
        }

        throw new Error(data.errMsg || data.error || "שגיאה ביצירת תשלום")
      }

      if (!data) {
        console.error("No data returned from Edge Function")
        throw new Error("No data returned from payment service")
      }

      console.log("Payment URL created successfully:", data)

      // Store the secretTransactionId in localStorage for validation later
      if (data.secretTransactionId) {
        localStorage.setItem("hyp_transaction_id", data.secretTransactionId)
      }

      // Generate a unique ID for our internal tracking
      const paymentId = uuidv4()
      localStorage.setItem("hyp_payment_id", paymentId)

      // Store customer details for receipt generation
      if (request.customerName) localStorage.setItem("customer_name", request.customerName)
      if (request.customerEmail) localStorage.setItem("customer_email", request.customerEmail)
      if (request.customerPhone) localStorage.setItem("customer_phone", request.customerPhone)
      if (request.description) localStorage.setItem("payment_description", request.description)

      // Create a payment response object but DON'T save to database yet
      // We'll only save successful payments to the database
      const paymentResponse = {
        id: paymentId,
        status: "pending" as const,
        amount: request.amount,
        currency: request.currency || "ILS",
        paymentUrl: data.url,
        createdAt: new Date().toISOString(),
        secretTransactionId: data.secretTransactionId,
        customerDetails: {
          name: request.customerName,
          email: request.customerEmail,
          phone: request.customerPhone,
        },
      }

      // Store payment details in localStorage for later use
      localStorage.setItem(
        "hyp_payment_details",
        JSON.stringify({
          id: paymentId,
          customerId: request.customerId || "",
          amount: request.amount,
          currency: request.currency || "ILS",
          description: request.description,
          metadata: request.metadata,
          createdAt: new Date().toISOString(),
          secretTransactionId: data.secretTransactionId,
          customerDetails: {
            name: request.customerName,
            email: request.customerEmail,
            phone: request.customerPhone,
          },
        }),
      )

      return paymentResponse
    } catch (error) {
      console.error("Error creating secure HYP payment:", error)
      throw error
    }
  },

  /**
   * Validate a payment using the secretTransactionId
   */
  async validatePayment(secretTransactionId: string): Promise<HypValidationResponse> {
    try {
      // Direct fetch to the Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyp-validate-payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ secretTransactionId }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Handle specific HYP API errors
        if (data.errNum === 200 && data.errMsg?.includes("API_CLEARING")) {
          throw new Error("שגיאת הרשאות HYP: נדרש להפעיל את תכונת API_CLEARING. אנא פנה לתמיכה של HYP.")
        }

        throw new Error(data.errMsg || data.error || "שגיאה באימות התשלום")
      }

      return data
    } catch (error) {
      console.error("Error validating HYP payment:", error)
      throw error
    }
  },

  /**
   * Generate an invoice/receipt for a completed payment
   */
  async generateReceipt(
    validationData: HypValidationResponse,
    customerDetails: {
      name: string
      email: string
      address?: string
    },
    description: string,
  ): Promise<HypReceiptResponse> {
    try {
      // Direct fetch to the Edge Function
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/hyp-create-receipt`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ validationData, customerDetails, description }),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        // Handle specific HYP API errors
        if (data.errNum === 200) {
          throw new Error(`שגיאת HYP: ${data.errMsg}. אנא פנה לתמיכה של HYP.`)
        }

        throw new Error(data.errMsg || data.error || "שגיאה ביצירת קבלה")
      }

      return data
    } catch (error) {
      console.error("Error generating HYP receipt:", error)
      throw error
    }
  },

  // Rest of the service methods remain unchanged
  async savePaymentRecord(memberId: string, paymentResponse: HypPaymentResponse, metadata: any = {}): Promise<string> {
    try {
      const paymentId = paymentResponse.id || uuidv4()
      const receiptNumber = `REC-HYP-${Date.now().toString().slice(-6)}`

      // Merge metadata with payment response details for better tracking
      const fullMetadata = {
        ...metadata,
        hyp_payment_id: paymentId,
        hyp_status: paymentResponse.status,
        hyp_reference_id: paymentResponse.referenceId,
        hyp_transaction_id: paymentResponse.transactionId,
        hyp_secret_transaction_id: paymentResponse.secretTransactionId,
        payment_details: {
          payment_method: "hyp",
          amount: paymentResponse.amount,
          currency: paymentResponse.currency,
          hypDetails: {
            paymentId: paymentId,
            transactionId: paymentResponse.transactionId,
            referenceId: paymentResponse.referenceId,
            secretTransactionId: paymentResponse.secretTransactionId,
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
        payment_details: fullMetadata,
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

  async updatePaymentStatus(paymentId: string, status: string, additionalData: any = {}): Promise<void> {
    try {
      const { error } = await supabase
        .from("payments")
        .update({
          status,
          ...additionalData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", paymentId)

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error updating payment status:", error)
      throw error
    }
  },

  async handlePaymentSuccess(
    secretTransactionId: string,
    paymentId: string,
    customerDetails: {
      name: string
      email: string
      address?: string
    },
    description: string,
  ): Promise<{
    success: boolean
    receiptUrl?: string
    validationData?: HypValidationResponse
  }> {
    try {
      // Validate the payment
      const validationData = await this.validatePayment(secretTransactionId)

      if (!validationData.success) {
        throw new Error("Payment validation failed")
      }

      // Get stored payment details from localStorage
      const paymentDetailsStr = localStorage.getItem("hyp_payment_details")
      if (!paymentDetailsStr) {
        throw new Error("Payment details not found")
      }

      const paymentDetails = JSON.parse(paymentDetailsStr)

      // NOW save the payment record to the database since it was successful
      await this.savePaymentRecord(
        paymentDetails.customerId || "",
        {
          id: paymentId,
          status: "completed",
          amount: paymentDetails.amount,
          currency: paymentDetails.currency || "ILS",
          createdAt: paymentDetails.createdAt,
          secretTransactionId: secretTransactionId,
          customerDetails: paymentDetails.customerDetails,
          transactionId: validationData.cgp_ksys_transacion_id,
        },
        {
          description: paymentDetails.description,
          metadata: paymentDetails.metadata,
        },
      )

      // Generate receipt
      const receiptResponse = await this.generateReceipt(validationData, customerDetails, description)

      // Update payment with receipt info
      await this.updatePaymentStatus(paymentId, "paid", {
        payment_details: {
          validation_data: validationData,
          receipt_url: receiptResponse.doc_url,
          receipt_id: receiptResponse.doc_id,
          receipt_number: receiptResponse.doc_number,
        },
      })

      // Clear the stored payment details
      localStorage.removeItem("hyp_payment_details")

      return {
        success: true,
        receiptUrl: receiptResponse.doc_url,
        validationData,
      }
    } catch (error) {
      console.error("Error handling payment success:", error)

      // Don't update payment status in the database since we're not saving failed payments

      throw error
    }
  },

  async getReceiptUrl(paymentId: string): Promise<string | null> {
    try {
      const { data, error } = await supabase.from("payments").select("payment_details").eq("id", paymentId).single()

      if (error || !data) {
        throw error
      }

      return data.payment_details?.receipt_url || data.payment_details?.validation_data?.receipt_url || null
    } catch (error) {
      console.error("Error getting receipt URL:", error)
      return null
    }
  },

  async getMemberPayments(memberId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .order("payment_date", { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error fetching member's payments:", error)
      throw error
    }
  },

  async getPaymentById(paymentId: string): Promise<HypPaymentResponse | null> {
    try {
      const { data, error } = await supabase.from("payments").select("*").eq("id", paymentId).single()

      if (error || !data) {
        throw error
      }

      // Convert database record to HypPaymentResponse format
      return {
        id: data.id,
        status: data.status as "pending" | "completed" | "failed" | "canceled",
        amount: data.amount,
        currency: data.currency || "ILS",
        createdAt: data.payment_date,
        secretTransactionId: data.payment_details?.hyp_secret_transaction_id,
        transactionId: data.payment_details?.hyp_transaction_id,
        referenceId: data.payment_details?.hyp_reference_id,
        customerDetails: data.payment_details?.customer,
      }
    } catch (error) {
      console.error("Error getting payment by ID:", error)
      return null
    }
  },

  /**
   * Check payment status directly with HYP API
   * This is useful for verifying payment status when the redirect flow fails
   */
  async checkPaymentStatus(secretTransactionId: string): Promise<{
    success: boolean
    status: string
    validationData?: HypValidationResponse
  }> {
    try {
      const validationData = await this.validatePayment(secretTransactionId)

      if (!validationData.success) {
        return { success: false, status: "failed" }
      }

      return {
        success: true,
        status: "completed",
        validationData,
      }
    } catch (error) {
      console.error("Error checking payment status:", error)
      return { success: false, status: "error" }
    }
  },

  /**
   * Create a payment link that can be sent via email or SMS
   */
  async createPaymentLink(request: HypPaymentRequest): Promise<{
    success: boolean
    paymentUrl?: string
    paymentId?: string
  }> {
    try {
      const paymentResponse = await this.createSecurePayment({
        ...request,
        // Force success/cancel URLs to be absolute
        successUrl: `${window.location.origin}/payment/success`,
        cancelUrl: `${window.location.origin}/payment/cancel`,
      })

      return {
        success: true,
        paymentUrl: paymentResponse.paymentUrl,
        paymentId: paymentResponse.id,
      }
    } catch (error) {
      console.error("Error creating payment link:", error)
      return { success: false }
    }
  },
}

export default EnhancedHypPaymentService
