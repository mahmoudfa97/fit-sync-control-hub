
import { supabase } from '@/integrations/supabase/client';

export class OrganizationAwareService {
  /**
   * Get current user's organization ID using security definer function
   */
  static async getCurrentOrganizationId(): Promise<string | null> {
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session?.user) {
        throw new Error('User not authenticated');
      }

      // Use the existing security definer function (the name in types is get_user_organization)
      const { data, error } = await supabase
        .rpc('get_user_organization');

      if (error) {
        console.error('Error fetching user organization:', error);
        return null;
      }

      return data || null;
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
