
import { supabase } from '@/integrations/supabase/client';

export interface Member {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  created_at?: string;
  updated_at?: string;
}

export const MemberService = {
  async fetchMembers(): Promise<Member[]> {
    try {
      const { data, error } = await supabase
        .from('custom_members')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching members:', error);
      return [];
    }
  },

  async getMemberById(id: string): Promise<Member | null> {
    try {
      const { data, error } = await supabase
        .from('custom_members')
        .select('*')
        .eq('id', id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      return data;
    } catch (error) {
      console.error('Error fetching member by id:', error);
      return null;
    }
  },

  async findMemberByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from('custom_members')
        .select(`
          *,
          custom_memberships (
            id,
            membership_type,
            status,
            start_date,
            end_date,
            payment_status
          ),
          custom_member_insurance (
            id,
            has_insurance,
            start_date,
            end_date
          )
        `)
        .eq('email', email)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error finding member by email:', error);
      throw error;
    }
  },

  async createMember(memberData: Omit<Member, 'id' | 'created_at' | 'updated_at'>) {
    try {
      const { data, error } = await supabase
        .from('custom_members')
        .insert([memberData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating member:', error);
      throw error;
    }
  },

  async updateMember(memberId: string, updates: Partial<Member>): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_members')
        .update(updates)
        .eq('id', memberId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating member:', error);
      throw error;
    }
  },

  async deleteMember(id: string) {
    try {
      const { error } = await supabase
        .from('custom_members')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting member:', error);
      throw error;
    }
  },

  async getMemberWithMemberships(id: string) {
    try {
      const { data, error } = await supabase
        .from('custom_members')
        .select(`
          *,
          custom_memberships (
            id,
            membership_type,
            status,
            start_date,
            end_date,
            payment_status
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching member with memberships:', error);
      throw error;
    }
  },

  async getMemberMemberships(memberId: string) {
    try {
      const { data, error } = await supabase
        .from('custom_memberships')
        .select('*')
        .eq('member_id', memberId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching member memberships:', error);
      return [];
    }
  }
};
