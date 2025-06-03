
// HYP Payment Service Types and Interfaces

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
