export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      access_cards: {
        Row: {
          access_level: string
          card_number: string
          created_at: string | null
          id: string
          is_active: boolean
          issue_date: string | null
          member_id: string
          updated_at: string | null
        }
        Insert: {
          access_level?: string
          card_number: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          issue_date?: string | null
          member_id: string
          updated_at?: string | null
        }
        Update: {
          access_level?: string
          card_number?: string
          created_at?: string | null
          id?: string
          is_active?: boolean
          issue_date?: string | null
          member_id?: string
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
      checkins: {
        Row: {
          check_in_time: string | null
          created_at: string | null
          id: string
          member_id: string
          notes: string | null
        }
        Insert: {
          check_in_time?: string | null
          created_at?: string | null
          id?: string
          member_id: string
          notes?: string | null
        }
        Update: {
          check_in_time?: string | null
          created_at?: string | null
          id?: string
          member_id?: string
          notes?: string | null
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
      class_attendance: {
        Row: {
          attended_at: string | null
          class_id: string | null
          created_by: string | null
          id: string
          member_id: string | null
          notes: string | null
        }
        Insert: {
          attended_at?: string | null
          class_id?: string | null
          created_by?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
        }
        Update: {
          attended_at?: string | null
          class_id?: string | null
          created_by?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_attendance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      class_registrations: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          member_id: string | null
          status: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          member_id?: string | null
          status?: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          member_id?: string | null
          status?: string
        }
        Relationships: []
      }
      classes: {
        Row: {
          created_at: string | null
          current_enrollment: number
          day_of_week: string
          description: string | null
          end_time: string
          id: string
          level: string
          max_capacity: number
          name: string
          organization_id: string | null
          start_time: string
          status: string
          trainer_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_enrollment?: number
          day_of_week: string
          description?: string | null
          end_time: string
          id?: string
          level: string
          max_capacity?: number
          name: string
          organization_id?: string | null
          start_time: string
          status?: string
          trainer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_enrollment?: number
          day_of_week?: string
          description?: string | null
          end_time?: string
          id?: string
          level?: string
          max_capacity?: number
          name?: string
          organization_id?: string | null
          start_time?: string
          status?: string
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "classes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_checkins: {
        Row: {
          check_in_time: string | null
          created_at: string | null
          id: string
          member_id: string | null
          notes: string | null
          organization_id: string | null
        }
        Insert: {
          check_in_time?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          organization_id?: string | null
        }
        Update: {
          check_in_time?: string | null
          created_at?: string | null
          id?: string
          member_id?: string | null
          notes?: string | null
          organization_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_checkins_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_checkins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_member_insurance: {
        Row: {
          created_at: string | null
          end_date: string | null
          has_insurance: boolean | null
          id: string
          member_id: string | null
          start_date: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          has_insurance?: boolean | null
          id?: string
          member_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          has_insurance?: boolean | null
          id?: string
          member_id?: string | null
          start_date?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_member_insurance_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_members: {
        Row: {
          created_at: string | null
          created_by: string | null
          dateOfBirth: string | null
          email: string | null
          gender: string | null
          id: string
          last_name: string | null
          name: string
          organization_id: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          dateOfBirth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          name: string
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          dateOfBirth?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          name?: string
          organization_id?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      custom_memberships: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          member_id: string | null
          membership_type: string | null
          organization_id: string | null
          payment_status: string | null
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          membership_type?: string | null
          organization_id?: string | null
          payment_status?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          membership_type?: string | null
          organization_id?: string | null
          payment_status?: string | null
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "custom_memberships_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "custom_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      files: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          member_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          member_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          member_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "files_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      group_subscriptions: {
        Row: {
          annual_price: number
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          organization_id: string | null
          price_four_months: number
          price_per_month: number
          price_six_months: number
          price_three_months: number
          price_two_months: number
          schedule: Json | null
          updated_at: string | null
        }
        Insert: {
          annual_price: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          organization_id?: string | null
          price_four_months: number
          price_per_month: number
          price_six_months: number
          price_three_months: number
          price_two_months: number
          schedule?: Json | null
          updated_at?: string | null
        }
        Update: {
          annual_price?: number
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          organization_id?: string | null
          price_four_months?: number
          price_per_month?: number
          price_six_months?: number
          price_three_months?: number
          price_two_months?: number
          schedule?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      hyp_payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string | null
          id: string
          member_id: string
          metadata: Json | null
          payment_id: string
          payment_url: string | null
          status: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string | null
          id?: string
          member_id: string
          metadata?: Json | null
          payment_id: string
          payment_url?: string | null
          status: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string | null
          id?: string
          member_id?: string
          metadata?: Json | null
          payment_id?: string
          payment_url?: string | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hyp_payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_files: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          member_id: string
          updated_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          member_id: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          member_id?: string
          updated_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_files_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          member_id: string
          start_date: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          member_id: string
          start_date: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          member_id?: string
          start_date?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_programs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      member_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          member_id: string
          priority: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          member_id: string
          priority?: string
          status?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          member_id?: string
          priority?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "member_tasks_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      memberships: {
        Row: {
          created_at: string | null
          end_date: string | null
          id: string
          member_id: string
          membership_type: string
          payment_status: string
          start_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id: string
          membership_type: string
          payment_status?: string
          start_date?: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          end_date?: string | null
          id?: string
          member_id?: string
          membership_type?: string
          payment_status?: string
          start_date?: string
          status?: string
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
      messages: {
        Row: {
          content: string
          id: string
          is_read: boolean | null
          member_id: string | null
          message_type: string | null
          organization_id: string | null
          sent_at: string | null
          sent_by: string | null
          subject: string | null
        }
        Insert: {
          content: string
          id?: string
          is_read?: boolean | null
          member_id?: string | null
          message_type?: string | null
          organization_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          subject?: string | null
        }
        Update: {
          content?: string
          id?: string
          is_read?: boolean | null
          member_id?: string | null
          message_type?: string | null
          organization_id?: string | null
          sent_at?: string | null
          sent_by?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string | null
          id: string
          organization_id: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          organization_id?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_holder_name: string | null
          created_at: string | null
          expiry_date: string | null
          id: string
          is_default: boolean | null
          last_four: string | null
          payment_type: string
          provider: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          card_holder_name?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          payment_type: string
          provider?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          card_holder_name?: string | null
          created_at?: string | null
          expiry_date?: string | null
          id?: string
          is_default?: boolean | null
          last_four?: string | null
          payment_type?: string
          provider?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          member_id: string
          organization_id: string | null
          payment_date: string | null
          payment_details: Json | null
          payment_method: string
          payment_method_id: string | null
          receipt_number: string | null
          status: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          member_id: string
          organization_id?: string | null
          payment_date?: string | null
          payment_details?: Json | null
          payment_method: string
          payment_method_id?: string | null
          receipt_number?: string | null
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          member_id?: string
          organization_id?: string | null
          payment_date?: string | null
          payment_details?: Json | null
          payment_method?: string
          payment_method_id?: string | null
          receipt_number?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          email: string
          gender: string | null
          id: string
          last_name: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email: string
          gender?: string | null
          id: string
          last_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          gender?: string | null
          id?: string
          last_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles_no_fk: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          last_name: string | null
          name: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id: string
          last_name?: string | null
          name: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          age?: number | null
          avatar_url?: string | null
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          last_name?: string | null
          name?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      program_exercises: {
        Row: {
          created_at: string | null
          day_of_week: string
          exercise_name: string
          id: string
          notes: string | null
          order_index: number
          program_id: string
          reps: string
          rest_time: string | null
          sets: number
          updated_at: string | null
          weight: string | null
        }
        Insert: {
          created_at?: string | null
          day_of_week: string
          exercise_name: string
          id?: string
          notes?: string | null
          order_index?: number
          program_id: string
          reps?: string
          rest_time?: string | null
          sets?: number
          updated_at?: string | null
          weight?: string | null
        }
        Update: {
          created_at?: string | null
          day_of_week?: string
          exercise_name?: string
          id?: string
          notes?: string | null
          order_index?: number
          program_id?: string
          reps?: string
          rest_time?: string | null
          sets?: number
          updated_at?: string | null
          weight?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_exercises_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "member_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      program_progress: {
        Row: {
          created_at: string | null
          date: string
          exercise_id: string
          id: string
          notes: string | null
          program_id: string
          reps_completed: string
          sets_completed: number
          weight_used: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          exercise_id: string
          id?: string
          notes?: string | null
          program_id: string
          reps_completed: string
          sets_completed: number
          weight_used?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          exercise_id?: string
          id?: string
          notes?: string | null
          program_id?: string
          reps_completed?: string
          sets_completed?: number
          weight_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "program_progress_exercise_id_fkey"
            columns: ["exercise_id"]
            isOneToOne: false
            referencedRelation: "program_exercises"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "program_progress_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "member_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          auth: string
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          auth?: string
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          address: string | null
          auto_renewals: boolean | null
          backup_frequency: string | null
          business_info: Json | null
          created_at: string | null
          email: string | null
          gym_name: string | null
          id: string
          language: string | null
          member_reminders: boolean | null
          notifications: Json | null
          organization_id: string
          phone: string | null
          privacy_settings: Json | null
          sms_settings: Json | null
          tax_rate: number | null
          updated_at: string | null
          working_hours: Json | null
        }
        Insert: {
          address?: string | null
          auto_renewals?: boolean | null
          backup_frequency?: string | null
          business_info?: Json | null
          created_at?: string | null
          email?: string | null
          gym_name?: string | null
          id?: string
          language?: string | null
          member_reminders?: boolean | null
          notifications?: Json | null
          organization_id: string
          phone?: string | null
          privacy_settings?: Json | null
          sms_settings?: Json | null
          tax_rate?: number | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Update: {
          address?: string | null
          auto_renewals?: boolean | null
          backup_frequency?: string | null
          business_info?: Json | null
          created_at?: string | null
          email?: string | null
          gym_name?: string | null
          id?: string
          language?: string | null
          member_reminders?: boolean | null
          notifications?: Json | null
          organization_id?: string
          phone?: string | null
          privacy_settings?: Json | null
          sms_settings?: Json | null
          tax_rate?: number | null
          updated_at?: string | null
          working_hours?: Json | null
        }
        Relationships: []
      }
      staff: {
        Row: {
          created_at: string | null
          department: string
          email: string
          hire_date: string | null
          id: string
          name: string
          organization_id: string | null
          phone: string | null
          role: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          department: string
          email: string
          hire_date?: string | null
          id?: string
          name: string
          organization_id?: string | null
          phone?: string | null
          role: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string
          email?: string
          hire_date?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          organization_id: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          organization_id?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          organization_id?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          member_id: string | null
          priority: string | null
          status: string | null
          title: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          member_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          member_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_entries: {
        Row: {
          created_at: string | null
          created_by: string | null
          entry_date: string | null
          id: string
          metrics: Json | null
          notes: string | null
          program_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          entry_date?: string | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          program_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          entry_date?: string | null
          id?: string
          metrics?: Json | null
          notes?: string | null
          program_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_entries_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "tracking_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_programs: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          member_id: string | null
          program_name: string
          start_date: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          program_name: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          member_id?: string | null
          program_name?: string
          start_date?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_programs_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "custom_members"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_configs: {
        Row: {
          access_token: string | null
          business_account_id: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          organization_id: string | null
          phone_number_id: string | null
          updated_at: string | null
          webhook_verify_token: string | null
        }
        Insert: {
          access_token?: string | null
          business_account_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone_number_id?: string | null
          updated_at?: string | null
          webhook_verify_token?: string | null
        }
        Update: {
          access_token?: string | null
          business_account_id?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          organization_id?: string | null
          phone_number_id?: string | null
          updated_at?: string | null
          webhook_verify_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_configs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whatsapp_incoming_messages: {
        Row: {
          content: string | null
          created_at: string | null
          id: string
          message_id: string
          message_type: string
          sender: string
          timestamp: string
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          id?: string
          message_id: string
          message_type: string
          sender: string
          timestamp: string
        }
        Update: {
          content?: string | null
          created_at?: string | null
          id?: string
          message_id?: string
          message_type?: string
          sender?: string
          timestamp?: string
        }
        Relationships: []
      }
      whatsapp_message_statuses: {
        Row: {
          created_at: string | null
          id: string
          message_id: string
          recipient: string | null
          status: string
          timestamp: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          message_id: string
          recipient?: string | null
          status: string
          timestamp: string
        }
        Update: {
          created_at?: string | null
          id?: string
          message_id?: string
          recipient?: string | null
          status?: string
          timestamp?: string
        }
        Relationships: []
      }
      whatsapp_outgoing_messages: {
        Row: {
          api_response: Json | null
          content: string
          created_at: string | null
          id: string
          message_id: string | null
          message_type: string | null
          recipient: string
          status: string
          template_id: string | null
          template_variables: Json | null
          timestamp: string
        }
        Insert: {
          api_response?: Json | null
          content: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          message_type?: string | null
          recipient: string
          status: string
          template_id?: string | null
          template_variables?: Json | null
          timestamp: string
        }
        Update: {
          api_response?: Json | null
          content?: string
          created_at?: string | null
          id?: string
          message_id?: string | null
          message_type?: string | null
          recipient?: string
          status?: string
          template_id?: string | null
          template_variables?: Json | null
          timestamp?: string
        }
        Relationships: []
      }
      workout_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          name: string
          profile_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          profile_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          profile_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workout_plans_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "workout_plans_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      all_profiles: {
        Row: {
          age: number | null
          avatar_url: string | null
          created_at: string | null
          email: string | null
          gender: string | null
          id: string | null
          last_name: string | null
          name: string | null
          phone: string | null
          updated_at: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      create_dummy_user: {
        Args: { user_id: string; user_email: string }
        Returns: undefined
      }
      create_organization_with_owner: {
        Args: { org_name: string; org_slug: string; user_id: string }
        Returns: string
      }
      get_user_organization: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
    }
    Enums: {
      unassigned: "unassigned"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      unassigned: ["unassigned"],
    },
  },
} as const
