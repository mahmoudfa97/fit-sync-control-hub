
import { supabase } from '@/integrations/supabase/client';

export interface Subscription {
  id: string;
  user_id: string;
  organization_id: string;
  email: string;
  stripe_customer_id?: string;
  subscribed: boolean;
  subscription_tier?: string;
  subscription_end?: string;
  created_at: string;
  updated_at: string;
}

export const SubscriptionService = {
  async getCurrentSubscription(): Promise<Subscription | null> {
    try {
      const { data, error } = await supabase
        .from('subscribers')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching subscription:', error);
      return null;
    }
  },

  async createSubscription(organizationId: string, tier: string): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('subscribers')
        .insert({
          user_id: user.user.id,
          organization_id: organizationId,
          email: user.user.email!,
          subscribed: true,
          subscription_tier: tier
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error creating subscription:', error);
      throw error;
    }
  },

  async updateSubscription(subscriptionId: string, updates: Partial<Subscription>): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update(updates)
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating subscription:', error);
      throw error;
    }
  },

  async cancelSubscription(subscriptionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('subscribers')
        .update({ subscribed: false })
        .eq('id', subscriptionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error canceling subscription:', error);
      throw error;
    }
  },

  async checkTrialStatus(organizationId: string): Promise<{ isExpired: boolean; daysLeft: number }> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('trial_ends_at, subscription_status')
        .eq('id', organizationId)
        .single();

      if (error) throw error;

      const trialEndDate = new Date(data.trial_ends_at);
      const now = new Date();
      const daysLeft = Math.ceil((trialEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        isExpired: data.subscription_status === 'trial' && daysLeft <= 0,
        daysLeft: Math.max(0, daysLeft)
      };
    } catch (error) {
      console.error('Error checking trial status:', error);
      return { isExpired: false, daysLeft: 0 };
    }
  }
};
