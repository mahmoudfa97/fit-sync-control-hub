
import { supabase } from '@/integrations/supabase/client';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  logo_url?: string;
  subscription_status: 'trial' | 'active' | 'canceled' | 'past_due';
  subscription_tier: 'basic' | 'premium' | 'enterprise';
  trial_ends_at: string;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}

export interface OrganizationUser {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'staff' | 'member';
  created_at: string;
}

export const OrganizationService = {
  async getCurrentOrganization(): Promise<Organization | null> {
    try {
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .limit(1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data as Organization;
    } catch (error) {
      console.error('Error fetching current organization:', error);
      return null;
    }
  },

  async getUserOrganizations(): Promise<Organization[]> {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select(`
          organizations (
            id,
            name,
            slug,
            logo_url,
            subscription_status,
            subscription_tier,
            trial_ends_at,
            stripe_customer_id,
            stripe_subscription_id
          )
        `);

      if (error) throw error;
      return data?.map(item => item.organizations).filter(Boolean) as Organization[] || [];
    } catch (error) {
      console.error('Error fetching user organizations:', error);
      return [];
    }
  },

  async createOrganization(name: string, slug: string): Promise<string> {
    try {
      const { data: userId } = await supabase.auth.getUser();
      if (!userId.user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .rpc('create_organization_with_owner', {
          org_name: name,
          org_slug: slug,
          user_id: userId.user.id
        });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating organization:', error);
      throw error;
    }
  },

  async updateOrganization(orgId: string, updates: Partial<Organization>): Promise<void> {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(updates)
        .eq('id', orgId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating organization:', error);
      throw error;
    }
  },

  async uploadLogo(orgId: string, file: File): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${orgId}-logo.${fileExt}`;
      const filePath = `organization-logos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      await this.updateOrganization(orgId, { logo_url: data.publicUrl });
      return data.publicUrl;
    } catch (error) {
      console.error('Error uploading logo:', error);
      throw error;
    }
  },

  async getOrganizationUsers(orgId: string): Promise<OrganizationUser[]> {
    try {
      const { data, error } = await supabase
        .from('organization_users')
        .select('*')
        .eq('organization_id', orgId);

      if (error) throw error;
      return (data || []).map(user => ({
        ...user,
        role: user.role as 'owner' | 'admin' | 'staff' | 'member'
      }));
    } catch (error) {
      console.error('Error fetching organization users:', error);
      return [];
    }
  },

  async inviteUser(orgId: string, email: string, role: 'admin' | 'staff' | 'member'): Promise<void> {
    try {
      // Implementation would depend on your invitation system
      // This is a placeholder for the invitation logic
      console.log(`Inviting ${email} to organization ${orgId} with role ${role}`);
    } catch (error) {
      console.error('Error inviting user:', error);
      throw error;
    }
  }
};
