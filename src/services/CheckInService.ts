import { supabase } from "@/integrations/supabase/client"

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
      // First check if user is authenticated
      const { data: authData } = await supabase.auth.getSession()
      if (!authData.session) {
        throw new Error("Authentication required")
      }

      const { data, error } = await supabase
        .from("custom_checkins")
        .select(`
          id,
          check_in_time,
          notes,
          member_id,
          custom_members:member_id(id, name, last_name)
        `)
        .order("check_in_time", { ascending: false })

      if (error) {
        throw error
      }

      // Transform the data to match our interface
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
      // First check if user is authenticated
      const { data: authData } = await supabase.auth.getSession()
      if (!authData.session) {
        throw new Error("Authentication required")
      }

      const { data, error } = await supabase.from("custom_members").select("id, name, last_name").order("name")

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
      // First check if user is authenticated
      const { data: authData } = await supabase.auth.getSession()
      if (!authData.session) {
        throw new Error("Authentication required")
      }

      const now = new Date()

      // Add check-in to Supabase using custom_checkins table
      const { data, error } = await supabase
        .from("custom_checkins")
        .insert({
          member_id: memberId,
          check_in_time: now.toISOString(),
          notes: notes || null,
        })
        .select("id")

      if (error) {
        throw error
      }

      const checkInId = data[0].id

      // Get the member info to include in the response
      const { data: memberData, error: memberError } = await supabase
        .from("custom_members")
        .select("name, last_name")
        .eq("id", memberId)
        .single()

      if (memberError) {
        throw memberError
      }

      // Add type assertion to fix TypeScript error
      const member = memberData as { name: string; last_name?: string }

      // Build and return the new check-in object
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
