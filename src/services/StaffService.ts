import { supabase } from "@/integrations/supabase/client"
import type { StaffMember } from "@/store/slices/staffSlice"

export interface StaffFormData {
  member_id: string
  role: string
  department: string
  status: "active" | "inactive" | "on_leave"
  phone?: string
}

export class StaffService {
  static async fetchStaff() {
    try {
      const { data, error } = await supabase
        .from("staff")
        .select(`
          id,
          name,
          email,
          phone,
          role,
          department,
          hire_date,
          status,
          user_id,
          created_at,
          updated_at
        `)
        .order("created_at", { ascending: false })

      if (error) {
        throw error
      }

      const transformedStaff = data.map((staff) => {
        // Format hire date
        const hireDate = staff.hire_date ? new Date(staff.hire_date) : new Date(staff.created_at || Date.now())

        const months = [
"יָנוּאָר",
"פֶבּרוּאָר",
"מַרס",
"אַפּרִיל",
"מַאִי",
"יוּנִי",
"יוּלִי",
"אוֹגוּסט",
"ספטמבר",
"אוֹקְטוֹבֶּר",
"נוֹבֶמבֶּר",
"דֵצֶמבֶּר",
        ]

        const formattedHireDate = `${hireDate.getDate()} ${months[hireDate.getMonth()]}، ${hireDate.getFullYear()}`

        // Generate initials from name
        const nameParts = staff.name.split(" ")
        const initials =
          nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : `${nameParts[0][0]}${nameParts[0][1] || ""}`

        // Default work days and shift
        const workDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]
        const shift = "בוקר (6:00 - 14:00)"

        return {
          id: staff.id,
          name: staff.name,
          email: staff.email,
          phone: staff.phone || "",
          role: staff.role,
          department: staff.department,
          hireDate: formattedHireDate,
          status: staff.status as "active" | "inactive" | "on_leave",
          schedule: {
            days: workDays,
            shift: shift,
          },
          initials: initials,
          joinDate: staff.hire_date || staff.created_at,
        } as StaffMember
      })

      return transformedStaff
    } catch (error) {
      console.error("Error fetching staff:", error)
      throw error
    }
  }

  static async fetchAvailableMembers() {
    try {
      // Get all members from custom_members table
      const { data: members, error: membersError } = await supabase.from("custom_members").select(`
          id,
          name,
          last_name,
          email,
          phone
        `)

      if (membersError) throw membersError

      // Get all existing staff to filter out members who are already staff
      const { data: existingStaff, error: staffError } = await supabase.from("staff").select("user_id")

      if (staffError) throw staffError

      // Create a set of existing staff user_ids for faster lookup
      const existingStaffIds = new Set(existingStaff.map((staff) => staff.user_id))

      // Filter out members who are already staff
      const availableMembers = members.filter((member) => !existingStaffIds.has(member.id))

      return availableMembers.map((member) => ({
        id: member.id,
        name: `${member.name} ${member.last_name || ""}`.trim(),
        email: member.email,
        phone: member.phone || "",
      }))
    } catch (error) {
      console.error("Error fetching available members:", error)
      throw error
    }
  }

  static async addStaff(staffData: StaffFormData) {
    try {
      // Get the member details from custom_members
      const { data: member, error: memberError } = await supabase
        .from("custom_members")
        .select("id, name, last_name, email, phone")
        .eq("id", staffData.member_id)
        .single()

      if (memberError) {
        console.error("Error fetching member:", memberError)
        throw new Error(`Member with ID ${staffData.member_id} not found`)
      }

      console.log("Found member:", member)

      // Create the staff record without user_id for now
      const newStaff = {
        id: crypto.randomUUID(),
        name: `${member.name} ${member.last_name || ""}`.trim(),
        email: member.email,
        phone: staffData.phone || member.phone || null,
        role: staffData.role,
        department: staffData.department,
        status: staffData.status,
        hire_date: new Date().toISOString(),
        // Don't set user_id for now
      }

      const { data, error } = await supabase.from("staff").insert(newStaff).select().single()

      if (error) {
        console.error("Error inserting staff:", error)
        throw error
      }

      // Format the response
      const hireDate = new Date()
      const months = [
"יָנוּאָר",
"פֶבּרוּאָר",
"מַרס",
"אַפּרִיל",
"מַאִי",
"יוּנִי",
"יוּלִי",
"אוֹגוּסט",
"ספטמבר",
"אוֹקְטוֹבֶּר",
"נוֹבֶמבֶּר",
"דֵצֶמבֶּר",
      ]
      const formattedHireDate = `${hireDate.getDate()} ${months[hireDate.getMonth()]}، ${hireDate.getFullYear()}`

      // Generate initials
      const nameParts = data.name.split(" ")
      const initials =
        nameParts.length > 1 ? `${nameParts[0][0]}${nameParts[1][0]}` : `${nameParts[0][0]}${nameParts[0][1] || ""}`

      // Default work days
      const workDays = ["ראשון", "שני", "שלישי", "רביעי", "חמישי"]
      const shift = "בוקר (6:00 - 14:00)"

      return {
        id: data.id,
        name: data.name,
        email: data.email,
        phone: data.phone || "",
        role: data.role,
        department: data.department,
        hireDate: formattedHireDate,
        status: data.status as "active" | "inactive" | "on_leave",
        schedule: {
          days: workDays,
          shift: shift,
        },
        initials: initials,
        joinDate: data.hire_date,
      } as StaffMember
    } catch (error) {
      console.error("Error adding staff:", error)
      throw error
    }
  }

  static async updateStaffStatus(id: string, status: "active" | "inactive" | "on_leave") {
    try {
      const { data, error } = await supabase
        .from("staff")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

      if (error) throw error

      return { id, status }
    } catch (error) {
      console.error("Error updating staff status:", error)
      throw error
    }
  }

  static async removeStaff(id: string) {
    try {
      const { error } = await supabase.from("staff").delete().eq("id", id)

      if (error) throw error

      return id
    } catch (error) {
      console.error("Error removing staff:", error)
      throw error
    }
  }
}
