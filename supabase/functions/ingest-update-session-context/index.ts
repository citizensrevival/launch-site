import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { UpdateSessionContextReq, type UpdateSessionContextRes } from '../_lib/validation.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { sessionId, geo, device, utm, properties } = UpdateSessionContextReq.parse(body)

    // Build update object
    const updateData: any = {}
    
    if (geo) {
      updateData.geo_country = geo.country
      updateData.geo_region = geo.region
      updateData.geo_city = geo.city
    }
    
    if (device) {
      updateData.device_category = device.category
      updateData.browser_name = device.browserName
      updateData.browser_version = device.browserVersion
      updateData.os_name = device.osName
      updateData.os_version = device.osVersion
    }
    
    if (utm) {
      updateData.utm_source = utm.source
      updateData.utm_medium = utm.medium
      updateData.utm_campaign = utm.campaign
      updateData.utm_term = utm.term
      updateData.utm_content = utm.content
    }
    
    if (properties) {
      updateData.properties = properties
    }

    // Update session
    const { error } = await supabase
      .from('analytics.sessions')
      .update(updateData)
      .eq('id', sessionId)

    if (error) {
      console.error('Error updating session context:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const response: UpdateSessionContextRes = { ok: true }
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in update-session-context:', error)
    
    if (error.name === 'ZodError') {
      return new Response(JSON.stringify({ error: 'Invalid request data', details: error.issues }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    })
  }
})
