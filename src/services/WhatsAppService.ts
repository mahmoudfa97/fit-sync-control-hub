
import { supabase } from '@/integrations/supabase/client';

export interface WhatsAppTemplate {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  category: string;
  components: any[];
  language: string;
}

export const WhatsAppService = {
  async getTemplates(organizationId: string): Promise<WhatsAppTemplate[]> {
    try {
      const { data: config } = await supabase
        .from('whatsapp_configs')
        .select('phone_number_id, access_token')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

      if (!config) {
        throw new Error('WhatsApp not configured for this organization');
      }

      const { data, error } = await supabase.functions.invoke('get-whatsapp-templates', {
        body: {
          organizationId,
          phoneNumberId: config.phone_number_id,
          accessToken: config.access_token
        }
      });

      if (error) throw error;
      return data.templates || [];
    } catch (error) {
      console.error('Error fetching WhatsApp templates:', error);
      return [];
    }
  },

  async sendDirectMessage(organizationId: string, phoneNumber: string, message: string): Promise<any> {
    try {
      const { data: config } = await supabase
        .from('whatsapp_configs')
        .select('phone_number_id, access_token')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

      if (!config) {
        throw new Error('WhatsApp not configured for this organization');
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-message', {
        body: {
          organizationId,
          phoneNumber,
          message,
          phoneNumberId: config.phone_number_id,
          accessToken: config.access_token
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp message:', error);
      throw error;
    }
  },

  async sendTemplateMessage(
    organizationId: string, 
    phoneNumber: string, 
    templateId: string, 
    variables: Record<string, string>
  ): Promise<any> {
    try {
      const { data: config } = await supabase
        .from('whatsapp_configs')
        .select('phone_number_id, access_token')
        .eq('organization_id', organizationId)
        .eq('is_active', true)
        .single();

      if (!config) {
        throw new Error('WhatsApp not configured for this organization');
      }

      const { data, error } = await supabase.functions.invoke('send-whatsapp-template', {
        body: {
          organizationId,
          phoneNumber,
          templateId,
          variables,
          phoneNumberId: config.phone_number_id,
          accessToken: config.access_token
        }
      });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending WhatsApp template message:', error);
      throw error;
    }
  }
};
