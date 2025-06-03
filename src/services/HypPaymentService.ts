
import { HypApiClient } from "./hyp/api"
import { HypDatabase } from "./hyp/database"
import { HypReceipts } from "./hyp/receipts"
import { HypPaymentRequest, HypPaymentResponse, HypPaymentRecord } from "./hyp/types"

// Re-export types for backward compatibility
export type { HypPaymentRequest, HypPaymentResponse, HypPaymentRecord }

// Create the HYP Payment Service
export const HypPaymentService = {
  /**
   * Create a new payment intent with HYP
   */
  async createPayment(request: HypPaymentRequest): Promise<HypPaymentResponse> {
    return HypApiClient.createPayment(request)
  },

  /**
   * Save payment record to Supabase with better integration
   */
  async savePaymentRecord(memberId: string, paymentResponse: HypPaymentResponse, metadata: any = {}): Promise<string> {
    return HypDatabase.savePaymentRecord(memberId, paymentResponse, metadata)
  },

  /**
   * Verify payment status with HYP with enhanced error handling
   */
  async verifyPayment(paymentId: string): Promise<{ verified: boolean; status: string; data?: any }> {
    return HypApiClient.verifyPayment(paymentId)
  },

  /**
   * Update payment status in Supabase with more details
   */
  async updatePaymentStatus(paymentId: string, status: string, additionalData: any = {}): Promise<void> {
    return HypDatabase.updatePaymentStatus(paymentId, status, additionalData)
  },

  /**
   * Get HYP payment details by ID
   */
  async getHypPaymentById(hypPaymentId: string): Promise<any> {
    return HypDatabase.getHypPaymentById(hypPaymentId)
  },

  /**
   * Get member's HYP payments
   */
  async getMemberHypPayments(memberId: string): Promise<any[]> {
    return HypDatabase.getMemberHypPayments(memberId)
  },

  /**
   * Generate payment receipt with HYP branding
   */
  async generateHypReceipt(paymentId: string): Promise<string> {
    return HypReceipts.generateHypReceipt(paymentId)
  },
}

export default HypPaymentService
