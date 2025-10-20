import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { Image } from 'https://deno.land/x/imagescript@1.2.15/mod.ts'

// Variant configurations
const VARIANTS = {
  thumbnail: { width: 150, height: 150 },
  small: { width: 400, height: 400 },
  medium: { width: 800, height: 800 },
  large: { width: 1600, height: 1600 }
}

/**
 * Resizes an image maintaining aspect ratio to fit within max dimensions
 */
function calculateDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  const aspectRatio = originalWidth / originalHeight
  
  let width = maxWidth
  let height = Math.round(width / aspectRatio)
  
  if (height > maxHeight) {
    height = maxHeight
    width = Math.round(height * aspectRatio)
  }
  
  return { width, height }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', { 
      status: 405,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
      }
    })
  }

  try {
    const { assetId } = await req.json()

    if (!assetId) {
      return new Response(JSON.stringify({ error: 'assetId is required' }), {
        status: 400,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log(`Processing variants for asset: ${assetId}`)

    // Fetch asset metadata from database
    const { data: asset, error: assetError } = await supabase
      .from('asset')
      .select('*')
      .eq('id', assetId)
      .single()

    if (assetError || !asset) {
      console.error('Error fetching asset:', assetError)
      return new Response(JSON.stringify({ error: 'Asset not found' }), {
        status: 404,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Only process images
    if (asset.kind !== 'image') {
      console.log(`Asset ${assetId} is not an image, skipping variant generation`)
      return new Response(JSON.stringify({ 
        message: 'Asset is not an image, no variants generated' 
      }), {
        status: 200,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Determine bucket name
    const bucketName = `site-${asset.site_id.replace(/-/g, '')}`
    console.log(`Using bucket: ${bucketName}`)

    // Download original image from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from(bucketName)
      .download(asset.storage_key)

    if (downloadError || !fileData) {
      console.error('Error downloading file:', downloadError)
      return new Response(JSON.stringify({ error: 'Failed to download original image' }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    // Read file as ArrayBuffer
    const arrayBuffer = await fileData.arrayBuffer()
    const uint8Array = new Uint8Array(arrayBuffer)

    console.log(`Downloaded image, size: ${uint8Array.length} bytes`)

    // Decode image
    let image: Image
    try {
      image = await Image.decode(uint8Array)
    } catch (decodeError) {
      console.error('Error decoding image:', decodeError)
      return new Response(JSON.stringify({ 
        error: 'Failed to decode image',
        details: decodeError.message 
      }), {
        status: 500,
        headers: { 
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      })
    }

    console.log(`Decoded image: ${image.width}x${image.height}`)

    const variants = []

    // Generate each variant
    for (const [variantName, dimensions] of Object.entries(VARIANTS)) {
      try {
        console.log(`Generating ${variantName} variant...`)

        // Calculate target dimensions maintaining aspect ratio
        const { width, height } = calculateDimensions(
          image.width,
          image.height,
          dimensions.width,
          dimensions.height
        )

        // Skip if variant would be same size or larger (no upscaling)
        if (width >= image.width && height >= image.height) {
          console.log(`Original image (${image.width}x${image.height}) is smaller than ${variantName} target (${dimensions.width}x${dimensions.height}), skipping`)
          continue
        }

        // Resize image
        const resized = image.resize(width, height)

        // Generate both JPEG and WebP versions
        const encodedJPEG = await resized.encodeJPEG(85) // 85% quality
        const encodedWebP = await resized.encodeWebP(85) // 85% quality

        // Generate storage paths for variants
        const fileExt = asset.storage_key.split('.').pop()
        const basePath = asset.storage_key.replace(`.${fileExt}`, '')
        
        // Upload JPEG variant
        const variantPathJPEG = `${basePath}-${variantName}.jpg`
        console.log(`Uploading ${variantName} JPEG to: ${variantPathJPEG}`)
        
        const { error: uploadErrorJPEG } = await supabase.storage
          .from(bucketName)
          .upload(variantPathJPEG, encodedJPEG, {
            contentType: 'image/jpeg',
            upsert: true
          })

        if (uploadErrorJPEG) {
          console.error(`Error uploading ${variantName} JPEG:`, uploadErrorJPEG)
          continue
        }
        
        // Upload WebP variant
        const variantPathWebP = `${basePath}-${variantName}.webp`
        console.log(`Uploading ${variantName} WebP to: ${variantPathWebP}`)
        
        const { error: uploadErrorWebP } = await supabase.storage
          .from(bucketName)
          .upload(variantPathWebP, encodedWebP, {
            contentType: 'image/webp',
            upsert: true
          })

        if (uploadErrorWebP) {
          console.error(`Error uploading ${variantName} WebP:`, uploadErrorWebP)
          // Don't fail if WebP upload fails, we have JPEG
        }

        // Create/update JPEG variant record
        const { data: existingJPEG } = await supabase
          .from('asset_variant')
          .select('id')
          .eq('asset_id', assetId)
          .eq('variant_name', variantName)
          .single()

        if (existingJPEG) {
          await supabase
            .from('asset_variant')
            .update({
              storage_key: variantPathJPEG,
              width,
              height,
              file_size: encodedJPEG.length
            })
            .eq('id', existingJPEG.id)
        } else {
          await supabase
            .from('asset_variant')
            .insert({
              asset_id: assetId,
              variant_name: variantName,
              storage_key: variantPathJPEG,
              width,
              height,
              file_size: encodedJPEG.length
            })
        }
        
        // Create/update WebP variant record
        const { data: existingWebP } = await supabase
          .from('asset_variant')
          .select('id')
          .eq('asset_id', assetId)
          .eq('variant_name', `${variantName}-webp`)
          .single()

        if (existingWebP) {
          await supabase
            .from('asset_variant')
            .update({
              storage_key: variantPathWebP,
              width,
              height,
              file_size: encodedWebP.length
            })
            .eq('id', existingWebP.id)
        } else {
          await supabase
            .from('asset_variant')
            .insert({
              asset_id: assetId,
              variant_name: `${variantName}-webp`,
              storage_key: variantPathWebP,
              width,
              height,
              file_size: encodedWebP.length
            })
        }

        console.log(`Created ${variantName} variants (JPEG: ${encodedJPEG.length} bytes, WebP: ${encodedWebP.length} bytes)`)

        variants.push({
          name: variantName,
          width,
          height,
          size: encodedJPEG.length,
          path: variantPathJPEG
        }, {
          name: `${variantName}-webp`,
          width,
          height,
          size: encodedWebP.length,
          path: variantPathWebP
        })

      } catch (variantError) {
        console.error(`Error processing ${variantName} variant:`, variantError)
        // Continue with other variants
      }
    }

    console.log(`Successfully generated ${variants.length} variants`)

    return new Response(JSON.stringify({ 
      success: true,
      assetId,
      variants
    }), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error processing asset variants:', error)
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      details: error.message 
    }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})

