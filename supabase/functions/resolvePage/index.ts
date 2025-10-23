// Resolve Page Edge Function
// This function resolves a published page with all its referenced blocks and assets

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ResolvedPage {
  id: string;
  slug: string;
  title: Record<string, string>;
  layout_variant?: string;
  seo: Record<string, any>;
  nav_hints: Record<string, any>;
  slots: Array<{
    slot: string;
    order: number;
    block: ResolvedBlock;
  }>;
  published_at: string;
  published_by: string;
}

interface ResolvedBlock {
  id: string;
  type: string;
  tag?: string;
  layout_variant: string;
  content: Record<string, any>;
  assets: Array<{
    role: string;
    asset: ResolvedAsset;
  }>;
  published_at: string;
  published_by: string;
}

interface ResolvedAsset {
  id: string;
  kind: string;
  storage_key: string;
  width?: number;
  height?: number;
  duration_ms?: number;
  variants: Array<{
    variant_name: string;
    storage_key: string;
    width?: number;
    height?: number;
    file_size?: number;
  }>;
  published_at: string;
  published_by: string;
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
    const { page_id, site_id, locale = 'en-US' } = await req.json()

    if (!page_id) {
      return new Response(
        JSON.stringify({ error: 'page_id is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get published page
    const { data: pageData, error: pageError } = await supabase
      .from('page')
      .select(`
        id,
        slug,
        site_id
      `)
      .eq('id', page_id)
      .single()

    if (pageError || !pageData) {
      return new Response(
        JSON.stringify({ error: 'Page not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get published page version
    const { data: pageVersion, error: versionError } = await supabase
      .from('page_version')
      .select(`
        version,
        title,
        layout_variant,
        seo,
        nav_hints,
        slots,
        created_at,
        created_by
      `)
      .eq('page_id', page_id)
      .in('version', 
        supabase
          .from('page_publish')
          .select('version')
          .eq('page_id', page_id)
      )
      .single()

    if (versionError || !pageVersion) {
      return new Response(
        JSON.stringify({ error: 'Published page version not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get publish info
    const { data: publishInfo, error: publishError } = await supabase
      .from('page_publish')
      .select('published_at, published_by')
      .eq('page_id', page_id)
      .single()

    if (publishError || !publishInfo) {
      return new Response(
        JSON.stringify({ error: 'Page publish info not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Resolve blocks for each slot
    const resolvedSlots = await Promise.all(
      pageVersion.slots.map(async (slot: any) => {
        // Get published block version
        const { data: blockVersion, error: blockVersionError } = await supabase
          .from('block_version')
          .select(`
            version,
            layout_variant,
            content,
            assets,
            created_at,
            created_by
          `)
          .eq('block_id', slot.block_id)
          .in('version',
            supabase
              .from('block_publish')
              .select('version')
              .eq('block_id', slot.block_id)
          )
          .single()

        if (blockVersionError || !blockVersion) {
          console.warn(`Block ${slot.block_id} not found or not published`)
          return null
        }

        // Get block info
        const { data: blockInfo, error: blockInfoError } = await supabase
          .from('block')
          .select('type, tag')
          .eq('id', slot.block_id)
          .single()

        if (blockInfoError || !blockInfo) {
          console.warn(`Block info for ${slot.block_id} not found`)
          return null
        }

        // Get block publish info
        const { data: blockPublishInfo, error: blockPublishError } = await supabase
          .from('block_publish')
          .select('published_at, published_by')
          .eq('block_id', slot.block_id)
          .single()

        if (blockPublishError || !blockPublishInfo) {
          console.warn(`Block publish info for ${slot.block_id} not found`)
          return null
        }

        // Resolve assets for this block
        const resolvedAssets = await Promise.all(
          blockVersion.assets.map(async (assetRef: any) => {
            // Get published asset version
            const { data: assetVersion, error: assetVersionError } = await supabase
              .from('asset_version')
              .select(`
                version,
                meta,
                created_at,
                created_by
              `)
              .eq('asset_id', assetRef.asset_id)
              .in('version',
                supabase
                  .from('asset_publish')
                  .select('version')
                  .eq('asset_id', assetRef.asset_id)
              )
              .single()

            if (assetVersionError || !assetVersion) {
              console.warn(`Asset ${assetRef.asset_id} not found or not published`)
              return null
            }

            // Get asset info
            const { data: assetInfo, error: assetInfoError } = await supabase
              .from('asset')
              .select('kind, storage_key, width, height, duration_ms')
              .eq('id', assetRef.asset_id)
              .single()

            if (assetInfoError || !assetInfo) {
              console.warn(`Asset info for ${assetRef.asset_id} not found`)
              return null
            }

            // Get asset publish info
            const { data: assetPublishInfo, error: assetPublishError } = await supabase
              .from('asset_publish')
              .select('published_at, published_by')
              .eq('asset_id', assetRef.asset_id)
              .single()

            if (assetPublishError || !assetPublishInfo) {
              console.warn(`Asset publish info for ${assetRef.asset_id} not found`)
              return null
            }

            // Get asset variants
            const { data: assetVariants, error: variantsError } = await supabase
              .from('asset_variant')
              .select('variant_name, storage_key, width, height, file_size')
              .eq('asset_id', assetRef.asset_id)

            if (variantsError) {
              console.warn(`Asset variants for ${assetRef.asset_id} not found`)
            }

            return {
              role: assetRef.role,
              asset: {
                id: assetRef.asset_id,
                kind: assetInfo.kind,
                storage_key: assetInfo.storage_key,
                width: assetInfo.width,
                height: assetInfo.height,
                duration_ms: assetInfo.duration_ms,
                variants: assetVariants || [],
                published_at: assetPublishInfo.published_at,
                published_by: assetPublishInfo.published_by
              }
            }
          })
        )

        return {
          slot: slot.slot,
          order: slot.order,
          block: {
            id: slot.block_id,
            type: blockInfo.type,
            tag: blockInfo.tag,
            layout_variant: blockVersion.layout_variant,
            content: blockVersion.content,
            assets: resolvedAssets.filter(asset => asset !== null),
            published_at: blockPublishInfo.published_at,
            published_by: blockPublishInfo.published_by
          }
        }
      })
    )

    // Filter out null slots (blocks that couldn't be resolved)
    const validSlots = resolvedSlots.filter(slot => slot !== null)

    // Build resolved page
    const resolvedPage: ResolvedPage = {
      id: pageData.id,
      slug: pageData.slug,
      title: pageVersion.title,
      layout_variant: pageVersion.layout_variant,
      seo: pageVersion.seo,
      nav_hints: pageVersion.nav_hints,
      slots: validSlots,
      published_at: publishInfo.published_at,
      published_by: publishInfo.published_by
    }

    return new Response(
      JSON.stringify(resolvedPage),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Error resolving page:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
