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
      class_registrations: {
        Row: {
          class_id: string
          created_at: string | null
          id: string
          profile_id: string
          status: string
        }
        Insert: {
          class_id: string
          created_at?: string | null
          id?: string
          profile_id: string
          status?: string
        }
        Update: {
          class_id?: string
          created_at?: string | null
          id?: string
          profile_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_registrations_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_registrations_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
          start_time?: string
          status?: string
          trainer_id?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      group_subscriptions: {
        Row: {
          annual_price: number
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
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
          price_four_months?: number
          price_per_month?: number
          price_six_months?: number
          price_three_months?: number
          price_two_months?: number
          schedule?: Json | null
          updated_at?: string | null
        }
        Relationships: []
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
          payment_date: string | null
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
          payment_date?: string | null
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
          payment_date?: string | null
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
            referencedRelation: "profiles"
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
          phone?: string | null
          role?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
    Enums: {},
  },
} as const
