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
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exclude_user: {
        Args: {
          p_anon_id?: string
          p_excluded_by?: string
          p_ip_address?: unknown
          p_reason?: string
          p_session_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      is_user_excluded: {
        Args: {
          p_anon_id?: string
          p_ip_address?: unknown
          p_session_id?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      remove_exclusion: {
        Args: {
          p_anon_id?: string
          p_ip_address?: unknown
          p_session_id?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      upsert_user_by_anon_id: {
        Args: { p_anon_id: string }
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
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
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
      events: {
        Row: {
          id: number
          label: string | null
          name: string
          occurred_at: string
          properties: Json
          session_id: string
          user_id: string
          value_num: number | null
          value_text: string | null
        }
        Insert: {
          id?: number
          label?: string | null
          name: string
          occurred_at?: string
          properties?: Json
          session_id: string
          user_id: string
          value_num?: number | null
          value_text?: string | null
        }
        Update: {
          id?: number
          label?: string | null
          name?: string
          occurred_at?: string
          properties?: Json
          session_id?: string
          user_id?: string
          value_num?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_sessions_summary"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      excluded_users: {
        Row: {
          anon_id: string | null
          excluded_at: string
          excluded_by: string
          id: string
          ip_address: unknown | null
          reason: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          anon_id?: string | null
          excluded_at?: string
          excluded_by?: string
          id?: string
          ip_address?: unknown | null
          reason?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          anon_id?: string | null
          excluded_at?: string
          excluded_by?: string
          id?: string
          ip_address?: unknown | null
          reason?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "excluded_users_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excluded_users_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excluded_users_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_sessions_summary"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "excluded_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excluded_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "excluded_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          business_name: string | null
          contact_name: string | null
          created_at: string
          email: string
          id: string
          lead_kind: Database["public"]["Enums"]["lead_type"]
          meta: Json | null
          phone: string | null
          social_links: string[] | null
          source_path: string | null
          tags: string[] | null
          website: string | null
        }
        Insert: {
          business_name?: string | null
          contact_name?: string | null
          created_at?: string
          email: string
          id?: string
          lead_kind: Database["public"]["Enums"]["lead_type"]
          meta?: Json | null
          phone?: string | null
          social_links?: string[] | null
          source_path?: string | null
          tags?: string[] | null
          website?: string | null
        }
        Update: {
          business_name?: string | null
          contact_name?: string | null
          created_at?: string
          email?: string
          id?: string
          lead_kind?: Database["public"]["Enums"]["lead_type"]
          meta?: Json | null
          phone?: string | null
          social_links?: string[] | null
          source_path?: string | null
          tags?: string[] | null
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
      pageviews: {
        Row: {
          id: number
          occurred_at: string
          path: string
          properties: Json
          referrer: string | null
          session_id: string
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          id?: number
          occurred_at?: string
          path: string
          properties?: Json
          referrer?: string | null
          session_id: string
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          id?: number
          occurred_at?: string
          path?: string
          properties?: Json
          referrer?: string | null
          session_id?: string
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_sessions_summary"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          device_category: string | null
          ended_at: string | null
          geo_city: string | null
          geo_country: string | null
          geo_region: string | null
          id: string
          ip_address: unknown | null
          is_bot: boolean
          landing_page: string | null
          landing_path: string | null
          os_name: string | null
          os_version: string | null
          properties: Json
          referrer: string | null
          started_at: string
          user_agent: string | null
          user_id: string
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          device_category?: string | null
          ended_at?: string | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          ip_address?: unknown | null
          is_bot?: boolean
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          os_version?: string | null
          properties?: Json
          referrer?: string | null
          started_at?: string
          user_agent?: string | null
          user_id: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          device_category?: string | null
          ended_at?: string | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          ip_address?: unknown | null
          is_bot?: boolean
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          os_version?: string | null
          properties?: Json
          referrer?: string | null
          started_at?: string
          user_agent?: string | null
          user_id?: string
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
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
      unsubscribes: {
        Row: {
          created_at: string
          email: string
          id: string
          ip_address: unknown | null
          source_path: string | null
          unsubscribed_lead_types: Json
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          ip_address?: unknown | null
          source_path?: string | null
          unsubscribed_lead_types?: Json
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          ip_address?: unknown | null
          source_path?: string | null
          unsubscribed_lead_types?: Json
          user_agent?: string | null
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
      users: {
        Row: {
          anon_id: string
          first_referrer: string | null
          first_seen_at: string
          first_utm_campaign: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          id: string
          last_referrer: string | null
          last_seen_at: string
          last_utm_campaign: string | null
          last_utm_medium: string | null
          last_utm_source: string | null
          properties: Json
        }
        Insert: {
          anon_id: string
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          id?: string
          last_referrer?: string | null
          last_seen_at?: string
          last_utm_campaign?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          properties?: Json
        }
        Update: {
          anon_id?: string
          first_referrer?: string | null
          first_seen_at?: string
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          id?: string
          last_referrer?: string | null
          last_seen_at?: string
          last_utm_campaign?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          properties?: Json
        }
        Relationships: []
      }
    }
    Views: {
      v_analytics_events: {
        Row: {
          id: number | null
          label: string | null
          name: string | null
          occurred_at: string | null
          properties: Json | null
          session_id: string | null
          user_id: string | null
          value_num: number | null
          value_text: string | null
        }
        Insert: {
          id?: number | null
          label?: string | null
          name?: string | null
          occurred_at?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
          value_num?: number | null
          value_text?: string | null
        }
        Update: {
          id?: number | null
          label?: string | null
          name?: string | null
          occurred_at?: string | null
          properties?: Json | null
          session_id?: string | null
          user_id?: string | null
          value_num?: number | null
          value_text?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_sessions_summary"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_analytics_pageviews: {
        Row: {
          id: number | null
          occurred_at: string | null
          path: string | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
          title: string | null
          url: string | null
          user_id: string | null
        }
        Insert: {
          id?: number | null
          occurred_at?: string | null
          path?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          title?: string | null
          url?: string | null
          user_id?: string | null
        }
        Update: {
          id?: number | null
          occurred_at?: string | null
          path?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          title?: string | null
          url?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "v_sessions_summary"
            referencedColumns: ["session_id"]
          },
          {
            foreignKeyName: "pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_analytics_sessions: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          device_category: string | null
          ended_at: string | null
          geo_city: string | null
          geo_country: string | null
          geo_region: string | null
          id: string | null
          ip_address: unknown | null
          is_bot: boolean | null
          landing_page: string | null
          landing_path: string | null
          os_name: string | null
          os_version: string | null
          properties: Json | null
          referrer: string | null
          started_at: string | null
          user_agent: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser_name?: string | null
          browser_version?: string | null
          device_category?: string | null
          ended_at?: string | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string | null
          ip_address?: unknown | null
          is_bot?: boolean | null
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          os_version?: string | null
          properties?: Json | null
          referrer?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser_name?: string | null
          browser_version?: string | null
          device_category?: string | null
          ended_at?: string | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string | null
          ip_address?: unknown | null
          is_bot?: boolean | null
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          os_version?: string | null
          properties?: Json | null
          referrer?: string | null
          started_at?: string | null
          user_agent?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_analytics_users: {
        Row: {
          anon_id: string | null
          first_referrer: string | null
          first_seen_at: string | null
          first_utm_campaign: string | null
          first_utm_medium: string | null
          first_utm_source: string | null
          id: string | null
          last_referrer: string | null
          last_seen_at: string | null
          last_utm_campaign: string | null
          last_utm_medium: string | null
          last_utm_source: string | null
          properties: Json | null
        }
        Insert: {
          anon_id?: string | null
          first_referrer?: string | null
          first_seen_at?: string | null
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          id?: string | null
          last_referrer?: string | null
          last_seen_at?: string | null
          last_utm_campaign?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          properties?: Json | null
        }
        Update: {
          anon_id?: string | null
          first_referrer?: string | null
          first_seen_at?: string | null
          first_utm_campaign?: string | null
          first_utm_medium?: string | null
          first_utm_source?: string | null
          id?: string | null
          last_referrer?: string | null
          last_seen_at?: string | null
          last_utm_campaign?: string | null
          last_utm_medium?: string | null
          last_utm_source?: string | null
          properties?: Json | null
        }
        Relationships: []
      }
      v_browser_breakdown: {
        Row: {
          browser_name: string | null
          sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_city_breakdown: {
        Row: {
          city: string | null
          country: string | null
          sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_country_breakdown: {
        Row: {
          country: string | null
          sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_device_breakdown: {
        Row: {
          device_category: string | null
          sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_event_rollup_daily: {
        Row: {
          day: string | null
          event_count: number | null
          name: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_event_trends_daily: {
        Row: {
          count: number | null
          day: string | null
          name: string | null
        }
        Relationships: []
      }
      v_events_analytics: {
        Row: {
          count: number | null
          last_occurred: string | null
          name: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_events_daily: {
        Row: {
          day: string | null
          events: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_new_users_daily: {
        Row: {
          day: string | null
          new_users: number | null
        }
        Relationships: []
      }
      v_new_vs_returning_users: {
        Row: {
          count: number | null
          type: string | null
        }
        Relationships: []
      }
      v_os_breakdown: {
        Row: {
          os_name: string | null
          sessions: number | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_pageviews_daily: {
        Row: {
          day: string | null
          pageviews: number | null
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
      v_referrers_analytics: {
        Row: {
          avg_session_duration: number | null
          bounce_rate: number | null
          conversions: number | null
          domain: string | null
          last_seen: string | null
          pages_per_session: number | null
          total_sessions: number | null
          total_users: number | null
          traffic_share: number | null
        }
        Relationships: []
      }
      v_session_metrics: {
        Row: {
          avg_duration: number | null
          avg_pageviews: number | null
          total_sessions: number | null
        }
        Relationships: []
      }
      v_sessions_per_user_distribution: {
        Row: {
          sessions: number | null
          users: number | null
        }
        Relationships: []
      }
      v_sessions_summary: {
        Row: {
          browser_name: string | null
          device_category: string | null
          duration_seconds: number | null
          ended_at: string | null
          events_count: number | null
          geo_city: string | null
          geo_country: string | null
          geo_region: string | null
          ip_address: unknown | null
          is_bot: boolean | null
          landing_page: string | null
          landing_path: string | null
          os_name: string | null
          pageviews_count: number | null
          referrer: string | null
          session_id: string | null
          started_at: string | null
          user_id: string | null
          utm_campaign: string | null
          utm_content: string | null
          utm_medium: string | null
          utm_source: string | null
          utm_term: string | null
        }
        Insert: {
          browser_name?: string | null
          device_category?: string | null
          duration_seconds?: never
          ended_at?: string | null
          events_count?: never
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          ip_address?: unknown | null
          is_bot?: boolean | null
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          pageviews_count?: never
          referrer?: string | null
          session_id?: string | null
          started_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Update: {
          browser_name?: string | null
          device_category?: string | null
          duration_seconds?: never
          ended_at?: string | null
          events_count?: never
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          ip_address?: unknown | null
          is_bot?: boolean | null
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          pageviews_count?: never
          referrer?: string | null
          session_id?: string | null
          started_at?: string | null
          user_id?: string | null
          utm_campaign?: string | null
          utm_content?: string | null
          utm_medium?: string | null
          utm_source?: string | null
          utm_term?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_top_events: {
        Row: {
          count: number | null
          last_occurred: string | null
          name: string | null
          unique_users: number | null
        }
        Relationships: []
      }
      v_top_pages: {
        Row: {
          last_viewed: string | null
          path: string | null
          unique_users: number | null
          views: number | null
        }
        Relationships: []
      }
      v_top_referrers: {
        Row: {
          avg_duration_seconds: number | null
          last_seen: string | null
          referrer: string | null
          sessions: number | null
          unique_users: number | null
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
      v_users_analytics: {
        Row: {
          anon_id: string | null
          avg_duration: number | null
          browser_name: string | null
          device_category: string | null
          first_referrer: string | null
          first_seen_at: string | null
          first_utm_source: string | null
          geo_city: string | null
          geo_country: string | null
          has_lead: boolean | null
          id: string | null
          last_referrer: string | null
          last_seen_at: string | null
          last_utm_source: string | null
          os_name: string | null
          properties: Json | null
          sessions: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      exclude_user: {
        Args: {
          p_anon_id?: string
          p_excluded_by?: string
          p_ip_address?: unknown
          p_reason?: string
          p_session_id?: string
          p_user_id?: string
        }
        Returns: string
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      has_permission: {
        Args: { permission: string; user_id: string }
        Returns: boolean
      }
      is_user_excluded: {
        Args: {
          p_anon_id?: string
          p_ip_address?: unknown
          p_session_id?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      remove_exclusion: {
        Args: {
          p_anon_id?: string
          p_ip_address?: unknown
          p_session_id?: string
          p_user_id?: string
        }
        Returns: boolean
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
      upsert_lead: {
        Args: {
          p_business_name?: string
          p_contact_name?: string
          p_email: string
          p_lead_kind: Database["public"]["Enums"]["lead_type"]
          p_meta?: Json
          p_phone?: string
          p_social_links?: string[]
          p_source_path?: string
          p_tags?: string[]
          p_website?: string
        }
        Returns: string
      }
      upsert_user_by_anon_id: {
        Args: { p_anon_id: string }
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

