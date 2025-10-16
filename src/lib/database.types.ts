export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  analytics: {
    Tables: {
      events: {
        Row: {
          anon_id: string | null
          created_at: string
          event_name: string
          event_properties: Json | null
          id: string
          page_path: string | null
          session_id: string
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          created_at?: string
          event_name: string
          event_properties?: Json | null
          id?: string
          page_path?: string | null
          session_id: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          created_at?: string
          event_name?: string
          event_properties?: Json | null
          id?: string
          page_path?: string | null
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      excluded_users: {
        Row: {
          anon_id: string | null
          excluded_at: string
          id: string
          ip_address: unknown | null
          reason: string | null
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          excluded_at?: string
          id?: string
          ip_address?: unknown | null
          reason?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          excluded_at?: string
          id?: string
          ip_address?: unknown | null
          reason?: string | null
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          anon_id: string | null
          browser: string | null
          city: string | null
          country: string | null
          created_at: string
          device_type: string | null
          id: string
          ip_address: unknown | null
          os: string | null
          page_path: string
          page_title: string | null
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          page_path: string
          page_title?: string | null
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          ip_address?: unknown | null
          os?: string | null
          page_path?: string
          page_title?: string | null
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sessions: {
        Row: {
          anon_id: string | null
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          events: number | null
          id: string
          os: string | null
          page_views: number | null
          started_at: string
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events?: number | null
          id: string
          os?: string | null
          page_views?: number | null
          started_at?: string
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events?: number | null
          id?: string
          os?: string | null
          page_views?: number | null
          started_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      v_event_rollup_daily: {
        Row: {
          day: string | null
          event_count: number | null
          event_name: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_referral_traffic_daily: {
        Row: {
          day: string | null
          referrals: number | null
        }
        Relationships: []
      }
      v_referrer_stats: {
        Row: {
          conversion_rate: number | null
          conversions: number | null
          referrer_domain: string | null
          total_sessions: number | null
          total_users: number | null
        }
        Relationships: []
      }
      v_sessions_summary: {
        Row: {
          browser: string | null
          city: string | null
          country: string | null
          device_type: string | null
          duration_seconds: number | null
          ended_at: string | null
          events: number | null
          os: string | null
          page_views: number | null
          session_id: string | null
          started_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events?: number | null
          os?: string | null
          page_views?: number | null
          session_id?: string | null
          started_at?: string | null
          user_id?: string | null
          user_type?: never
        }
        Update: {
          browser?: string | null
          city?: string | null
          country?: string | null
          device_type?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          events?: number | null
          os?: string | null
          page_views?: number | null
          session_id?: string | null
          started_at?: string | null
          user_id?: string | null
          user_type?: never
        }
        Relationships: []
      }
      v_traffic_share: {
        Row: {
          percentage: number | null
          sessions: number | null
          traffic_source: string | null
          users: number | null
        }
        Relationships: []
      }
      v_unique_users_daily: {
        Row: {
          day: string | null
          unique_users: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_analytics_data: {
        Args: { end_date?: string; start_date?: string }
        Returns: {
          avg_session_duration: number
          country_breakdown: Json
          device_breakdown: Json
          top_pages: Json
          total_page_views: number
          total_sessions: number
          unique_visitors: number
        }[]
      }
      track_event: {
        Args: {
          p_anon_id?: string
          p_event_name: string
          p_event_properties?: Json
          p_page_path?: string
          p_session_id: string
          p_user_id?: string
        }
        Returns: string
      }
      track_page_view: {
        Args: {
          p_anon_id?: string
          p_browser?: string
          p_city?: string
          p_country?: string
          p_device_type?: string
          p_ip_address?: unknown
          p_os?: string
          p_page_path: string
          p_page_title?: string
          p_referrer?: string
          p_session_id: string
          p_user_agent?: string
          p_user_id?: string
        }
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
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      admins: {
        Row: {
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      asset: {
        Row: {
          checksum: string | null
          created_at: string
          created_by: string
          duration_ms: number | null
          height: number | null
          id: string
          is_system: boolean | null
          kind: Database["public"]["Enums"]["asset_kind"]
          site_id: string
          storage_key: string
          system_key: string | null
          width: number | null
        }
        Insert: {
          checksum?: string | null
          created_at?: string
          created_by: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          is_system?: boolean | null
          kind: Database["public"]["Enums"]["asset_kind"]
          site_id: string
          storage_key: string
          system_key?: string | null
          width?: number | null
        }
        Update: {
          checksum?: string | null
          created_at?: string
          created_by?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          is_system?: boolean | null
          kind?: Database["public"]["Enums"]["asset_kind"]
          site_id?: string
          storage_key?: string
          system_key?: string | null
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_publish: {
        Row: {
          asset_id: string
          published_at: string
          published_by: string
          version: number
        }
        Insert: {
          asset_id: string
          published_at?: string
          published_by: string
          version: number
        }
        Update: {
          asset_id?: string
          published_at?: string
          published_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_publish_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_usage: {
        Row: {
          asset_id: string
          site_id: string
          used_by_id: string
          used_by_type: string
        }
        Insert: {
          asset_id: string
          site_id: string
          used_by_id: string
          used_by_type: string
        }
        Update: {
          asset_id?: string
          site_id?: string
          used_by_id?: string
          used_by_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "asset_usage_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "asset_usage_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_variant: {
        Row: {
          asset_id: string
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          storage_key: string
          variant_name: string
          width: number | null
        }
        Insert: {
          asset_id: string
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          storage_key: string
          variant_name: string
          width?: number | null
        }
        Update: {
          asset_id?: string
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          storage_key?: string
          variant_name?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "asset_variant_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
        ]
      }
      asset_version: {
        Row: {
          asset_id: string
          created_at: string
          created_by: string
          edit_operation: Json | null
          id: string
          meta: Json
          status: Database["public"]["Enums"]["publish_status"]
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          asset_id: string
          created_at?: string
          created_by: string
          edit_operation?: Json | null
          id?: string
          meta?: Json
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
          updated_by?: string | null
          version: number
        }
        Update: {
          asset_id?: string
          created_at?: string
          created_by?: string
          edit_operation?: Json | null
          id?: string
          meta?: Json
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "asset_version_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "asset"
            referencedColumns: ["id"]
          },
        ]
      }
      block: {
        Row: {
          id: string
          is_system: boolean | null
          site_id: string
          system_key: string | null
          tag: string | null
          type: string
        }
        Insert: {
          id?: string
          is_system?: boolean | null
          site_id: string
          system_key?: string | null
          tag?: string | null
          type: string
        }
        Update: {
          id?: string
          is_system?: boolean | null
          site_id?: string
          system_key?: string | null
          tag?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "block_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      block_publish: {
        Row: {
          block_id: string
          published_at: string
          published_by: string
          version: number
        }
        Insert: {
          block_id: string
          published_at?: string
          published_by: string
          version: number
        }
        Update: {
          block_id?: string
          published_at?: string
          published_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "block_publish_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: true
            referencedRelation: "block"
            referencedColumns: ["id"]
          },
        ]
      }
      block_version: {
        Row: {
          assets: Json
          block_id: string
          content: Json
          created_at: string
          created_by: string
          id: string
          layout_variant: string
          status: Database["public"]["Enums"]["publish_status"]
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          assets?: Json
          block_id: string
          content: Json
          created_at?: string
          created_by: string
          id?: string
          layout_variant: string
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
          updated_by?: string | null
          version: number
        }
        Update: {
          assets?: Json
          block_id?: string
          content?: Json
          created_at?: string
          created_by?: string
          id?: string
          layout_variant?: string
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "block_version_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "block"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_audit_log: {
        Row: {
          action: string
          changes: Json | null
          entity_id: string
          entity_type: string
          id: string
          occurred_at: string
          user_id: string
          user_permissions: string[]
          version: number | null
        }
        Insert: {
          action: string
          changes?: Json | null
          entity_id: string
          entity_type: string
          id?: string
          occurred_at?: string
          user_id: string
          user_permissions: string[]
          version?: number | null
        }
        Update: {
          action?: string
          changes?: Json | null
          entity_id?: string
          entity_type?: string
          id?: string
          occurred_at?: string
          user_id?: string
          user_permissions?: string[]
          version?: number | null
        }
        Relationships: []
      }
      leads: {
        Row: {
          business_name: string | null
          contact_name: string | null
          created_at: string
          email: string
          id: string
          lead_kind: Database["public"]["Enums"]["lead_type"]
          phone: string | null
          social_links: string[] | null
          source_path: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          business_name?: string | null
          contact_name?: string | null
          created_at?: string
          email: string
          id?: string
          lead_kind: Database["public"]["Enums"]["lead_type"]
          phone?: string | null
          social_links?: string[] | null
          source_path?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          business_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_kind?: Database["public"]["Enums"]["lead_type"]
          phone?: string | null
          social_links?: string[] | null
          source_path?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      menu: {
        Row: {
          handle: string
          id: string
          is_system: boolean | null
          label: string
          site_id: string
          system_key: string | null
        }
        Insert: {
          handle: string
          id?: string
          is_system?: boolean | null
          label: string
          site_id: string
          system_key?: string | null
        }
        Update: {
          handle?: string
          id?: string
          is_system?: boolean | null
          label?: string
          site_id?: string
          system_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_publish: {
        Row: {
          menu_id: string
          published_at: string
          published_by: string
          version: number
        }
        Insert: {
          menu_id: string
          published_at?: string
          published_by: string
          version: number
        }
        Update: {
          menu_id?: string
          published_at?: string
          published_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_publish_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: true
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_version: {
        Row: {
          created_at: string
          created_by: string
          id: string
          items: Json
          menu_id: string
          status: Database["public"]["Enums"]["publish_status"]
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          items?: Json
          menu_id: string
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
          updated_by?: string | null
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          items?: Json
          menu_id?: string
          status?: Database["public"]["Enums"]["publish_status"]
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "menu_version_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "menu"
            referencedColumns: ["id"]
          },
        ]
      }
      page: {
        Row: {
          id: string
          is_system: boolean | null
          site_id: string
          slug: string
          system_key: string | null
        }
        Insert: {
          id?: string
          is_system?: boolean | null
          site_id: string
          slug: string
          system_key?: string | null
        }
        Update: {
          id?: string
          is_system?: boolean | null
          site_id?: string
          slug?: string
          system_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "site"
            referencedColumns: ["id"]
          },
        ]
      }
      page_publish: {
        Row: {
          page_id: string
          published_at: string
          published_by: string
          version: number
        }
        Insert: {
          page_id: string
          published_at?: string
          published_by: string
          version: number
        }
        Update: {
          page_id?: string
          published_at?: string
          published_by?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "page_publish_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: true
            referencedRelation: "page"
            referencedColumns: ["id"]
          },
        ]
      }
      page_version: {
        Row: {
          created_at: string
          created_by: string
          id: string
          layout_variant: string | null
          nav_hints: Json
          page_id: string
          seo: Json
          slots: Json
          status: Database["public"]["Enums"]["publish_status"]
          title: Json
          updated_at: string | null
          updated_by: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by: string
          id?: string
          layout_variant?: string | null
          nav_hints?: Json
          page_id: string
          seo?: Json
          slots?: Json
          status?: Database["public"]["Enums"]["publish_status"]
          title: Json
          updated_at?: string | null
          updated_by?: string | null
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string
          id?: string
          layout_variant?: string | null
          nav_hints?: Json
          page_id?: string
          seo?: Json
          slots?: Json
          status?: Database["public"]["Enums"]["publish_status"]
          title?: Json
          updated_at?: string | null
          updated_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "page_version_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "page"
            referencedColumns: ["id"]
          },
        ]
      }
      site: {
        Row: {
          created_at: string
          created_by: string | null
          default_locale: string
          handle: string
          id: string
          label: string
          slug: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          default_locale?: string
          handle: string
          id?: string
          label: string
          slug?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          default_locale?: string
          handle?: string
          id?: string
          label?: string
          slug?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      user_permissions: {
        Row: {
          created_at: string
          id: string
          permissions: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          permissions?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          permissions?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_permission: {
        Args: { permission: string; user_id: string }
        Returns: boolean
      }
      upsert_lead: {
        Args: {
          p_business_name?: string
          p_contact_name?: string
          p_email: string
          p_lead_kind: Database["public"]["Enums"]["lead_type"]
          p_phone?: string
          p_social_links?: string[]
          p_source_path?: string
          p_website?: string
        }
        Returns: string
      }
    }
    Enums: {
      asset_kind: "image" | "video" | "file"
      lead_type: "subscriber" | "vendor" | "sponsor" | "volunteer"
      publish_status: "draft" | "published" | "archived"
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
  analytics: {
    Enums: {},
  },
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      asset_kind: ["image", "video", "file"],
      lead_type: ["subscriber", "vendor", "sponsor", "volunteer"],
      publish_status: ["draft", "published", "archived"],
    },
  },
} as const

