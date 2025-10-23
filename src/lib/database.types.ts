export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
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
      analytics_events: {
        Row: {
          created_at: string
          event_category: string | null
          event_name: string
          event_value: number | null
          id: string
          properties: Json | null
          session_id: string
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_category?: string | null
          event_name: string
          event_value?: number | null
          id?: string
          properties?: Json | null
          session_id: string
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_category?: string | null
          event_name?: string
          event_value?: number | null
          id?: string
          properties?: Json | null
          session_id?: string
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_excluded_users: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          user_id?: string
        }
        Relationships: []
      }
      analytics_pageviews: {
        Row: {
          created_at: string
          duration_ms: number | null
          id: string
          page_path: string
          page_title: string | null
          properties: Json | null
          referrer: string | null
          session_id: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          page_path: string
          page_title?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          id?: string
          page_path?: string
          page_title?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_sessions: {
        Row: {
          browser_name: string | null
          browser_version: string | null
          created_at: string
          device_category: string | null
          duration_ms: number | null
          ended_at: string | null
          event_count: number | null
          geo_city: string | null
          geo_country: string | null
          geo_region: string | null
          id: string
          ip_address: unknown | null
          is_bot: boolean | null
          landing_page: string | null
          landing_path: string | null
          os_name: string | null
          os_version: string | null
          page_count: number | null
          properties: Json | null
          referrer: string | null
          session_id: string
          started_at: string
          updated_at: string
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
          created_at?: string
          device_category?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          event_count?: number | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          ip_address?: unknown | null
          is_bot?: boolean | null
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          os_version?: string | null
          page_count?: number | null
          properties?: Json | null
          referrer?: string | null
          session_id: string
          started_at?: string
          updated_at?: string
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
          created_at?: string
          device_category?: string | null
          duration_ms?: number | null
          ended_at?: string | null
          event_count?: number | null
          geo_city?: string | null
          geo_country?: string | null
          geo_region?: string | null
          id?: string
          ip_address?: unknown | null
          is_bot?: boolean | null
          landing_page?: string | null
          landing_path?: string | null
          os_name?: string | null
          os_version?: string | null
          page_count?: number | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string
          started_at?: string
          updated_at?: string
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
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_users: {
        Row: {
          created_at: string
          first_seen_at: string
          id: string
          last_seen_at: string
          properties: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          properties?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_seen_at?: string
          id?: string
          last_seen_at?: string
          properties?: Json | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cms_asset_publishes: {
        Row: {
          asset_id: string | null
          id: string
          published_at: string
          published_by: string | null
          version: number
        }
        Insert: {
          asset_id?: string | null
          id?: string
          published_at?: string
          published_by?: string | null
          version: number
        }
        Update: {
          asset_id?: string | null
          id?: string
          published_at?: string
          published_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_asset_publishes_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: true
            referencedRelation: "cms_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_asset_usage: {
        Row: {
          asset_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          role: string | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          role?: string | null
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_asset_usage_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "cms_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_asset_variants: {
        Row: {
          asset_id: string | null
          created_at: string
          file_size: number | null
          height: number | null
          id: string
          storage_key: string
          variant_name: string
          width: number | null
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          file_size?: number | null
          height?: number | null
          id?: string
          storage_key: string
          variant_name: string
          width?: number | null
        }
        Update: {
          asset_id?: string | null
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
            foreignKeyName: "cms_asset_variants_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "cms_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_asset_versions: {
        Row: {
          asset_id: string | null
          created_at: string
          created_by: string | null
          edit_operation: Json | null
          id: string
          meta: Json | null
          version: number
        }
        Insert: {
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          edit_operation?: Json | null
          id?: string
          meta?: Json | null
          version: number
        }
        Update: {
          asset_id?: string | null
          created_at?: string
          created_by?: string | null
          edit_operation?: Json | null
          id?: string
          meta?: Json | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_asset_versions_asset_id_fkey"
            columns: ["asset_id"]
            isOneToOne: false
            referencedRelation: "cms_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_assets: {
        Row: {
          created_at: string
          duration_ms: number | null
          height: number | null
          id: string
          kind: string
          site_id: string | null
          storage_key: string
          updated_at: string
          width: number | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind: string
          site_id?: string | null
          storage_key: string
          updated_at?: string
          width?: number | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          height?: number | null
          id?: string
          kind?: string
          site_id?: string | null
          storage_key?: string
          updated_at?: string
          width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "cms_assets_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "system_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_block_publishes: {
        Row: {
          block_id: string | null
          id: string
          published_at: string
          published_by: string | null
          version: number
        }
        Insert: {
          block_id?: string | null
          id?: string
          published_at?: string
          published_by?: string | null
          version: number
        }
        Update: {
          block_id?: string | null
          id?: string
          published_at?: string
          published_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_block_publishes_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: true
            referencedRelation: "cms_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_block_versions: {
        Row: {
          assets: Json | null
          block_id: string | null
          content: Json | null
          created_at: string
          created_by: string | null
          id: string
          layout_variant: string | null
          version: number
        }
        Insert: {
          assets?: Json | null
          block_id?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          layout_variant?: string | null
          version: number
        }
        Update: {
          assets?: Json | null
          block_id?: string | null
          content?: Json | null
          created_at?: string
          created_by?: string | null
          id?: string
          layout_variant?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_block_versions_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "cms_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_blocks: {
        Row: {
          created_at: string
          id: string
          is_system: boolean | null
          site_id: string | null
          system_key: string | null
          tag: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          site_id?: string | null
          system_key?: string | null
          tag?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          site_id?: string | null
          system_key?: string | null
          tag?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_blocks_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "system_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_menu_publishes: {
        Row: {
          id: string
          menu_id: string | null
          published_at: string
          published_by: string | null
          version: number
        }
        Insert: {
          id?: string
          menu_id?: string | null
          published_at?: string
          published_by?: string | null
          version: number
        }
        Update: {
          id?: string
          menu_id?: string | null
          published_at?: string
          published_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_menu_publishes_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: true
            referencedRelation: "cms_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_menu_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          items: Json | null
          menu_id: string | null
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json | null
          menu_id?: string | null
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          items?: Json | null
          menu_id?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_menu_versions_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "cms_menus"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_menus: {
        Row: {
          created_at: string
          handle: string
          id: string
          is_system: boolean | null
          label: string
          site_id: string | null
          system_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          handle: string
          id?: string
          is_system?: boolean | null
          label: string
          site_id?: string | null
          system_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          handle?: string
          id?: string
          is_system?: boolean | null
          label?: string
          site_id?: string | null
          system_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_menus_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "system_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_page_publishes: {
        Row: {
          id: string
          page_id: string | null
          published_at: string
          published_by: string | null
          version: number
        }
        Insert: {
          id?: string
          page_id?: string | null
          published_at?: string
          published_by?: string | null
          version: number
        }
        Update: {
          id?: string
          page_id?: string | null
          published_at?: string
          published_by?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_page_publishes_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: true
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_page_versions: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          layout_variant: string | null
          nav_hints: Json | null
          page_id: string | null
          seo: Json | null
          slots: Json | null
          title: Json
          version: number
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          layout_variant?: string | null
          nav_hints?: Json | null
          page_id?: string | null
          seo?: Json | null
          slots?: Json | null
          title?: Json
          version: number
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          layout_variant?: string | null
          nav_hints?: Json | null
          page_id?: string | null
          seo?: Json | null
          slots?: Json | null
          title?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "cms_page_versions_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "cms_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      cms_pages: {
        Row: {
          created_at: string
          id: string
          is_system: boolean | null
          site_id: string | null
          slug: string
          system_key: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          site_id?: string | null
          slug: string
          system_key?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_system?: boolean | null
          site_id?: string | null
          slug?: string
          system_key?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cms_pages_site_id_fkey"
            columns: ["site_id"]
            isOneToOne: false
            referencedRelation: "system_sites"
            referencedColumns: ["id"]
          },
        ]
      }
      leads_submissions: {
        Row: {
          business_name: string | null
          contact_name: string | null
          created_at: string
          email: string
          id: string
          lead_kind: string
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
          lead_kind: string
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
          lead_kind?: string
          phone?: string | null
          social_links?: string[] | null
          source_path?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      site_staging: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          name: string
          site_id: string
          staged_at: string
          staged_by: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          name: string
          site_id: string
          staged_at?: string
          staged_by: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          site_id?: string
          staged_at?: string
          staged_by?: string
        }
        Relationships: []
      }
      staging_dependency: {
        Row: {
          created_at: string
          dependency_entity_id: string | null
          dependency_entity_type: string | null
          dependency_type: string
          dependency_version: number | null
          entity_id: string
          entity_type: string
          id: string
          staging_id: string
          version: number
        }
        Insert: {
          created_at?: string
          dependency_entity_id?: string | null
          dependency_entity_type?: string | null
          dependency_type: string
          dependency_version?: number | null
          entity_id: string
          entity_type: string
          id?: string
          staging_id: string
          version: number
        }
        Update: {
          created_at?: string
          dependency_entity_id?: string | null
          dependency_entity_type?: string | null
          dependency_type?: string
          dependency_version?: number | null
          entity_id?: string
          entity_type?: string
          id?: string
          staging_id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "staging_dependency_staging_id_fkey"
            columns: ["staging_id"]
            isOneToOne: false
            referencedRelation: "site_staging"
            referencedColumns: ["id"]
          },
        ]
      }
      system_audit_log: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      system_sites: {
        Row: {
          created_at: string
          default_locale: string
          domain: string
          id: string
          name: string
          settings: Json | null
          slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          default_locale?: string
          domain: string
          id?: string
          name: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          default_locale?: string
          domain?: string
          id?: string
          name?: string
          settings?: Json | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      system_user_permissions: {
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
      v_analytics_events: {
        Row: {
          event_category: string | null
          event_name: string | null
          event_value: number | null
          id: string | null
          properties: Json | null
          session_id: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          event_category?: string | null
          event_name?: string | null
          event_value?: number | null
          id?: string | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          event_category?: string | null
          event_name?: string | null
          event_value?: number | null
          id?: string | null
          properties?: Json | null
          session_id?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_events_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_analytics_pageviews: {
        Row: {
          duration_ms: number | null
          id: string | null
          page_path: string | null
          page_title: string | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
          viewport_height: number | null
          viewport_width: number | null
        }
        Insert: {
          duration_ms?: number | null
          id?: string | null
          page_path?: string | null
          page_title?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Update: {
          duration_ms?: number | null
          id?: string | null
          page_path?: string | null
          page_title?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
          viewport_height?: number | null
          viewport_width?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_pageviews_user_id_fkey"
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
          duration_ms: number | null
          ended_at: string | null
          event_count: number | null
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
          page_count: number | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
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
          duration_ms?: number | null
          ended_at?: string | null
          event_count?: number | null
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
          page_count?: number | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
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
          duration_ms?: number | null
          ended_at?: string | null
          event_count?: number | null
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
          page_count?: number | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
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
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_analytics_users: {
        Row: {
          first_seen_at: string | null
          id: string | null
          last_seen_at: string | null
          properties: Json | null
          user_id: string | null
        }
        Insert: {
          first_seen_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          properties?: Json | null
          user_id?: string | null
        }
        Update: {
          first_seen_at?: string | null
          id?: string | null
          last_seen_at?: string | null
          properties?: Json | null
          user_id?: string | null
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
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_analytics_users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "v_users_analytics"
            referencedColumns: ["id"]
          },
        ]
      }
      v_users_analytics: {
        Row: {
          anon_id: string | null
          avg_duration: number | null
          browser_name: string | null
          device_category: string | null
          first_seen_at: string | null
          geo_city: string | null
          geo_country: string | null
          has_lead: boolean | null
          id: string | null
          last_seen_at: string | null
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
      get_staging_dependencies: {
        Args: { staging_id_param: string }
        Returns: {
          dependency_entity_id: string
          dependency_entity_type: string
          dependency_type: string
          dependency_version: number
          entity_id: string
          entity_type: string
          version: number
        }[]
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
      publish_staged_content: {
        Args: { staging_id_param: string }
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
      rollback_staging: {
        Args: { staging_id_param: string }
        Returns: boolean
      }
      stage_entity: {
        Args: {
          entity_id: string
          entity_type: string
          staging_id: string
          version_number: number
        }
        Returns: boolean
      }
      stage_site: {
        Args: {
          site_id_param: string
          staging_description?: string
          staging_name: string
        }
        Returns: string
      }
      track_event: {
        Args: {
          p_name: string
          p_properties?: Json
          p_session_id: string
          p_user_id: string
        }
        Returns: string
      }
      track_page_view: {
        Args: {
          p_path: string
          p_referrer?: string
          p_session_id: string
          p_title?: string
          p_url: string
          p_user_id: string
        }
        Returns: string
      }
      upsert_lead: {
        Args: {
          p_business_name?: string
          p_contact_name?: string
          p_email: string
          p_lead_kind: string
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
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

