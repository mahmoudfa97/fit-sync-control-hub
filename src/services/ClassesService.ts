import { supabase } from "@/integrations/supabase/client"

export interface Class {
  id: string
  name: string
  trainerId: string
  trainerName?: string
  memberId?: string
  memberName?: string
  dayOfWeek: string
  startTime: string
  endTime: string
  maxCapacity: number
  currentEnrollment: number
  description?: string
  level: "beginner" | "intermediate" | "advanced"
  status: "active" | "inactive" | "canceled"
  isPersonalTraining: boolean
  sessionCount?: number
  focusAreas?: string[]
  goals?: string
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface ClassFormData {
  name: string
  trainerId: string
  memberId?: string
  dayOfWeek: string
  startTime: string
  endTime: string
  maxCapacity: number
  description?: string
  level: "beginner" | "intermediate" | "advanced"
  isPersonalTraining: boolean
  sessionCount?: number
  focusAreas?: string[]
  goals?: string
  notes?: string
}

export class ClassesService {
  // Update the fetchClasses method to handle the lack of a foreign key relationship
  static async fetchClasses() {
    try {
      console.log("Fetching classes from database...")

      // First fetch all classes
      const { data, error } = await supabase
        .from("classes")
        .select(`
        id,
        name,
        trainer_id,
        day_of_week,
        start_time,
        end_time,
        max_capacity,
        current_enrollment,
        description,
        level,
        status,
        created_at,
        updated_at
      `)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching classes:", error)
        throw error
      }

      // Then fetch all trainers to manually join them
      const { data: trainers, error: trainersError } = await supabase.from("staff").select("*")

      if (trainersError) {
        console.error("Error fetching trainers:", trainersError)
        // Continue without trainer names if there's an error
      }

      // Create a map of trainer IDs to names for quick lookup
      const trainerMap = new Map()
      if (trainers) {
        trainers.forEach((trainer) => {
          trainerMap.set(trainer.id, trainer.name)
        })
      }

      // Transform the data to match our interface
      const transformedData: Class[] = data.map((item) => ({
        id: item.id,
        name: item.name,
        trainerId: item.trainer_id,
        trainerName: trainerMap.get(item.trainer_id) || "Unknown",
        dayOfWeek: item.day_of_week,
        startTime: item.start_time,
        endTime: item.end_time,
        maxCapacity: item.max_capacity,
        currentEnrollment: item.current_enrollment,
        description: item.description,
        level: item.level as "beginner" | "intermediate" | "advanced",
        status: item.status as "active" | "inactive" | "canceled",
        isPersonalTraining: false, // Default since we don't have this column
        created_at: item.created_at,
        updated_at: item.updated_at,
      }))

      return transformedData
    } catch (error) {
      console.error("Error in fetchClasses:", error)
      throw error
    }
  }

  // Update the addClass method to handle the lack of a foreign key relationship
  static async addClass(classData: ClassFormData) {
    try {
      console.log("Adding new class to database:", classData)

      // Format the data for Supabase
      const newClass = {
        name: classData.name,
        trainer_id: classData.trainerId,
        day_of_week: classData.dayOfWeek,
        start_time: classData.startTime,
        end_time: classData.endTime,
        max_capacity: classData.maxCapacity,
        current_enrollment: 0,
        description: classData.description || null,
        level: classData.level,
        status: "active",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }

      const { data, error } = await supabase.from("classes").insert(newClass).select().single()

      if (error) {
        console.error("Error adding class:", error)
        throw error
      }

      // Get the trainer name
      let trainerName = "Unknown"
      try {
        const { data: trainer } = await supabase.from("staff").select("*").single()

        if (trainer) {
          trainerName = trainer.name
        }
      } catch (trainerError) {
        console.error("Error fetching trainer name:", trainerError)
        // Continue with unknown trainer name
      }

      // Transform the response to match our interface
      const transformedClass: Class = {
        id: data.id,
        name: data.name,
        trainerId: data.trainer_id,
        trainerName: trainerName,
        dayOfWeek: data.day_of_week,
        startTime: data.start_time,
        endTime: data.end_time,
        maxCapacity: data.max_capacity,
        currentEnrollment: data.current_enrollment,
        description: data.description,
        level: data.level as "beginner" | "intermediate" | "advanced",
        status: data.status as "active" | "inactive" | "canceled",
        isPersonalTraining: classData.isPersonalTraining, // Use the input value since we don't store it
        sessionCount: classData.sessionCount,
        focusAreas: classData.focusAreas,
        goals: classData.goals,
        notes: classData.notes,
        created_at: data.created_at,
        updated_at: data.updated_at,
      }

      // If this is a personal training session and we have a member ID,
      // register the member for the class
      if (classData.isPersonalTraining && classData.memberId) {
        try {
          await this.registerMemberForClass(transformedClass.id, classData.memberId)
          transformedClass.memberId = classData.memberId

          // Get member name
          const { data: memberData } = await supabase
            .from("custom_members")
            .select("name, last_name")
            .eq("id", classData.memberId)
            .single()

          if (memberData) {
            transformedClass.memberName = `${memberData.name} ${memberData.last_name || ""}`.trim()
          }
        } catch (regError) {
          console.error("Error registering member for personal training:", regError)
          // Continue even if registration fails
        }
      }

      return transformedClass
    } catch (error) {
      console.error("Error in addClass:", error)
      throw error
    }
  }

