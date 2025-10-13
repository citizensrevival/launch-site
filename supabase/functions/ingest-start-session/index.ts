import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { StartSessionReq, type StartSessionRes } from '../_lib/validation.ts'
import { getClientIP, parseUserAgent, anonymizeIP } from '../_lib/identity.ts'

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, apikey, x-client-info, x-client-version, x-client-name',
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
    const body = await req.json()
    const { anonId, sessionId, landingPage, landingPath, referrer, utm, device } = StartSessionReq.parse(body)

    // Get client IP and parse user agent
    const clientIP = getClientIP(req)
    const userAgent = req.headers.get('User-Agent') || ''
    const parsedUA = parseUserAgent(userAgent)
    
    // Anonymize IP if needed (optional)
    const anonymizedIP = clientIP ? anonymizeIP(clientIP) : null

    // Insert session
    const { data, error } = await supabase
      .from('sessions')
      .insert({
        id: sessionId,
        user_id: anonId, // This should be the user_id from upsert-user
        landing_page: landingPage,
        landing_path: landingPath,
        referrer: referrer,
        utm_source: utm?.source,
        utm_medium: utm?.medium,
        utm_campaign: utm?.campaign,
        utm_term: utm?.term,
        utm_content: utm?.content,
        user_agent: userAgent,
        device_category: device?.category || parsedUA.category,
        browser_name: device?.browserName || parsedUA.browserName,
        browser_version: device?.browserVersion || parsedUA.browserVersion,
        os_name: device?.osName || parsedUA.osName,
        os_version: device?.osVersion || parsedUA.osVersion,
        is_bot: parsedUA.isBot,
        ip_address: anonymizedIP
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating session:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
    }

    const response: StartSessionRes = { 
      sessionId: data.id, 
      userId: anonId 
    }
    return new Response(JSON.stringify(response), {
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })

  } catch (error) {
    console.error('Error in start-session:', error)
    
    if (error.name === 'ZodError') {
        return new Response(JSON.stringify({ error: 'Invalid request data', details: error.issues }), {
          status: 400,
          headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          }
        })
    }

    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { 
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    })
  }
})