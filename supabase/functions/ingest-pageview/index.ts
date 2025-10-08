import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { PageviewReq, type PageviewRes } from '../_lib/validation.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { sessionId, userId, url, path, title, referrer, properties, occurredAt } = PageviewReq.parse(body)

    // Insert pageview
    const { data, error } = await supabase
      .from('analytics.pageviews')
      .insert({
        session_id: sessionId,
        user_id: userId,
        url: url,
        path: path,
        title: title,
        referrer: referrer,
        properties: properties || {},
        occurred_at: occurredAt || new Date().toISOString()
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error creating pageview:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const response: PageviewRes = { id: data.id }
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in pageview:', error)
    
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
