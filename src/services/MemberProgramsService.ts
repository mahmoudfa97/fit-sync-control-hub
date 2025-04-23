import { supabase } from "@/integrations/supabase/client"

export interface MemberProgram {
  id: string
  member_id: string
  title: string
  description: string | null
  start_date: string
  end_date: string | null
  status: string
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface ProgramExercise {
  id: string
  program_id: string
  day_of_week: string
  exercise_name: string
  sets: number
  reps: string
  weight: string | null
  rest_time: string | null
  notes: string | null
  order_index: number
  created_at: string
  updated_at: string
}

export interface ProgramProgress {
  id: string
  program_id: string
  exercise_id: string
  date: string
  sets_completed: number
  reps_completed: string
  weight_used: string | null
  notes: string | null
  created_at: string
}

export interface CreateProgramParams {
  memberId: string
  title: string
  description?: string
  startDate: string
  endDate?: string
  exercises: Omit<ProgramExercise, "id" | "program_id" | "created_at" | "updated_at">[]
}

export class MemberProgramsService {
  static async getPrograms(memberId: string): Promise<MemberProgram[]> {
    try {
      const { data, error } = await supabase
        .from("member_programs")
        .select("*")
        .eq("member_id", memberId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching member programs:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getPrograms:", error)
      throw error
    }
  }

  static async getProgramWithExercises(
    programId: string,
  ): Promise<{ program: MemberProgram; exercises: ProgramExercise[] }> {
    try {
      // Get the program
      const { data: program, error: programError } = await supabase
        .from("member_programs")
        .select("*")
        .eq("id", programId)
        .single()

      if (programError) {
        console.error("Error fetching program:", programError)
        throw programError
      }

      // Get the exercises
      const { data: exercises, error: exercisesError } = await supabase
        .from("program_exercises")
        .select("*")
        .eq("program_id", programId)
        .order("day_of_week", { ascending: true })
        .order("order_index", { ascending: true })

      if (exercisesError) {
        console.error("Error fetching program exercises:", exercisesError)
        throw exercisesError
      }

      return {
        program,
        exercises: exercises || [],
      }
    } catch (error) {
      console.error("Error in getProgramWithExercises:", error)
      throw error
    }
  }

  static async createProgram(params: CreateProgramParams): Promise<MemberProgram> {
    try {
      // Insert the program
      const { data: program, error: programError } = await supabase
        .from("member_programs")
        .insert({
          member_id: params.memberId,
          title: params.title,
          description: params.description || null,
          start_date: params.startDate,
          end_date: params.endDate || null,
          status: "active",
        })
        .select()
        .single()

      if (programError) {
        console.error("Error creating program:", programError)
        throw programError
      }

      // Insert the exercises
      if (params.exercises.length > 0) {
        const exercisesToInsert = params.exercises.map((exercise, index) => ({
          program_id: program.id,
          day_of_week: exercise.day_of_week,
          exercise_name: exercise.exercise_name,
          sets: exercise.sets,
          reps: exercise.reps,
          weight: exercise.weight || null,
          rest_time: exercise.rest_time || null,
          notes: exercise.notes || null,
          order_index: exercise.order_index || index,
        }))

        const { error: exercisesError } = await supabase.from("program_exercises").insert(exercisesToInsert)

        if (exercisesError) {
          console.error("Error creating program exercises:", exercisesError)
          // Delete the program if exercises insertion fails
          await supabase.from("member_programs").delete().eq("id", program.id)
          throw exercisesError
        }
      }

      return program
    } catch (error) {
      console.error("Error in createProgram:", error)
      throw error
    }
  }

  static async updateProgramStatus(programId: string, status: string): Promise<void> {
    try {
      const { error } = await supabase
        .from("member_programs")
        .update({ status, updated_at: new Date().toISOString() })
        .eq("id", programId)

      if (error) {
        console.error("Error updating program status:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateProgramStatus:", error)
      throw error
    }
  }

  static async recordProgress(progress: Omit<ProgramProgress, "id" | "created_at">): Promise<ProgramProgress> {
    try {
      const { data, error } = await supabase.from("program_progress").insert(progress).select().single()

      if (error) {
        console.error("Error recording program progress:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in recordProgress:", error)
      throw error
    }
  }

  static async getProgressHistory(programId: string, exerciseId: string): Promise<ProgramProgress[]> {
    try {
      const { data, error } = await supabase
        .from("program_progress")
        .select("*")
        .eq("program_id", programId)
        .eq("exercise_id", exerciseId)
        .order("date", { ascending: false })

      if (error) {
        console.error("Error fetching progress history:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getProgressHistory:", error)
      throw error
    }
  }
}
