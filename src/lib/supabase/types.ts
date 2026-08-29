/**
 * Types générés à partir du schéma Supabase (public.*). À régénérer avec
 * `supabase gen types typescript` quand le schéma évolue plutôt qu'édités
 * à la main au-delà de ce point de départ.
 */
export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          pseudo: string;
          phone: string | null;
          role: "buyer" | "admin";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          pseudo: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      sellers: {
        Row: {
          profile_id: string;
          kyc_status: "pending" | "verified" | "rejected";
          id_document_path: string | null;
          birth_certificate_path: string | null;
          selfie_path: string | null;
          kyc_submitted_at: string | null;
          kyc_reviewed_at: string | null;
          kyc_rejection_reason: string | null;
          sales_count: number;
          rating: number | null;
          disputes_count: number;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["sellers"]["Row"]> & {
          profile_id: string;
        };
        Update: Partial<Database["public"]["Tables"]["sellers"]["Row"]>;
      };
      games: {
        Row: {
          slug: string;
          name: string;
          image: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["games"]["Row"]> & {
          slug: string;
          name: string;
          image: string;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Row"]>;
      };
      listings: {
        Row: {
          id: string;
          game_slug: string;
          seller_id: string;
          title: string;
          description: string;
          price_xof: number;
          images: string[];
          status: "draft" | "pending" | "live" | "sold";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["listings"]["Row"]> & {
          game_slug: string;
          seller_id: string;
          title: string;
          price_xof: number;
        };
        Update: Partial<Database["public"]["Tables"]["listings"]["Row"]>;
      };
      orders: {
        Row: {
          id: string;
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount_xof: number;
          status:
            | "pending_payment"
            | "held"
            | "released"
            | "refunded"
            | "disputed"
            | "cancelled";
          delivered_at: string | null;
          confirm_deadline: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["orders"]["Row"]> & {
          listing_id: string;
          buyer_id: string;
          seller_id: string;
          amount_xof: number;
        };
        Update: Partial<Database["public"]["Tables"]["orders"]["Row"]>;
      };
      payment_transactions: {
        Row: {
          id: string;
          order_id: string;
          buyer_id: string;
          provider: string;
          provider_reference: string | null;
          status: "pending" | "success" | "failed";
          amount_xof: number;
          raw_payload: Record<string, unknown> | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<
          Database["public"]["Tables"]["payment_transactions"]["Row"]
        > & {
          order_id: string;
          buyer_id: string;
          amount_xof: number;
        };
        Update: Partial<
          Database["public"]["Tables"]["payment_transactions"]["Row"]
        >;
      };
      disputes: {
        Row: {
          id: string;
          order_id: string;
          opened_by: string;
          reason: string;
          status: "open" | "resolved";
          resolution: string | null;
          created_at: string;
          resolved_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["disputes"]["Row"]> & {
          order_id: string;
          opened_by: string;
          reason: string;
        };
        Update: Partial<Database["public"]["Tables"]["disputes"]["Row"]>;
      };
    };
    Views: {
      game_stats: {
        Row: {
          slug: string;
          name: string;
          image: string;
          sort_order: number;
          listing_count: number;
          min_price_xof: number | null;
        };
      };
    };
  };
};
