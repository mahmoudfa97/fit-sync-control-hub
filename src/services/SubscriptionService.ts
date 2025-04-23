import { supabase } from "@/integrations/supabase/client"

export interface GroupSubscription {
  id: string
  name: string
  price_per_month: number
  price_two_months: number
  price_three_months: number
  price_four_months: number
  price_six_months: number
  annual_price: number
  is_active: boolean
  schedule?: ScheduleItem[]
}

export interface ScheduleItem {
  day: string
  start: number
  end: number
}

export interface PaymentDetails {
  paymentMethod: "hyp" | "cash" | "card" | "bank" | "check"
  amount: number
  cardDetails?: {
    cardNumber: string
    cardExpiry: string
    cardHolderName: string
  }
  bankDetails?: {
    bankName: string
    accountNumber: string
    branch: string
    reference: string
  }
  checkDetails?: {
    checkNumber: string
    checkDate: string
    bankName: string
  }
  hypDetails?: {
    paymentId: string
    transactionId?: string
    referenceId?: string
  }
  installmentAmount?: number
  installments?: number
  description?: string
  receiptNumber?: string
  receiptDate?: string
  receiptEmail?: string

  receiptAddress?: string
  receiptName?: string
  receiptCity?: string
  sendReceipt?: boolean
}

export interface SubscriptionData {
  membershipType: string
  subscriptionId: string
  status: "active" | "inactive" | "pending" | "expired"
  paymentStatus: "paid" | "pending" | "overdue" | "canceled"
  durationMonths: number
  paymentDetails: PaymentDetails
}

export class SubscriptionService {
  static async fetchGroupSubscriptions() {
    try {
      const { data, error } = await supabase.from("group_subscriptions").select("*").eq("is_active", true)

      if (error) throw error

      return (data || []).map((item) => ({
        ...item,
        schedule: typeof item.schedule === "string" ? JSON.parse(item.schedule) : item.schedule,
      })) as GroupSubscription[]
    } catch (error) {
      console.error("Error fetching group subscriptions:", error)
      throw error
    }
  }

  static async addSubscription(memberId: string, subscriptionData: SubscriptionData) {
    try {
      // First check if user is authenticated
      const { data: authData } = await supabase.auth.getSession()
      if (!authData.session) {
        throw new Error("Authentication required")
      }

      // Get subscription details from group_subscriptions
      const { data: subscriptionDetails, error: subscriptionError } = await supabase
        .from("group_subscriptions")
        .select("*")
        .eq("id", subscriptionData.subscriptionId)
        .single()

      if (subscriptionError) throw subscriptionError

      // Calculate start and end dates
      const startDate = new Date()
      const endDate = new Date(startDate)
      endDate.setMonth(startDate.getMonth() + subscriptionData.durationMonths)

      // Create payment data for the database
      const paymentData: any = {
        member_id: memberId,
        amount: subscriptionData.paymentDetails.amount,
        payment_method: subscriptionData.paymentDetails.paymentMethod,
        payment_date: new Date().toISOString(),
        description: `מנוי ${subscriptionData.membershipType} ל-${subscriptionData.durationMonths} חודשים`,
        status: subscriptionData.paymentStatus === "paid" ? "paid" : "pending",
      }

      // Add payment details with special handling for HYP
      if (subscriptionData.paymentDetails.paymentMethod === "hyp") {
        const hypDetails = subscriptionData.paymentDetails.hypDetails

        if (!hypDetails || !hypDetails.paymentId) {
          throw new Error("HYP payment details missing")
        }

        // For HYP payments, use more detailed metadata for better reporting
        paymentData.payment_details = {
          payment_method: "hyp",
          hyp_payment_id: hypDetails.paymentId,
          transactionId: hypDetails.transactionId,
          referenceId: hypDetails.referenceId,
          subscriptionData: {
            membershipType: subscriptionData.membershipType,
            subscriptionId: subscriptionData.subscriptionId,
            durationMonths: subscriptionData.durationMonths,
          },
        }
      } else {
        // For other payment methods, store all details
        paymentData.payment_details = subscriptionData.paymentDetails
      }

      // Add membership to custom_memberships
      const { data: membershipData, error: membershipError } = await supabase
        .from("custom_memberships")
        .insert({
          member_id: memberId,
          membership_type: subscriptionData.membershipType,
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: subscriptionData.status,
          payment_status: subscriptionData.paymentStatus,
        })
        .select()
        .single()

      if (membershipError) throw membershipError

      // Add payment record
      const { data: paymentResult, error: paymentError } = await supabase
        .from("payments")
        .insert(paymentData)
        .select()
        .single()

      if (paymentError) throw paymentError

      return {
        membership: membershipData,
        payment: paymentResult,
      }
    } catch (error) {
      console.error("Error adding subscription:", error)
      throw error
    }
  }

  static getSubscriptionPrice(subscription: GroupSubscription, durationMonths: number): number {
    switch (durationMonths) {
      case 1:
        return subscription.price_per_month
      case 2:
        return subscription.price_two_months
      case 3:
        return subscription.price_three_months
      case 4:
        return subscription.price_four_months
      case 6:
        return subscription.price_six_months
      case 12:
        return subscription.annual_price
      default:
        return subscription.price_per_month * durationMonths
    }
  }

  static async getMemberSubscriptions(memberId: string) {
    try {
      const { data, error } = await supabase
        .from("custom_memberships")
        .select(`
          id,
          membership_type,
          start_date,
          end_date,
          status,
          payment_status,
          created_at
        `)
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error fetching member subscriptions:", error)
      throw error
    }
  }

  static async getMemberPayments(memberId: string) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("member_id", memberId)
        .order("payment_date", { ascending: false })

      if (error) throw error

      // Process and format payment data
      return data.map((payment) => {
        // Ensure payment_details is always an object
        const paymentDetails = payment.payment_details || {}

        // Check if this is a HYP payment
        const isHypPayment = payment.payment_method === "hyp"

        return {
          ...payment,
          formatted_date: new Date(payment.payment_date).toLocaleDateString("he-IL"),
          is_hyp: isHypPayment,
          hyp_payment_id: isHypPayment ? paymentDetails.hyp_payment_id : null,
          transaction_id: isHypPayment ? paymentDetails.transactionId || paymentDetails.transaction_id : null,
          reference_id: isHypPayment ? paymentDetails.referenceId || paymentDetails.reference_id : null,
        }
      })
    } catch (error) {
      console.error("Error fetching member payments:", error)
      throw error
    }
  }

  static async getMemberCheckins(memberId: string) {
    try {
      const { data, error } = await supabase
        .from("custom_checkins")
        .select("*")
        .eq("member_id", memberId)
        .order("check_in_time", { ascending: false })

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error fetching member check-ins:", error)
      throw error
    }
  }

  // New method to get payment details by payment method
  static async getPaymentsByMethod(method: string, limit = 50) {
    try {
      const { data, error } = await supabase
        .from("payments")
        .select("*")
        .eq("payment_method", method)
        .order("payment_date", { ascending: false })
        .limit(limit)

      if (error) throw error

      return data
    } catch (error) {
      console.error(`Error fetching ${method} payments:`, error)
      throw error
    }
  }

  // New method to get all HYP payments
  static async getHypPayments(limit = 50) {
    return this.getPaymentsByMethod("hyp", limit)
  }
}
