import { supabase } from "@/integrations/supabase/client"
import type { Member } from "@/store/slices/membersSlice"

export interface MemberFormData {
  name: string
  last_name: string
  email: string
  phone: string
  dateOfBirth: string
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

export interface ExpiringMember {
  id: string
  name: string
  last_name: string | null
  email: string | null
  phone: string | null
  avatar_url?: string | null
  membership: {
    id: string
    membership_type: string
    end_date: string
    status: string
    payment_status: string
  }
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
          dateOfBirth,
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
          dateOfBirth: member.dateOfBirth ? member.dateOfBirth.toString() : undefined,
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
          dateOfBirth,
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
          dateOfBirth: existingMember.dateOfBirth ? existingMember.dateOfBirth.toString() : undefined,
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
          dateOfBirth: memberData.dateOfBirth ? Number.parseInt(memberData.dateOfBirth) : null,
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
        dateOfBirth: memberData.dateOfBirth || undefined,
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

  /**
   * Fetch members with expired memberships
   * @returns Array of members with expired memberships
   */
  static async fetchExpiredMembers() {
    try {
      console.log("Fetching expired members...")

      // Get current date
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]

      // First, get memberships that have expired
      const { data: expiredMemberships, error: membershipError } = await supabase
        .from("custom_memberships")
        .select(`
          id,
          membership_type,
          end_date,
          status,
          payment_status,
          member_id
        `)
        .lt("end_date", todayStr)
        .eq("status", "active")
        .order("end_date", { ascending: false })

      if (membershipError) {
        console.error("Error fetching expired memberships:", membershipError)
        throw membershipError
      }

      console.log(`Found ${expiredMemberships?.length || 0} expired memberships`)

      if (!expiredMemberships || expiredMemberships.length === 0) {
        return []
      }

      // Get member details for each expired membership
      const memberIds = expiredMemberships.map((membership) => membership.member_id)

      const { data: membersData, error: membersError } = await supabase
        .from("custom_members")
        .select("id, name, last_name, email, phone")
        .in("id", memberIds)

      if (membersError) {
        console.error("Error fetching expired members details:", membersError)
        throw membersError
      }

      // Map memberships to members
      const expiredMembers = expiredMemberships
        .map((membership) => {
          const member = membersData?.find((m) => m.id === membership.member_id)

          if (!member) {
            console.warn(`Member not found for membership: ${membership.id}`)
            return null
          }

          return {
            id: member.id,
            name: member.name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone,
            avatar_url: null,
            membership: {
              id: membership.id,
              membership_type: membership.membership_type,
              end_date: membership.end_date,
              status: membership.status,
              payment_status: membership.payment_status,
            },
          }
        })
        .filter(Boolean) as ExpiringMember[]

      return expiredMembers
    } catch (error) {
      console.error("Error in fetchExpiredMembers:", error)
      throw error
    }
  }

  /**
   * Fetch members with memberships expiring in the next 7 days
   * @returns Array of members with soon-to-expire memberships
   */
  static async fetchExpiringMembers() {
    try {
      console.log("Fetching members with expiring memberships...")

      // Get current date and date 7 days from now
      const today = new Date()
      const sevenDaysFromNow = new Date(today)
      sevenDaysFromNow.setDate(today.getDate() + 7)

      // Format dates for PostgreSQL (YYYY-MM-DD)
      const todayStr = today.toISOString().split("T")[0]
      const futureStr = sevenDaysFromNow.toISOString().split("T")[0]

      console.log(`Date range: ${todayStr} to ${futureStr}`)

      // Fetch memberships expiring in the next 7 days
      const { data: expiringMemberships, error: membershipError } = await supabase
        .from("custom_memberships")
        .select(`
          id,
          membership_type,
          end_date,
          status,
          payment_status,
          member_id
        `)
        .gte("end_date", todayStr)
        .lte("end_date", futureStr)
        .eq("status", "active")
        .order("end_date")

      if (membershipError) {
        console.error("Error fetching expiring memberships:", membershipError)
        throw membershipError
      }

      console.log(`Found ${expiringMemberships?.length || 0} expiring memberships`)

      if (!expiringMemberships || expiringMemberships.length === 0) {
        return []
      }

      // Get member details for each expiring membership
      const memberIds = expiringMemberships.map((membership) => membership.member_id)

      const { data: membersData, error: membersError } = await supabase
        .from("custom_members")
        .select("id, name, last_name, email, phone")
        .in("id", memberIds)

      if (membersError) {
        console.error("Error fetching expiring members details:", membersError)
        throw membersError
      }

      // Map memberships to members
      const expiringMembers = expiringMemberships
        .map((membership) => {
          const member = membersData?.find((m) => m.id === membership.member_id)

          if (!member) {
            console.warn(`Member not found for membership: ${membership.id}`)
            return null
          }

          return {
            id: member.id,
            name: member.name,
            last_name: member.last_name,
            email: member.email,
            phone: member.phone,
            avatar_url: null,
            membership: {
              id: membership.id,
              membership_type: membership.membership_type,
              end_date: membership.end_date,
              status: membership.status,
              payment_status: membership.payment_status,
            },
          }
        })
        .filter(Boolean) as ExpiringMember[]

      return expiringMembers
    } catch (error) {
      console.error("Error in fetchExpiringMembers:", error)
      throw error
    }
  }

  /**
   * Update membership status to expired
   * @param membershipId The ID of the membership to update
   * @returns The updated membership
   */
  static async updateMembershipToExpired(membershipId: string) {
    try {
      const { data, error } = await supabase
        .from("custom_memberships")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .eq("id", membershipId)
        .select()
        .single()

      if (error) throw error

      return data
    } catch (error) {
      console.error("Error updating membership to expired:", error)
      throw error
    }
  }

  /**
   * Automatically update all expired memberships
   * @returns The number of memberships updated
   */
  static async autoUpdateExpiredMemberships() {
    try {
      // Get current date
      const today = new Date()
      const todayStr = today.toISOString().split("T")[0]

      // Update all memberships that have expired
      const { data, error } = await supabase
        .from("custom_memberships")
        .update({
          status: "expired",
          updated_at: new Date().toISOString(),
        })
        .lt("end_date", todayStr)
        .eq("status", "active") as { data: { id: string }[] | null; error: any }

      if (error) throw error

      return { updated: data && Array.isArray(data) ? data.length : 0 }
    } catch (error) {
      console.error("Error auto-updating expired memberships:", error)
      throw error
    }
  }
}
