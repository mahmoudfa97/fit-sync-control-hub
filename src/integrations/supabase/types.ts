export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          name: string
          last_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          age: number | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id: string
          name: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          age?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          last_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          age?: number | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          id: string
          member_id: string
          membership_type: string
          start_date: string
          end_date: string | null
          status: string
          payment_status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          membership_type: string
          start_date: string
          end_date?: string | null
          status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          membership_type?: string
          start_date?: string
          end_date?: string | null
          status?: string
          payment_status?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      checkins: {
        Row: {
          id: string
          member_id: string
          check_in_time: string
          notes: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          check_in_time: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          check_in_time?: string
          notes?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          id: string
          member_id: string
          amount: number
          payment_date: string
          payment_method: string
          status: string
          description: string | null
          receipt_number: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          amount: number
          payment_date: string
          payment_method: string
          status?: string
          description?: string | null
          receipt_number?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          amount?: number
          payment_date?: string
          payment_method?: string
          status?: string
          description?: string | null
          receipt_number?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      access_cards: {
        Row: {
          id: string
          member_id: string
          card_number: string
          issue_date: string
          expiry_date: string | null
          status: string
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          card_number: string
          issue_date: string
          expiry_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          card_number?: string
          issue_date?: string
          expiry_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_cards_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      classes: {
        Row: {
          id: string
          name: string | null
          description: string | null
          instructor_id: string | null
          start_time: string | null
          end_time: string | null
          weekday: string | null
          max_capacity: number | null
          current_enrollment: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          description?: string | null
          instructor_id?: string | null
          start_time?: string | null
          end_time?: string | null
          weekday?: string | null
          max_capacity?: number | null
          current_enrollment?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          description?: string | null
          instructor_id?: string | null
          start_time?: string | null
          end_time?: string | null
          weekday?: string | null
          max_capacity?: number | null
          current_enrollment?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      class_registration: {
        Row: {
          id: string
          member_id: string
          class_id: string
          registration_date: string | null
          status: string
          attendance_status: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          class_id: string
          registration_date?: string | null
          status?: string
          attendance_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          class_id?: string
          registration_date?: string | null
          status?: string
          attendance_status?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_registration_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_registration_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          id: string
          name: string | null
          email: string | null
          phone: string | null
          position: string | null
          avatar_url: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          position?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string | null
          email?: string | null
          phone?: string | null
          position?: string | null
          avatar_url?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          user_id: string
          role: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          role: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          role?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      workoutplans: {
        Row: {
          id: string
          member_id: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          created_by: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workoutplans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workoutplans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      equipment: {
        Row: {
          id: string
          name: string
          description: string | null
          purchase_date: string | null
          maintenance_date: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          purchase_date?: string | null
          maintenance_date?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          purchase_date?: string | null
          maintenance_date?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      exercises: {
        Row: {
          id: string
          name: string
          description: string | null
          muscle_group: string | null
          equipment_id: string | null
          difficulty: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          muscle_group?: string | null
          equipment_id?: string | null
          difficulty?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          muscle_group?: string | null
          equipment_id?: string | null
          difficulty?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exercises_equipment_id_fkey"
            columns: ["equipment_id"]
            isOneToOne: false
            referencedRelation: "equipment"
            referencedColumns: ["id"]
          },
        ]
      }
      nutrition_plans: {
        Row: {
          id: string
          member_id: string
          title: string
          description: string | null
          start_date: string | null
          end_date: string | null
          created_by: string | null
          status: string
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          member_id: string
          title: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          member_id?: string
          title?: string
          description?: string | null
          start_date?: string | null
          end_date?: string | null
          created_by?: string | null
          status?: string
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "nutrition_plans_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "nutrition_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// Helper type to get a table's row type
export type Tables<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"]

// Helper type for insert operations
export type TablesInsert<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Insert"]

// Helper type for update operations
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Update"]
