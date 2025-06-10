
import { supabase } from "@/integrations/supabase/client"
import { OrganizationAwareService } from "./OrganizationAwareService"

export interface CheckIn {
  id: string
  memberId: string
  memberName: string
  checkInTime: string
  notes?: string
}

export interface Member {
  id: string
  name: string
  last_name?: string
}

export class CheckInService {
  static async fetchCheckIns() {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope()

      const { data, error } = await supabase
        .from("custom_checkins")
        .select(`
          id,
          check_in_time,
          notes,
          member_id,
          custom_members:member_id(id, name, last_name)
        `)
        .eq("organization_id", organizationId)
        .order("check_in_time", { ascending: false })

      if (error) {
        throw error
      }

      const transformedData: CheckIn[] = data.map((item) => ({
        id: item.id,
        memberId: item.member_id,
        memberName: item.custom_members
          ? `${item.custom_members.name} ${item.custom_members.last_name || ""}`
          : "Unknown",
        checkInTime: item.check_in_time,
        notes: item.notes || undefined,
      }))

      return transformedData
    } catch (error) {
      console.error("Error fetching check-ins:", error)
      throw error
    }
  }

  static async fetchMembers() {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope()

      const { data, error } = await supabase
        .from("custom_members")
        .select("id, name, last_name")
        .eq("organization_id", organizationId)
        .order("name")

      if (error) {
        throw error
      }

      return data as Member[]
    } catch (error) {
      console.error("Error fetching members for check-in:", error)
      throw error
    }
  }

  static async addCheckIn(memberId: string, notes?: string) {
    try {
      const organizationId = await OrganizationAwareService.withOrganizationScope()

      // Verify member belongs to organization
      const { data: member } = await supabase
        .from("custom_members")
        .select("id, name, last_name")
        .eq("id", memberId)
        .eq("organization_id", organizationId)
        .single()

      if (!member) {
        throw new Error("Member not found in organization")
      }

      const now = new Date()

      const { data, error } = await supabase
        .from("custom_checkins")
        .insert({
          member_id: memberId,
          check_in_time: now.toISOString(),
          notes: notes || null,
          organization_id: organizationId,
        })
        .select("id")

      if (error) {
        throw error
      }

      const checkInId = data[0].id

      return {
        id: checkInId,
        memberId: memberId,
        memberName: `${member.name} ${member.last_name || ""}`,
        checkInTime: now.toISOString(),
        notes: notes,
      } as CheckIn
    } catch (error) {
      console.error("Error adding check-in:", error)
      throw error
    }
  }
}
