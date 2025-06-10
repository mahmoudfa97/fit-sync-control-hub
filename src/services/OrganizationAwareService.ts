
import { supabase } from '@/integrations/supabase/client';

export class OrganizationAwareService {
  /**
   * Get current user's organization ID
   */
  static async getCurrentOrganizationId(): Promise<string | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('organization_users')
        .select('organization_id')
        .eq('user_id', session.session.user.id)
        .single();

      if (error) {
        console.error('Error fetching user organization:', error);
        return null;
      }

      return data?.organization_id || null;
    } catch (error) {
      console.error('Error in getCurrentOrganizationId:', error);
      return null;
    }
  }

  /**
   * Ensure queries are organization-scoped
   */
  static async withOrganizationScope() {
    const orgId = await this.getCurrentOrganizationId();
    if (!orgId) {
      throw new Error('No organization found for current user');
    }
    return orgId;
  }
}
