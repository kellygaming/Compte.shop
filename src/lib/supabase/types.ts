/**
 * Généré via `mcp__Supabase__generate_typescript_types` (équivalent de
 * `supabase gen types typescript`). À régénérer de la même façon après
 * toute migration plutôt qu'édité à la main.
 */
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
      dispute_messages: {
        Row: {
          body: string
          created_at: string
          dispute_id: string
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          created_at?: string
          dispute_id: string
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          created_at?: string
          dispute_id?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dispute_messages_dispute_id_fkey"
            columns: ["dispute_id"]
            isOneToOne: false
            referencedRelation: "disputes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dispute_messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      disputes: {
        Row: {
          created_at: string
          escalated_at: string | null
          id: string
          opened_by: string
          order_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          status: string
        }
        Insert: {
          created_at?: string
          escalated_at?: string | null
          id?: string
          opened_by: string
          order_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          escalated_at?: string | null
          id?: string
          opened_by?: string
          order_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "disputes_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      games: {
        Row: {
          created_at: string
          image: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          image: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          image?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      listings: {
        Row: {
          created_at: string
          delivery_instructions: string
          delivery_type: string
          description: string
          game_slug: string
          id: string
          images: string[]
          price_xof: number
          seller_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          delivery_instructions?: string
          delivery_type?: string
          description?: string
          game_slug: string
          id?: string
          images?: string[]
          price_xof: number
          seller_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          delivery_instructions?: string
          delivery_type?: string
          description?: string
          game_slug?: string
          id?: string
          images?: string[]
          price_xof?: number
          seller_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "listings_game_slug_fkey"
            columns: ["game_slug"]
            isOneToOne: false
            referencedRelation: "game_stats"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "listings_game_slug_fkey"
            columns: ["game_slug"]
            isOneToOne: false
            referencedRelation: "games"
            referencedColumns: ["slug"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      orders: {
        Row: {
          amount_xof: number
          buyer_id: string
          confirm_deadline: string | null
          created_at: string
          delivered_at: string | null
          delivery_note: string | null
          id: string
          listing_id: string
          paid_out_at: string | null
          payout_requested_at: string | null
          seller_confirmed_at: string | null
          seller_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount_xof: number
          buyer_id: string
          confirm_deadline?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_note?: string | null
          id?: string
          listing_id: string
          paid_out_at?: string | null
          payout_requested_at?: string | null
          seller_confirmed_at?: string | null
          seller_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount_xof?: number
          buyer_id?: string
          confirm_deadline?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_note?: string | null
          id?: string
          listing_id?: string
          paid_out_at?: string | null
          payout_requested_at?: string | null
          seller_confirmed_at?: string | null
          seller_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "sellers"
            referencedColumns: ["profile_id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount_xof: number
          buyer_id: string
          created_at: string
          id: string
          order_id: string
          provider: string
          provider_reference: string | null
          raw_payload: Json | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_xof: number
          buyer_id: string
          created_at?: string
          id?: string
          order_id: string
          provider?: string
          provider_reference?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_xof?: number
          buyer_id?: string
          created_at?: string
          id?: string
          order_id?: string
          provider?: string
          provider_reference?: string | null
          raw_payload?: Json | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          phone: string | null
          pseudo: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          phone?: string | null
          pseudo: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          phone?: string | null
          pseudo?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      sellers: {
        Row: {
          birth_certificate_path: string | null
          created_at: string
          disputes_count: number
          id_document_path: string | null
          kyc_rejection_reason: string | null
          kyc_reviewed_at: string | null
          kyc_status: string
          kyc_submitted_at: string | null
          profile_id: string
          rating: number | null
          sales_count: number
          selfie_path: string | null
          updated_at: string
        }
        Insert: {
          birth_certificate_path?: string | null
          created_at?: string
          disputes_count?: number
          id_document_path?: string | null
          kyc_rejection_reason?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          profile_id: string
          rating?: number | null
          sales_count?: number
          selfie_path?: string | null
          updated_at?: string
        }
        Update: {
          birth_certificate_path?: string | null
          created_at?: string
          disputes_count?: number
          id_document_path?: string | null
          kyc_rejection_reason?: string | null
          kyc_reviewed_at?: string | null
          kyc_status?: string
          kyc_submitted_at?: string | null
          profile_id?: string
          rating?: number | null
          sales_count?: number
          selfie_path?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sellers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      game_stats: {
        Row: {
          image: string | null
          listing_count: number | null
          min_price_xof: number | null
          name: string | null
          slug: string | null
          sort_order: number | null
        }
        Relationships: []
      }
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
