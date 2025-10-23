// Resolve Menu Edge Function
// This function resolves a published menu with its item tree

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResolvedMenu {
  id: string;
  handle: string;
  label: string;
  items: Array<ResolvedMenuItem>;
  published_at: string;
  published_by: string;
}

interface ResolvedMenuItem {
  id: string;
  type: 'page' | 'external' | 'anchor' | 'separator' | 'group';
  label: Record<string, string>;
  target?: string;
  rel?: string;
  children?: Array<ResolvedMenuItem>;
  visibility?: {
    device?: Array<'mobile' | 'desktop'>;
    audience?: Array<'anon' | 'user' | 'admin'>;
    featureFlags?: string[];
    schedule?: { start?: string; end?: string };
  };
  badge?: {
    text: Record<string, string>;
    color: string;
  };
  style_hints?: Record<string, any>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body
    const { menu_id, site_id, locale = 'en-US' } = await req.json()

    if (!menu_id) {
      return new Response(
        JSON.stringify({ error: 'menu_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get published menu
    const { data: menuData, error: menuError } = await supabase
      .from('menu')
      .select(`
        id,
        handle,
        label,
        site_id
      `)
      .eq('id', menu_id)
      .single()

    if (menuError || !menuData) {
      return new Response(
        JSON.stringify({ error: 'Menu not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get published menu version
    const { data: menuVersion, error: versionError } = await supabase
      .from('menu_version')
      .select(`
        version,
        items,
        created_at,
        created_by
      `)
      .eq('menu_id', menu_id)
      .in('version', 
        supabase
          .from('menu_publish')
          .select('version')
          .eq('menu_id', menu_id)
      )
      .single()

    if (versionError || !menuVersion) {
      return new Response(
        JSON.stringify({ error: 'Published menu version not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get publish info
    const { data: publishInfo, error: publishError } = await supabase
      .from('menu_publish')
      .select('published_at, published_by')
      .eq('menu_id', menu_id)
      .single()

    if (publishError || !publishInfo) {
      return new Response(
        JSON.stringify({ error: 'Menu publish info not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Resolve menu items recursively
    const resolveMenuItems = async (items: any[]): Promise<ResolvedMenuItem[]> => {
      return Promise.all(
        items.map(async (item: any) => {
          const resolvedItem: ResolvedMenuItem = {
            id: item.id,
            type: item.type,
            label: item.label,
            target: item.target,
            rel: item.rel,
            visibility: item.visibility,
            badge: item.badge,
            style_hints: item.style_hints
          }

          // If this is a page item, resolve the page slug
          if (item.type === 'page' && item.page_id) {
            const { data: pageData, error: pageError } = await supabase
              .from('page')
              .select('slug')
              .eq('id', item.page_id)
              .single()

            if (!pageError && pageData) {
              resolvedItem.target = `/${pageData.slug}`
            }
          }

          // Resolve children recursively
          if (item.children && item.children.length > 0) {
            resolvedItem.children = await resolveMenuItems(item.children)
          }

          return resolvedItem
        })
      )
    }

    // Resolve all menu items
    const resolvedItems = await resolveMenuItems(menuVersion.items)

    // Build resolved menu
    const resolvedMenu: ResolvedMenu = {
      id: menuData.id,
      handle: menuData.handle,
      label: menuData.label,
      items: resolvedItems,
      published_at: publishInfo.published_at,
      published_by: publishInfo.published_by
    }

    return new Response(
      JSON.stringify(resolvedMenu),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error resolving menu:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
