
import { supabase } from "@/integrations/supabase/client"
import { v4 as uuidv4 } from "uuid"
import { HypPaymentResponse } from "./types"

export const HypDatabase = {
  /**
   * Save payment record to Supabase with better integration
   */
  async savePaymentRecord(memberId: string, paymentResponse: HypPaymentResponse, metadata: any = {}): Promise<string> {
    try {
      const paymentId = uuidv4()
      const receiptNumber = `REC-HYP-${Date.now().toString().slice(-6)}`

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

  /**
   * Update payment status in Supabase with more details
   */
  async updatePaymentStatus(paymentId: string, status: string, additionalData: any = {}): Promise<void> {
    try {
      const updateData = {
        status,
        updated_at: new Date().toISOString(),
        ...additionalData
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
}
