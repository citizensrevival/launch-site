import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { EndSessionReq, type EndSessionRes } from '../_lib/validation.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { sessionId } = EndSessionReq.parse(body)

    // Update session with end time
    const { error } = await supabase
      .from('analytics.sessions')
      .update({ ended_at: new Date().toISOString() })
      .eq('id', sessionId)

    if (error) {
      console.error('Error ending session:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    const response: EndSessionRes = { ok: true }
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in end-session:', error)
    
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
