
import { supabase } from "@/integrations/supabase/client";
import { OrganizationAwareService } from "./OrganizationAwareService";

export interface MemberFormData {
  name: string;
  lastName?: string;
  email?: string;
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  notes?: string;
}

export interface ServiceMember {
  id: string;
  name: string;
  last_name?: string;
  email?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  notes?: string;
  created_at: string;
  organization_id?: string;
}

export const MemberService = {
  async fetchMembers(): Promise<ServiceMember[]> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from("custom_members")
        .select("*")
        .eq("organization_id", organizationId)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching members:", error);
        throw error;
      }

      return data || [];
    } catch (error) {
      console.error("Error in fetchMembers:", error);
      throw error;
    }
  },

  async getMemberById(memberId: string): Promise<ServiceMember> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      const { data, error } = await supabase
        .from("custom_members")
        .select("*")
        .eq("id", memberId)
        .eq("organization_id", organizationId)
        .single();

      if (error) {
        console.error("Error fetching member:", error);
        throw error;
      }

      return data;
    } catch (error) {
      console.error("Error in getMemberById:", error);
      throw error;
    }
  },

  async addMember(memberData: MemberFormData): Promise<{ member: ServiceMember; isExisting: boolean }> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();

      // Check if member already exists in this organization
      if (memberData.email) {
        const { data: existingMember } = await supabase
          .from("custom_members")
          .select("*")
          .eq("email", memberData.email)
          .eq("organization_id", organizationId)
          .single();

        if (existingMember) {
          return { member: existingMember, isExisting: true };
        }
      }

      // Create new member
      const { data, error } = await supabase
        .from("custom_members")
        .insert({
          name: memberData.name,
          last_name: memberData.lastName,
          email: memberData.email,
          phone: memberData.phone,
          date_of_birth: memberData.dateOfBirth,
          gender: memberData.gender,
          notes: memberData.notes,
          organization_id: organizationId,
        })
        .select()
        .single();

      if (error) {
        console.error("Error adding member:", error);
        throw error;
      }

      return { member: data, isExisting: false };
    } catch (error) {
      console.error("Error in addMember:", error);
      throw error;
    }
  },

  async recordCheckIn(memberId: string): Promise<void> {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope();
      
      // Verify member belongs to organization
      const { data: member } = await supabase
        .from("custom_members")
        .select("id")
        .eq("id", memberId)
        .eq("organization_id", organizationId)
        .single();

      if (!member) {
        throw new Error("Member not found in organization");
      }

      const { error } = await supabase
        .from("custom_checkins")
        .insert({
          member_id: memberId,
          check_in_time: new Date().toISOString(),
          organization_id: organizationId,
        });

      if (error) {
        console.error("Error recording check-in:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error in recordCheckIn:", error);
      throw error;
    }
  },
};
