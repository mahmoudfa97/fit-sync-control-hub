import { supabase } from "@/integrations/supabase/client"
import type { Member } from "@/store/slices/membersSlice"

export interface MemberFormData {
  name: string
  last_name: string
  email: string
  phone: string
  age: string
  gender: "male" | "female" | ""
  membershipType: string
  status: Member["status"]
  paymentStatus: Member["paymentStatus"]
  hasInsurance?: boolean
  insuranceStartDate?: string
  insuranceEndDate?: string
  insurancePolicy?: string
  insuranceProvider?: string
}

export class MemberService {
  static async fetchMembers() {
    try {
      // Fetch from custom_members table
      const { data, error } = await supabase
        .from("custom_members")
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          age,
          gender,
          created_at,
          updated_at,
          custom_memberships(
            id,
            membership_type,
            start_date,
            end_date,
            status,
            payment_status
          ),
          custom_member_insurance(
            has_insurance,
            start_date,
            end_date
          ),
          custom_checkins(
            check_in_time
          )
        `)
        .order("created_at", { ascending: false })

      if (error) throw error

      const transformedMembers = data.map((member) => {
        const membership =
          member.custom_memberships && member.custom_memberships.length > 0 ? member.custom_memberships[0] : null

        const insurance =
          member.custom_member_insurance && member.custom_member_insurance.length > 0
            ? member.custom_member_insurance[0]
            : null

        const lastCheckIn =
          member.custom_checkins && member.custom_checkins.length > 0
            ? new Date(Math.max(...member.custom_checkins.map((c) => new Date(c.check_in_time).getTime())))
            : null

        let lastCheckInStr = "טרם נרשם"
        if (lastCheckIn) {
          const now = new Date()
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          if (lastCheckIn >= today) {
            const hours = lastCheckIn.getHours()
            const minutes = lastCheckIn.getMinutes().toString().padStart(2, "0")
            lastCheckInStr = `היום ${hours}:${minutes}`
          } else if (lastCheckIn >= yesterday) {
            const hours = lastCheckIn.getHours()
            const minutes = lastCheckIn.getMinutes().toString().padStart(2, "0")
            lastCheckInStr = `אתמול ${hours}:${minutes}`
          } else {
            lastCheckInStr = lastCheckIn.toLocaleDateString("he-IL")
          }
        }

        const joinDate = new Date(member.created_at)
        const monthNames = [
          "ינואר",
          "פברואר",
          "מרץ",
          "אפריל",
          "מאי",
          "יוני",
          "יולי",
          "אוגוסט",
          "ספטמבר",
          "אוקטובר",
          "נובמבר",
          "דצמבר",
        ]
        const formattedJoinDate = `${joinDate.getDate()} ${monthNames[joinDate.getMonth()]}, ${joinDate.getFullYear()}`

        const initials = `${member.name.charAt(0)}${member.last_name ? member.last_name.charAt(0) : ""}`

        return {
          id: member.id,
          name: `${member.name} ${member.last_name || ""}`,
          email: member.email,
          phone: member.phone || "",
          initials: initials,
          membershipType: membership ? membership.membership_type : "בסיסי",
          joinDate: formattedJoinDate,
          membershipEndDate: membership?.end_date
            ? new Date(membership.end_date).toISOString().split("T")[0]
            : undefined,
          status: (membership?.status as Member["status"]) || "active",
          paymentStatus: (membership?.payment_status as Member["paymentStatus"]) || "paid",
          lastCheckIn: lastCheckInStr,
          gender: member.gender as "male" | "female" | "other" | undefined,
          age: member.age ? member.age.toString() : undefined,
          hasInsurance: insurance?.has_insurance || false,
          insuranceStartDate: insurance?.start_date
            ? new Date(insurance.start_date).toISOString().split("T")[0]
            : undefined,
          insuranceEndDate: insurance?.end_date ? new Date(insurance.end_date).toISOString().split("T")[0] : undefined,
        } as Member
      })

      return transformedMembers
    } catch (error) {
      console.error("Error fetching members:", error)
      throw error
    }
  }

  static async findMemberByEmail(email: string) {
    try {
      const { data, error } = await supabase
        .from("custom_members")
        .select(`
          id,
          name,
          last_name,
          email,
          phone,
          age,
          gender,
          created_at,
          updated_at,
          custom_memberships(
            id,
            membership_type,
            start_date,
            end_date,
            status,
            payment_status
          ),
          custom_member_insurance(
            has_insurance,
            start_date,
            end_date
          )
        `)
        .eq("email", email)
        .maybeSingle()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error finding member by email:", error)
      throw error
    }
  }

  static async addMember(memberData: MemberFormData) {
    try {
      const existingMember = await this.findMemberByEmail(memberData.email)

      if (existingMember) {
        const { error: membershipError } = await supabase.from("custom_memberships").insert({
          member_id: existingMember.id,
          membership_type: memberData.membershipType,
          status: memberData.status,
          payment_status: memberData.paymentStatus,
          start_date: new Date().toISOString(),
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
        })

        if (membershipError) throw membershipError

        // Update insurance if provided
        if (memberData.hasInsurance) {
          const insuranceStartDate = memberData.insuranceStartDate
            ? new Date(memberData.insuranceStartDate).toISOString()
            : new Date().toISOString()

          const insuranceEndDate = memberData.insuranceEndDate
            ? new Date(memberData.insuranceEndDate).toISOString()
            : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now

          const { error: insuranceError } = await supabase.from("custom_member_insurance").insert({
            member_id: existingMember.id,
            has_insurance: true,
            start_date: insuranceStartDate,
            end_date: insuranceEndDate,
          })

          if (insuranceError) throw insuranceError
        }

        const initials = `${existingMember.name[0]}${existingMember.last_name ? existingMember.last_name[0] : ""}`

        return {
          id: existingMember.id,
          name: `${existingMember.name} ${existingMember.last_name || ""}`,
          email: existingMember.email,
          phone: existingMember.phone || "",
          membershipType: memberData.membershipType,
          status: memberData.status,
          joinDate: new Date(existingMember.created_at).toLocaleDateString("he-IL"),
          lastCheckIn: "טרם נרשם",
          paymentStatus: memberData.paymentStatus,
          initials: initials,
          gender: existingMember.gender as "male" | "female" | "other" | undefined,
          age: existingMember.age ? existingMember.age.toString() : undefined,
          hasInsurance: memberData.hasInsurance,
          insuranceStartDate: memberData.insuranceStartDate,
          insuranceEndDate: memberData.insuranceEndDate,
          isExisting: true,
        } as Member & { isExisting: boolean }
      }

      // Get the current user's ID
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("No authenticated user found")
      }

      // Generate a UUID for the member
      const memberId = crypto.randomUUID()

      // Insert into custom_members table
      const { data: profileData, error: memberError } = await supabase
        .from("custom_members")
        .insert({
          id: memberId,
          name: memberData.name,
          last_name: memberData.last_name,
          email: memberData.email,
          phone: memberData.phone,
          age: memberData.age ? Number.parseInt(memberData.age) : null,
          gender: memberData.gender || null,
          created_by: user.id,
        })
        .select()
        .single()

      if (memberError) throw memberError

      const { error: membershipError } = await supabase.from("custom_memberships").insert({
        member_id: memberId,
        membership_type: memberData.membershipType,
        status: memberData.status,
        payment_status: memberData.paymentStatus,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
      })

      if (membershipError) throw membershipError

      // Add insurance if provided
      if (memberData.hasInsurance) {
        const insuranceStartDate = memberData.insuranceStartDate
          ? new Date(memberData.insuranceStartDate).toISOString()
          : new Date().toISOString()

        const insuranceEndDate = memberData.insuranceEndDate
          ? new Date(memberData.insuranceEndDate).toISOString()
          : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // 1 year from now

        const { error: insuranceError } = await supabase.from("custom_member_insurance").insert({
          member_id: memberId,
          has_insurance: true,
          start_date: insuranceStartDate,
          end_date: insuranceEndDate,
        })

        if (insuranceError) throw insuranceError
      }

      const today = new Date()
      const hebrewMonths = [
        "ינואר",
        "פברואר",
        "מרץ",
        "אפריל",
        "מאי",
        "יוני",
        "יולי",
        "אוגוסט",
        "ספטמבר",
        "אוקטובר",
        "נובמבר",
        "דצמבר",
      ]
      const joinDateStr = `${today.getDate()} ${hebrewMonths[today.getMonth()]}, ${today.getFullYear()}`

      const initials = `${memberData.name[0]}${memberData.last_name ? memberData.last_name[0] : ""}`

      return {
        id: memberId,
        name: `${memberData.name} ${memberData.last_name || ""}`,
        email: memberData.email,
        phone: memberData.phone,
        membershipType: memberData.membershipType,
        status: memberData.status,
        joinDate: joinDateStr,
        lastCheckIn: "טרם נרשם",
        paymentStatus: memberData.paymentStatus,
        initials: initials,
        gender: memberData.gender as "male" | "female" | "other" | undefined,
        age: memberData.age || undefined,
        hasInsurance: memberData.hasInsurance,
        insuranceStartDate: memberData.insuranceStartDate,
        insuranceEndDate: memberData.insuranceEndDate,
        isExisting: false,
      } as Member & { isExisting: boolean }
    } catch (error) {
      console.error("Error adding member:", error)
      throw error
    }
  }

  static async recordCheckIn(memberId: string) {
    try {
      const { error } = await supabase.from("custom_checkins").insert({
        member_id: memberId,
        check_in_time: new Date().toISOString(),
      })

      if (error) throw error

      return true
    } catch (error) {
      console.error("Error recording check-in:", error)
      throw error
    }
  }
}
