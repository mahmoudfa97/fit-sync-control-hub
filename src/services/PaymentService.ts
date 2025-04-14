
import { supabase } from "@/integrations/supabase/client";
import { Payment } from "@/store/slices/paymentsSlice";

export interface PaymentMethod {
  id: string;
  userId: string;
  paymentType: 'card' | 'cash' | 'bank' | 'other';
  provider?: 'visa' | 'mastercard' | 'other';
  lastFour?: string;
  cardHolderName?: string;
  expiryDate?: string;
  isDefault?: boolean;
  createdAt: string;
}

export class PaymentService {
  static async getPaymentMethods() {
    const { data, error } = await supabase
      .from('payment_methods')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      userId: item.user_id,
      paymentType: item.payment_type,
      provider: item.provider,
      lastFour: item.last_four,
      cardHolderName: item.card_holder_name,
      expiryDate: item.expiry_date,
      isDefault: item.is_default,
      createdAt: item.created_at
    })) as PaymentMethod[];
  }

  static async addPaymentMethod(paymentMethod: Omit<PaymentMethod, 'id' | 'userId' | 'createdAt'>) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    const { data, error } = await supabase
      .from('payment_methods')
      .insert({
        user_id: user.user.id,
        payment_type: paymentMethod.paymentType,
        provider: paymentMethod.provider,
        last_four: paymentMethod.lastFour,
        card_holder_name: paymentMethod.cardHolderName,
        expiry_date: paymentMethod.expiryDate,
        is_default: paymentMethod.isDefault || false
      })
      .select('*')
      .single();

    if (error) {
      throw error;
    }

    return {
      id: data.id,
      userId: data.user_id,
      paymentType: data.payment_type,
      provider: data.provider,
      lastFour: data.last_four,
      cardHolderName: data.card_holder_name,
      expiryDate: data.expiry_date,
      isDefault: data.is_default,
      createdAt: data.created_at
    } as PaymentMethod;
  }

  static async processPayment(memberId: string, amount: number, paymentMethod: string, description?: string) {
    const { data: user } = await supabase.auth.getUser();
    
    if (!user.user) {
      throw new Error('User not authenticated');
    }

    let paymentMethodId = null;
    if (paymentMethod !== 'cash') {
      // Fetch payment method details
      const { data, error } = await supabase
        .from('payment_methods')
        .select('id')
        .eq('id', paymentMethod)
        .single();

      if (error) {
        throw error;
      }
      paymentMethodId = data.id;
    }

    // Generate receipt number
    const receiptNumber = `REC-${Date.now().toString().slice(-6)}`;

    // Add payment to database
    const { data, error } = await supabase
      .from('payments')
      .insert({
        member_id: memberId,
        amount: amount,
        payment_method: paymentMethod === 'card' ? 'card' : (paymentMethod === 'cash' ? 'cash' : 'bank'),
        payment_method_id: paymentMethodId,
        description: description || 'Membership payment',
        receipt_number: receiptNumber,
        status: 'paid'
      })
      .select(`
        id,
        member_id,
        amount,
        payment_method,
        payment_date,
        description,
        receipt_number,
        status,
        profiles:member_id(name, last_name)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Format the payment for the redux store
    return {
      id: data.id,
      memberId: data.member_id,
      memberName: data.profiles ? `${data.profiles.name} ${data.profiles.last_name || ''}` : 'Unknown',
      memberInitials: data.profiles ? `${data.profiles.name[0]}${data.profiles.last_name ? data.profiles.last_name[0] : ''}` : 'UN',
      amount: data.amount,
      currency: '₪',
      paymentMethod: data.payment_method,
      paymentDate: new Date(data.payment_date).toLocaleDateString('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }),
      status: data.status,
      description: data.description,
      receiptNumber: data.receipt_number
    } as Payment;
  }
}