  static async updateClassStatus(classId: string, status: "active" | "inactive" | "canceled") {
    try {
      console.log(`Updating class ${classId} status to ${status}`)

      const { data, error } = await supabase
        .from("classes")
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq("id", classId)
        .select()
        .single()

      if (error) {
        console.error("Error updating class status:", error)
        throw error
      }

      return { id: data.id, status: data.status }
    } catch (error) {
      console.error("Error in updateClassStatus:", error)
      throw error
    }
  }

  // Update the registerMemberForClass method to use member_id instead of profile_id
  static async registerMemberForClass(classId: string, memberId: string) {
    try {
      console.log(`Registering member ${memberId} for class ${classId}`)

      // First, check if the class exists and has capacity
      const { data: classData, error: classError } = await supabase
        .from("classes")
        .select("current_enrollment, max_capacity")
        .eq("id", classId)
        .single()

      if (classError) {
        console.error("Error fetching class:", classError)
        throw classError
      }

      if (classData.current_enrollment >= classData.max_capacity) {
        throw new Error("Class is at maximum capacity")
      }

      // Check if member is already registered
      const { data: existingRegistration, error: registrationError } = await supabase
        .from("class_registrations")
        .select("id")
        .eq("class_id", classId)
        .eq("member_id", memberId)
        .maybeSingle()

      if (registrationError) {
        console.error("Error checking existing registration:", registrationError)
        throw registrationError
      }

      if (existingRegistration) {
        throw new Error("Member is already registered for this class")
      }

      // Create the registration
      const { error: insertError } = await supabase.from("class_registrations").insert({
        class_id: classId,
        member_id: memberId,
        status: "registered",
        created_at: new Date().toISOString(),
      })

      if (insertError) {
        console.error("Error registering for class:", insertError)
        throw insertError
      }

      // Update the class enrollment count
      const { error: updateError } = await supabase
        .from("classes")
        .update({
          current_enrollment: classData.current_enrollment + 1,
          updated_at: new Date().toISOString(),
        })
        .eq("id", classId)

      if (updateError) {
        console.error("Error updating class enrollment:", updateError)
        throw updateError
      }

      return { success: true }
    } catch (error) {
      console.error("Error in registerMemberForClass:", error)
      throw error
    }
  }

  // Update the getClassRegistrations method to use member_id and custom_members
  static async getClassRegistrations(classId: string) {
    try {
      console.log(`Fetching registrations for class ${classId}`)

      const { data, error } = await supabase
        .from("class_registrations")
        .select(`
        id,
        status,
        created_at,
        member_id
      `)
        .eq("class_id", classId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching class registrations:", error)
        throw error
      }

      // Fetch member details separately
      const memberIds = data.map((reg) => reg.member_id)

      if (memberIds.length === 0) {
        return data
      }

      const { data: members, error: membersError } = await supabase
        .from("custom_members")
        .select("id, name, last_name, email, phone")
        .in("id", memberIds)

      if (membersError) {
        console.error("Error fetching members:", membersError)
        // Continue without member details
      }

      // Create a map of member IDs to details for quick lookup
      const memberMap = new Map()
      if (members) {
        members.forEach((member) => {
          memberMap.set(member.id, member)
        })
      }

      // Add member details to registrations
      return data.map((reg) => ({
        ...reg,
        member: memberMap.get(reg.member_id) || null,
      }))
    } catch (error) {
      console.error("Error in getClassRegistrations:", error)
      throw error
    }
  }

  // Update the getMemberClasses method to use member_id
  static async getMemberClasses(memberId: string) {
    try {
      console.log(`Fetching classes for member ${memberId}`)

      // Get classes the member is registered for
      const { data: registrations, error: registrationsError } = await supabase
        .from("class_registrations")
        .select(`
        id,
        status,
        class_id
      `)
        .eq("member_id", memberId)
        .eq("status", "registered")

      if (registrationsError) {
        console.error("Error fetching class registrations:", registrationsError)
        throw registrationsError
      }

      if (registrations.length === 0) {
        return []
      }

      // Get the class details
      const classIds = registrations.map((reg) => reg.class_id)

      const { data: classes, error: classesError } = await supabase
        .from("classes")
        .select(`
        id,
        name,
        trainer_id,
        day_of_week,
        start_time,
        end_time,
        level,
        status
      `)
        .in("id", classIds)
        .eq("status", "active")

      if (classesError) {
        console.error("Error fetching classes:", classesError)
        throw classesError
      }

      // Get trainer details
      const trainerIds = classes.map((cls) => cls.trainer_id).filter(Boolean)

      const trainerMap = new Map()
      if (trainerIds.length > 0) {
        const { data: trainers, error: trainersError } = await supabase
          .from("staff")
          .select("*")
          .in("id", trainerIds)

        if (!trainersError && trainers) {
          trainers.forEach((trainer) => {
            trainerMap.set(trainer.id, trainer.name)
          })
        }
      }

      // Create a map of class IDs to registration IDs
      const registrationMap = new Map()
      registrations.forEach((reg) => {
        registrationMap.set(reg.class_id, reg.id)
      })

      // Format the results
      return classes.map((cls) => ({
        id: cls.id,
        name: cls.name,
        trainerId: cls.trainer_id,
        trainerName: trainerMap.get(cls.trainer_id) || "Unknown",
        dayOfWeek: cls.day_of_week,
        startTime: cls.start_time,
        endTime: cls.end_time,
        level: cls.level,
        status: cls.status,
        isPersonalTraining: false,
        registrationId: registrationMap.get(cls.id),
      }))
    } catch (error) {
      console.error("Error in getMemberClasses:", error)
      throw error
    }
  }
}
