
import { supabase } from '@/integrations/supabase/client';
import { OrganizationAwareService } from './OrganizationAwareService';

export interface Payment {
  id: string;
  amount: number;
  payment_method: string;
  status: string;
  payment_date: string;
  member_id: string;
  description?: string;
  organization_id?: string;
}

export interface PaymentMethod {
  id: string;
  user_id: string;
  payment_type: string;
  provider?: string;
  last_four?: string;
  card_holder_name?: string;
  expiry_date?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface PaymentMethodFormData {
  paymentType: 'card' | 'bank' | 'other';
  cardNumber?: string;
  expiryDate?: string;
  cvv?: string;
  cardHolderName?: string;
  provider?: string;
  isDefault: boolean;
}

export const PaymentService = {
  async fetchPayments(): Promise<Payment[]> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('organization_id', organizationId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching payments:', error);
      return [];
    }
  },

  async createPayment(payment: Omit<Payment, 'id' | 'organization_id'>): Promise<Payment> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from('payments')
        .insert([{
          ...payment,
          organization_id: organizationId
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  },

  async addPaymentMethod(paymentMethodData: PaymentMethodFormData): Promise<PaymentMethod> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('payment_methods')
        .insert([{
          user_id: session.session.user.id,
          payment_type: paymentMethodData.paymentType,
          provider: paymentMethodData.provider,
          last_four: paymentMethodData.cardNumber?.slice(-4),
          card_holder_name: paymentMethodData.cardHolderName,
          expiry_date: paymentMethodData.expiryDate,
          is_default: paymentMethodData.isDefault,
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding payment method:', error);
      throw error;
    }
  }
};
