import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { UpsertUserReq, type UpsertUserRes } from '../_lib/validation.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { anonId, traits } = UpsertUserReq.parse(body)

    // Use the database function to upsert user
    const { data, error } = await supabase.rpc('upsert_user_by_anon_id', {
      p_anon_id: anonId
    })

    if (error) {
      console.error('Error upserting user:', error)
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }

    // Update properties if provided
    if (traits && Object.keys(traits).length > 0) {
      const { error: updateError } = await supabase
        .from('analytics.users')
        .update({ properties: traits })
        .eq('id', data)

      if (updateError) {
        console.error('Error updating user properties:', updateError)
        // Don't fail the request, just log the error
      }
    }

    const response: UpsertUserRes = { userId: data }
    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in upsert-user:', error)
    
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
