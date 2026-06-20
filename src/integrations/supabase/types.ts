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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      community_posts: {
        Row: {
          content: string
          created_at: string
          event_id: string | null
          id: string
          type: string
          user_id: string
          user_name: string
        }
        Insert: {
          content: string
          created_at?: string
          event_id?: string | null
          id?: string
          type?: string
          user_id: string
          user_name: string
        }
        Update: {
          content?: string
          created_at?: string
          event_id?: string | null
          id?: string
          type?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_posts_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          artist: string | null
          available_tickets: number
          city: string
          created_at: string
          description: string | null
          event_date: string
          event_time: string
          genre: string
          id: string
          image: string | null
          manager_id: string
          original_price: number
          price: number
          title: string
          total_tickets: number
          updated_at: string
          venue: string
        }
        Insert: {
          artist?: string | null
          available_tickets?: number
          city: string
          created_at?: string
          description?: string | null
          event_date: string
          event_time: string
          genre: string
          id?: string
          image?: string | null
          manager_id: string
          original_price: number
          price: number
          title: string
          total_tickets?: number
          updated_at?: string
          venue: string
        }
        Update: {
          artist?: string | null
          available_tickets?: number
          city?: string
          created_at?: string
          description?: string | null
          event_date?: string
          event_time?: string
          genre?: string
          id?: string
          image?: string | null
          manager_id?: string
          original_price?: number
          price?: number
          title?: string
          total_tickets?: number
          updated_at?: string
          venue?: string
        }
        Relationships: []
      }
      group_participants: {
        Row: {
          created_at: string
          email: string | null
          group_id: string
          has_paid: boolean
          id: string
          name: string
          ticket_count: number
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          group_id: string
          has_paid?: boolean
          id?: string
          name: string
          ticket_count?: number
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          group_id?: string
          has_paid?: boolean
          id?: string
          name?: string
          ticket_count?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "group_participants_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "group_purchases"
            referencedColumns: ["id"]
          },
        ]
      }
      group_purchases: {
        Row: {
          created_at: string
          event_id: string
          expires_at: string
          id: string
          organizer_id: string
          price_per_ticket: number
          status: string
          total_tickets: number
        }
        Insert: {
          created_at?: string
          event_id: string
          expires_at: string
          id?: string
          organizer_id: string
          price_per_ticket: number
          status?: string
          total_tickets: number
        }
        Update: {
          created_at?: string
          event_id?: string
          expires_at?: string
          id?: string
          organizer_id?: string
          price_per_ticket?: number
          status?: string
          total_tickets?: number
        }
        Relationships: [
          {
            foreignKeyName: "group_purchases_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      inquiries: {
        Row: {
          created_at: string
          event_id: string
          id: string
          message: string
          status: string
          subject: string
          type: string
          user_id: string
          user_name: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          message: string
          status?: string
          subject: string
          type?: string
          user_id: string
          user_name: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          message?: string
          status?: string
          subject?: string
          type?: string
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          preferred_artists: string[] | null
          preferred_genres: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_artists?: string[] | null
          preferred_genres?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          preferred_artists?: string[] | null
          preferred_genres?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tickets: {
        Row: {
          created_at: string
          event_city: string
          event_date: string
          event_id: string
          event_image: string | null
          event_time: string
          event_title: string
          event_venue: string
          id: string
          is_for_sale: boolean | null
          price: number
          purchase_date: string
          qr_code: string | null
          sale_price: number | null
          seat_info: string | null
          ticket_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          event_city: string
          event_date: string
          event_id: string
          event_image?: string | null
          event_time: string
          event_title: string
          event_venue: string
          id?: string
          is_for_sale?: boolean | null
          price: number
          purchase_date?: string
          qr_code?: string | null
          sale_price?: number | null
          seat_info?: string | null
          ticket_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          event_city?: string
          event_date?: string
          event_id?: string
          event_image?: string | null
          event_time?: string
          event_title?: string
          event_venue?: string
          id?: string
          is_for_sale?: boolean | null
          price?: number
          purchase_date?: string
          qr_code?: string | null
          sale_price?: number | null
          seat_info?: string | null
          ticket_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          buyer_id: string
          created_at: string
          event_id: string | null
          id: string
          seller_id: string | null
          ticket_id: string | null
          type: string
        }
        Insert: {
          amount: number
          buyer_id: string
          created_at?: string
          event_id?: string | null
          id?: string
          seller_id?: string | null
          ticket_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          buyer_id?: string
          created_at?: string
          event_id?: string | null
          id?: string
          seller_id?: string | null
          ticket_id?: string | null
          type?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_expired_groups: { Args: never; Returns: number }
      complete_group_if_paid: { Args: { p_group_id: string }; Returns: string }
      get_tickets_for_sale: {
        Args: never
        Returns: {
          created_at: string
          event_city: string
          event_date: string
          event_id: string
          event_image: string
          event_time: string
          event_title: string
          event_venue: string
          id: string
          sale_price: number
          seat_info: string
          ticket_type: string
        }[]
      }
      has_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: boolean
      }
      list_ticket_for_resale: {
        Args: { p_price: number; p_ticket_id: string }
        Returns: {
          created_at: string
          event_city: string
          event_date: string
          event_id: string
          event_image: string | null
          event_time: string
          event_title: string
          event_venue: string
          id: string
          is_for_sale: boolean | null
          price: number
          purchase_date: string
          qr_code: string | null
          sale_price: number | null
          seat_info: string | null
          ticket_type: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      purchase_ticket: {
        Args: { p_event_id: string; p_seat_info: string }
        Returns: {
          created_at: string
          event_city: string
          event_date: string
          event_id: string
          event_image: string | null
          event_time: string
          event_title: string
          event_venue: string
          id: string
          is_for_sale: boolean | null
          price: number
          purchase_date: string
          qr_code: string | null
          sale_price: number | null
          seat_info: string | null
          ticket_type: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      transfer_ticket_ownership: {
        Args: { p_buyer_name: string; p_ticket_id: string }
        Returns: {
          created_at: string
          event_city: string
          event_date: string
          event_id: string
          event_image: string | null
          event_time: string
          event_title: string
          event_venue: string
          id: string
          is_for_sale: boolean | null
          price: number
          purchase_date: string
          qr_code: string | null
          sale_price: number | null
          seat_info: string | null
          ticket_type: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
      unlist_ticket: {
        Args: { p_ticket_id: string }
        Returns: {
          created_at: string
          event_city: string
          event_date: string
          event_id: string
          event_image: string | null
          event_time: string
          event_title: string
          event_venue: string
          id: string
          is_for_sale: boolean | null
          price: number
          purchase_date: string
          qr_code: string | null
          sale_price: number | null
          seat_info: string | null
          ticket_type: string
          updated_at: string
          user_id: string
        }
        SetofOptions: {
          from: "*"
          to: "tickets"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user" | "manager"
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
    Enums: {
      app_role: ["admin", "user", "manager"],
    },
  },
} as const
