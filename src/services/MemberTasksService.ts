import { supabase } from "@/integrations/supabase/client"

export interface MemberTask {
  id: string
  member_id: string
  title: string
  description: string | null
  due_date: string | null
  priority: string
  status: string
  assigned_to: string | null
  created_by: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
}

export interface CreateTaskParams {
  memberId: string
  title: string
  description?: string
  dueDate?: string
  priority?: string
  assignedTo?: string
}

export class MemberTasksService {
  static async getTasks(memberId: string): Promise<MemberTask[]> {
    try {
      const { data, error } = await supabase
        .from("member_tasks")
        .select("*")
        .eq("member_id", memberId)
        .order("due_date", { ascending: true })
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching member tasks:", error)
        throw error
      }

      return data || []
    } catch (error) {
      console.error("Error in getTasks:", error)
      throw error
    }
  }

  static async createTask(params: CreateTaskParams): Promise<MemberTask> {
    try {
      const { data, error } = await supabase
        .from("member_tasks")
        .insert({
          member_id: params.memberId,
          title: params.title,
          description: params.description || null,
          due_date: params.dueDate || null,
          priority: params.priority || "medium",
          status: "pending",
          assigned_to: params.assignedTo || null,
        })
        .select()
        .single()

      if (error) {
        console.error("Error creating task:", error)
        throw error
      }

      return data
    } catch (error) {
      console.error("Error in createTask:", error)
      throw error
    }
  }

  static async updateTaskStatus(taskId: string, status: string): Promise<void> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      // If the task is being marked as completed, set the completed_at timestamp
      if (status === "completed") {
        updates.completed_at = new Date().toISOString()
      } else {
        updates.completed_at = null
      }

      const { error } = await supabase.from("member_tasks").update(updates).eq("id", taskId)

      if (error) {
        console.error("Error updating task status:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in updateTaskStatus:", error)
      throw error
    }
  }

  static async deleteTask(taskId: string): Promise<void> {
    try {
      const { error } = await supabase.from("member_tasks").delete().eq("id", taskId)

      if (error) {
        console.error("Error deleting task:", error)
        throw error
      }
    } catch (error) {
      console.error("Error in deleteTask:", error)
      throw error
    }
  }
}
