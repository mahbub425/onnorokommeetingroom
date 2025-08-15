export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      admin: {
        Row: {
          created_at: string
          id: string
          password_hash: string
          username: string
        }
        Insert: {
          created_at?: string
          id?: string
          password_hash: string
          username: string
        }
        Update: {
          created_at?: string
          id?: string
          password_hash?: string
          username?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          concern: string
          created_at: string
          doctor_id: string
          id: string
          patient_id: string
          patient_name: string
          patient_pin: string
          phone: string
          reason: string
          schedule_end: string
          schedule_start: string
          serial_number: number
          status: string
          updated_at: string
        }
        Insert: {
          appointment_date: string
          concern: string
          created_at?: string
          doctor_id: string
          id?: string
          patient_id: string
          patient_name: string
          patient_pin: string
          phone: string
          reason: string
          schedule_end: string
          schedule_start: string
          serial_number: number
          status?: string
          updated_at?: string
        }
        Update: {
          appointment_date?: string
          concern?: string
          created_at?: string
          doctor_id?: string
          id?: string
          patient_id?: string
          patient_name?: string
          patient_pin?: string
          phone?: string
          reason?: string
          schedule_end?: string
          schedule_start?: string
          serial_number?: number
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          approved_by_admin_id: string | null
          created_at: string | null
          created_by_pin: string | null
          end_time: string
          guest_emails: string[] | null
          id: string
          is_guest_allowed: boolean | null
          is_recurring: boolean | null
          meeting_title: string
          parent_booking_id: string | null
          recurrence_end_date: string | null
          recurrence_rule: string | null
          rejection_reason: string | null
          remarks: string | null
          repeat_type: string
          room_id: string
          serial_number: number | null
          start_time: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          approved_by_admin_id?: string | null
          created_at?: string | null
          created_by_pin?: string | null
          end_time: string
          guest_emails?: string[] | null
          id?: string
          is_guest_allowed?: boolean | null
          is_recurring?: boolean | null
          meeting_title: string
          parent_booking_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          repeat_type?: string
          room_id: string
          serial_number?: number | null
          start_time: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          approved_by_admin_id?: string | null
          created_at?: string | null
          created_by_pin?: string | null
          end_time?: string
          guest_emails?: string[] | null
          id?: string
          is_guest_allowed?: boolean | null
          is_recurring?: boolean | null
          meeting_title?: string
          parent_booking_id?: string | null
          recurrence_end_date?: string | null
          recurrence_rule?: string | null
          rejection_reason?: string | null
          remarks?: string | null
          repeat_type?: string
          room_id?: string
          serial_number?: number | null
          start_time?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_approved_by_admin_id_fkey"
            columns: ["approved_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_created_by_pin_fkey"
            columns: ["created_by_pin"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["pin"]
          },
          {
            foreignKeyName: "bookings_parent_booking_id_fkey"
            columns: ["parent_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_room_id_fkey"
            columns: ["room_id"]
            isOneToOne: false
            referencedRelation: "meeting_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          availability_date: string | null
          break_end: string | null
          break_start: string | null
          created_at: string
          degree: string
          designation: string | null
          end_time: string | null
          experience: string | null
          form_activation_date: string | null
          id: string
          name: string
          password_hash: string
          patient_limit: number | null
          start_time: string | null
          updated_at: string
          username: string
        }
        Insert: {
          availability_date?: string | null
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          degree: string
          designation?: string | null
          end_time?: string | null
          experience?: string | null
          form_activation_date?: string | null
          id?: string
          name: string
          password_hash: string
          patient_limit?: number | null
          start_time?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          availability_date?: string | null
          break_end?: string | null
          break_start?: string | null
          created_at?: string
          degree?: string
          designation?: string | null
          end_time?: string | null
          experience?: string | null
          form_activation_date?: string | null
          id?: string
          name?: string
          password_hash?: string
          patient_limit?: number | null
          start_time?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      meeting_room_categories: {
        Row: {
          allow_public_bookings: boolean | null
          approval_required: boolean | null
          color: string | null
          created_at: string | null
          id: string
          manager_id: string | null
          name: string
          updated_at: string | null
        }
        Insert: {
          allow_public_bookings?: boolean | null
          approval_required?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name: string
          updated_at?: string | null
        }
        Update: {
          allow_public_bookings?: boolean | null
          approval_required?: boolean | null
          color?: string | null
          created_at?: string | null
          id?: string
          manager_id?: string | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_rooms: {
        Row: {
          available_time_limit: string | null
          capacity: number | null
          category_id: string | null
          created_at: string | null
          facilities: string | null
          id: string
          image_url: string | null
          is_enabled: boolean
          name: string
          updated_at: string | null
        }
        Insert: {
          available_time_limit?: string | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string | null
          facilities?: string | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          name: string
          updated_at?: string | null
        }
        Update: {
          available_time_limit?: string | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string | null
          facilities?: string | null
          id?: string
          image_url?: string | null
          is_enabled?: boolean
          name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_rooms_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "meeting_room_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_settings: {
        Row: {
          auto_permission_categories: string[] | null
          created_at: string | null
          default_language: string
          default_time_format: string
          default_week_start_day: string
          id: string
          limited_booking_time: boolean | null
          office_hours: string | null
          organization_name: string
          personal_calendar_link: string | null
          show_spot_image: boolean | null
          time_zone: string | null
          updated_at: string | null
        }
        Insert: {
          auto_permission_categories?: string[] | null
          created_at?: string | null
          default_language?: string
          default_time_format?: string
          default_week_start_day?: string
          id?: string
          limited_booking_time?: boolean | null
          office_hours?: string | null
          organization_name: string
          personal_calendar_link?: string | null
          show_spot_image?: boolean | null
          time_zone?: string | null
          updated_at?: string | null
        }
        Update: {
          auto_permission_categories?: string[] | null
          created_at?: string | null
          default_language?: string
          default_time_format?: string
          default_week_start_day?: string
          id?: string
          limited_booking_time?: boolean | null
          office_hours?: string | null
          organization_name?: string
          personal_calendar_link?: string | null
          show_spot_image?: boolean | null
          time_zone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      otps: {
        Row: {
          created_at: string | null
          expires_at: string
          id: string
          otp_code: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at: string
          id?: string
          otp_code: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          id?: string
          otp_code?: string
          user_id?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          concern: string
          created_at: string
          id: string
          name: string
          password_hash: string
          phone: string
          pin: string
          updated_at: string
        }
        Insert: {
          concern: string
          created_at?: string
          id?: string
          name: string
          password_hash: string
          phone: string
          pin: string
          updated_at?: string
        }
        Update: {
          concern?: string
          created_at?: string
          id?: string
          name?: string
          password_hash?: string
          phone?: string
          pin?: string
          updated_at?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          advice: string | null
          appointment_id: string | null
          created_at: string
          doctor_id: string
          id: string
          medications: string | null
          patient_id: string
          prescription_date: string
          tests: string | null
          updated_at: string
        }
        Insert: {
          advice?: string | null
          appointment_id?: string | null
          created_at?: string
          doctor_id: string
          id?: string
          medications?: string | null
          patient_id: string
          prescription_date?: string
          tests?: string | null
          updated_at?: string
        }
        Update: {
          advice?: string | null
          appointment_id?: string | null
          created_at?: string
          doctor_id?: string
          id?: string
          medications?: string | null
          patient_id?: string
          prescription_date?: string
          tests?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescriptions_appointment_id_fkey"
            columns: ["appointment_id"]
            isOneToOne: false
            referencedRelation: "appointments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescriptions_patient_id_fkey"
            columns: ["patient_id"]
            isOneToOne: false
            referencedRelation: "patients"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          category_access: string[] | null
          created_at: string | null
          department: string | null
          designation: string | null
          email: string
          id: string
          is_enabled: boolean | null
          language: string | null
          name: string
          notification_preference: boolean | null
          password_hash: string | null
          phone: string | null
          pin: string
          role: string
          time_format: string | null
          updated_at: string | null
          username: string | null
          week_start_day: string | null
        }
        Insert: {
          category_access?: string[] | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email: string
          id: string
          is_enabled?: boolean | null
          language?: string | null
          name: string
          notification_preference?: boolean | null
          password_hash?: string | null
          phone?: string | null
          pin: string
          role?: string
          time_format?: string | null
          updated_at?: string | null
          username?: string | null
          week_start_day?: string | null
        }
        Update: {
          category_access?: string[] | null
          created_at?: string | null
          department?: string | null
          designation?: string | null
          email?: string
          id?: string
          is_enabled?: boolean | null
          language?: string | null
          name?: string
          notification_preference?: boolean | null
          password_hash?: string | null
          phone?: string | null
          pin?: string
          role?: string
          time_format?: string | null
          updated_at?: string | null
          username?: string | null
          week_start_day?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_email_by_pin: {
        Args: { p_pin: string }
        Returns: string
      }
      get_email_by_username: {
        Args: { p_username: string }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
