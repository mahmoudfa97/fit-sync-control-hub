
import { HypPaymentRequest, HypPaymentResponse } from "./types"

// Define the HYP API endpoints and credentials
const HYP_API_KEY = import.meta.env.VITE_HYP_API_KEY
const HYP_MERCHANT_ID = import.meta.env.VITE_HYP_MERCHANT_ID
const HYP_API_ENDPOINT = import.meta.env.VITE_HYP_API_ENDPOINT

export const HypApiClient = {
  /**
   * Create a new payment intent with HYP
   */
  async createPayment(request: HypPaymentRequest): Promise<HypPaymentResponse> {
    try {
      console.log("Creating HYP payment:", request)

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
   * Verify payment status with HYP with enhanced error handling
   */
  async verifyPayment(paymentId: string): Promise<{ verified: boolean; status: string; data?: any }> {
    try {
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
          await new Promise((resolve) => setTimeout(resolve, 1000 * Math.pow(2, retryCount - 1)))
        }
      }

      console.error("All verification retries failed:", lastError)
      throw lastError
    } catch (error) {
      console.error("Error verifying HYP payment:", error)
      throw error
    }
  },
}
