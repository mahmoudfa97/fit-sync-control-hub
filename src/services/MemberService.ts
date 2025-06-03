
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

export interface ExpiringMember {
  id: string;
  name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  membership: {
    id: string;
    membership_type: string;
    end_date: string;
    status: string;
  };
}

export interface MemberFormData {
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: "male" | "female" | "";
  membershipType?: string;
  birthYear?: string;
  birthMonth?: string;
  birthDay?: string;
  hasInsurance?: boolean;
  insuranceStartDate?: string;
  insuranceEndDate?: string;
  insurancePolicy?: string;
  insuranceProvider?: string;
  sendWelcomeMessage?: boolean;
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

  async getMemberById(id: string): Promise<Member> {
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
      throw error;
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
  },

  async fetchExpiringMembers(): Promise<ExpiringMember[]> {
    try {
      const today = new Date();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      const { data, error } = await supabase
        .from('custom_members')
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          custom_memberships!inner (
            id,
            membership_type,
            end_date,
            status
          )
        `)
        .eq('custom_memberships.status', 'active')
        .lte('custom_memberships.end_date', thirtyDaysFromNow.toISOString())
        .gte('custom_memberships.end_date', today.toISOString())
        .order('custom_memberships.end_date', { ascending: true });

      if (error) throw error;

      return (data || []).map(member => ({
        id: member.id,
        name: member.name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        membership: member.custom_memberships[0]
      }));
    } catch (error) {
      console.error('Error fetching expiring members:', error);
      return [];
    }
  },

  async fetchExpiredMembers(): Promise<ExpiringMember[]> {
    try {
      const today = new Date();

      const { data, error } = await supabase
        .from('custom_members')
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          custom_memberships!inner (
            id,
            membership_type,
            end_date,
            status
          )
        `)
        .eq('custom_memberships.status', 'active')
        .lt('custom_memberships.end_date', today.toISOString())
        .order('custom_memberships.end_date', { ascending: false });

      if (error) throw error;

      return (data || []).map(member => ({
        id: member.id,
        name: member.name,
        last_name: member.last_name,
        email: member.email,
        phone: member.phone,
        membership: member.custom_memberships[0]
      }));
    } catch (error) {
      console.error('Error fetching expired members:', error);
      return [];
    }
  },

  async updateMembershipToExpired(membershipId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_memberships')
        .update({ status: 'expired' })
        .eq('id', membershipId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating membership to expired:', error);
      throw error;
    }
  },

  async addMember(memberData: MemberFormData) {
    try {
      // Check if member already exists by email
      if (memberData.email) {
        try {
          const existingMember = await this.findMemberByEmail(memberData.email);
          if (existingMember) {
            return { ...existingMember, isExisting: true };
          }
        } catch (error) {
          // Member doesn't exist, continue with creation
        }
      }

      // Create new member
      const newMember = await this.createMember({
        name: memberData.name,
        last_name: memberData.last_name,
        email: memberData.email,
        phone: memberData.phone,
        dateOfBirth: memberData.dateOfBirth,
        gender: memberData.gender,
      });

      // Handle insurance if provided
      if (memberData.hasInsurance && memberData.insuranceStartDate && memberData.insuranceEndDate) {
        await supabase
          .from('custom_member_insurance')
          .insert({
            member_id: newMember.id,
            has_insurance: true,
            start_date: memberData.insuranceStartDate,
            end_date: memberData.insuranceEndDate,
          });
      }

      return { ...newMember, isExisting: false };
    } catch (error) {
      console.error('Error adding member:', error);
      throw error;
    }
  },

  async recordCheckIn(memberId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('custom_checkins')
        .insert({
          member_id: memberId,
          check_in_time: new Date().toISOString(),
        });

      if (error) throw error;
    } catch (error) {
      console.error('Error recording check-in:', error);
      throw error;
    }
  },
};
