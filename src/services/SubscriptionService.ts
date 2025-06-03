
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  member_id: string;
  membership_type: string;
  status: string;
  start_date: string;
  end_date: string;
  payment_status: string;
  created_at: string;
  updated_at: string;
}

export interface GroupSubscription {
  id: string;
  name: string;
  price_per_month: number;
  price_two_months: number;
  price_three_months: number;
  price_four_months: number;
  price_six_months: number;
  annual_price: number;
  is_active: boolean;
  schedule: any;
  organization_id: string;
  created_at: string;
  updated_at: string;
}

export interface PaymentDetails {
  payment_method: string;
  amount?: number;
  duration?: number;
  subscription_type?: string;
  cardDetails?: {
    cardNumber: string;
    expiryDate: string;
    cvv: string;
    cardHolderName: string;
  };
  checkDetails?: {
    checkNumber: string;
    bankName: string;
    accountNumber: string;
    checkDate?: string;
  };
  bankDetails?: {
    accountNumber: string;
    bankName: string;
    branchNumber: string;
    reference?: string;
    branch?: string;
  };
  hypDetails?: {
    paymentMethod: string;
    redirectUrl: string;
    paymentId?: string;
  };
  installments?: number;
  installmentAmount?: number;
  sendReceipt?: boolean;
  receiptEmail?: string;
  receiptUrl?: string;
  receiptNumber?: string;
}

export const SubscriptionService = {
  async getCurrentSubscription(): Promise<Subscription> {
    const { data, error } = await supabase
      .from('custom_memberships')
      .select('*')
      .eq('status', 'active')
      .single();

    if (error) throw error;
    return data;
  },

  async createSubscription(organizationId: string, tier: string): Promise<void> {
    const { error } = await supabase
      .from('custom_memberships')
      .insert([{
        organization_id: organizationId,
        membership_type: tier,
        status: 'active',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      }]);

    if (error) throw error;
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    const { error } = await supabase
      .from('custom_memberships')
      .update(updates)
      .eq('id', subscriptionId);

    if (error) throw error;
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    const { error } = await supabase
      .from('custom_memberships')
      .update({ status: 'cancelled' })
      .eq('id', subscriptionId);

    if (error) throw error;
  },

  async checkTrialStatus(organizationId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('organizations')
      .select('trial_ends_at')
      .eq('id', organizationId)
      .single();

    if (error) throw error;
    return new Date(data.trial_ends_at) > new Date();
  },

  async fetchGroupSubscriptions(organizationId?: string): Promise<GroupSubscription[]> {
    try {
      let query = supabase
        .from('group_subscriptions')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (organizationId) {
        query = query.eq('organization_id', organizationId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching group subscriptions:', error);
      return [];
    }
  },

  async addSubscription(memberId: string, subscriptionData: any, paymentDetails: PaymentDetails): Promise<void> {
    try {
      // Create the subscription
      const { data: subscription, error: subscriptionError } = await supabase
        .from('custom_memberships')
        .insert([{
          member_id: memberId,
          membership_type: subscriptionData.membershipType,
          start_date: subscriptionData.startDate,
          end_date: subscriptionData.endDate,
          status: 'active',
          payment_status: 'paid',
        }])
        .select()
        .single();

      if (subscriptionError) throw subscriptionError;

      // Create payment record with proper type conversion
      const paymentRecord = {
        member_id: memberId,
        amount: Number(subscriptionData.totalAmount),
        payment_method: paymentDetails.payment_method,
        status: 'paid',
        description: `${subscriptionData.membershipType} membership`,
        payment_details: paymentDetails as any, // Cast to any to satisfy Json type
      };

      const { error: paymentError } = await supabase
        .from('payments')
        .insert([paymentRecord]);

      if (paymentError) throw paymentError;

    } catch (error) {
      console.error('Error adding subscription:', error);
      throw error;
    }
  },
};
