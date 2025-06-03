
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppConfig {
  id: string;
  organization_id: string;
  phone_number_id?: string;
  access_token?: string;
  business_account_id?: string;
  webhook_verify_token?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const WhatsAppConfigService = {
  async getConfig(organizationId: string): Promise<WhatsAppConfig | null> {
    try {
      const { data, error } = await supabase
        .from('whatsapp_configs')
        .select('*')
        .eq('organization_id', organizationId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching WhatsApp config:', error);
      return null;
    }
  },

  async saveConfig(organizationId: string, config: Partial<WhatsAppConfig>): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_configs')
        .upsert({
          organization_id: organizationId,
          ...config,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error saving WhatsApp config:', error);
      throw error;
    }
  },

  async testConnection(organizationId: string): Promise<boolean> {
    try {
      const config = await this.getConfig(organizationId);
      if (!config || !config.access_token || !config.phone_number_id) {
        throw new Error('WhatsApp configuration incomplete');
      }

      // Test the connection by making a simple API call
      const response = await fetch(`https://graph.facebook.com/v18.0/${config.phone_number_id}`, {
        headers: {
          'Authorization': `Bearer ${config.access_token}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('Error testing WhatsApp connection:', error);
      return false;
    }
  },

  async activateConfig(organizationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_configs')
        .update({ is_active: true })
        .eq('organization_id', organizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error activating WhatsApp config:', error);
      throw error;
    }
  },

  async deactivateConfig(organizationId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('whatsapp_configs')
        .update({ is_active: false })
        .eq('organization_id', organizationId);

      if (error) throw error;
    } catch (error) {
      console.error('Error deactivating WhatsApp config:', error);
      throw error;
    }
  }
};
