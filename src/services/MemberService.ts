
import { supabase } from '@/integrations/supabase/client';
import { OrganizationAwareService } from './OrganizationAwareService';

export interface Member {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  created_at: string;
  updated_at: string;
  organization_id?: string;
  memberships?: Membership[];
}

export interface Membership {
  id: string;
  member_id: string;
  membership_type?: string;
  status?: string;
  payment_status?: string;
  start_date?: string;
  end_date?: string;
  organization_id?: string;
}

export const MemberService = {
  async fetchMembers(): Promise<Member[]> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from('custom_members')
        .select(`
          *,
          custom_memberships (
            id,
            membership_type,
            status,
            payment_status,
            start_date,
            end_date,
            organization_id
          )
        `)
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching members:', error);
        throw error;
      }

      return (data || []).map(member => ({
        ...member,
        memberships: member.custom_memberships || []
      }));
    } catch (error) {
      console.error('Error in fetchMembers:', error);
      throw error;
    }
  },

  async createMember(memberData: Omit<Member, 'id' | 'created_at' | 'updated_at' | 'organization_id'>): Promise<Member> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from('custom_members')
        .insert([{
          ...memberData,
          organization_id: organizationId,
          tenant_id: organizationId // Keep for backward compatibility
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating member:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in createMember:', error);
      throw error;
    }
  },

  async updateMember(memberId: string, updates: Partial<Member>): Promise<Member> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from('custom_members')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .eq('organization_id', organizationId)
        .select()
        .single();

      if (error) {
        console.error('Error updating member:', error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error('Error in updateMember:', error);
      throw error;
    }
  },

  async deleteMember(memberId: string): Promise<void> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { error } = await supabase
        .from('custom_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', organizationId);

      if (error) {
        console.error('Error deleting member:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in deleteMember:', error);
      throw error;
    }
  },

  async getMemberById(memberId: string): Promise<Member | null> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from('custom_members')
        .select(`
          *,
          custom_memberships (
            id,
            membership_type,
            status,
            payment_status,
            start_date,
            end_date,
            organization_id
          )
        `)
        .eq('id', memberId)
        .eq('organization_id', organizationId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return null;
        }
        console.error('Error fetching member by ID:', error);
        throw error;
      }

      return {
        ...data,
        memberships: data.custom_memberships || []
      };
    } catch (error) {
      console.error('Error in getMemberById:', error);
      throw error;
    }
  }
};
