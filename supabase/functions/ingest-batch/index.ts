import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { supabase } from '../_lib/db.ts'
import { BatchReq, type BatchRes } from '../_lib/validation.ts'
import { UpsertUserReq, StartSessionReq, PageviewReq, EventReq } from '../_lib/validation.ts'

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const body = await req.json()
    const { user, session, pageviews, events } = BatchReq.parse(body)

    const response: BatchRes = {}

    // Process user upsert if provided
    if (user) {
      const { anonId, traits } = user
      const { data, error } = await supabase.rpc('upsert_user_by_anon_id', {
        p_anon_id: anonId
      })

      if (error) {
        console.error('Error upserting user in batch:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      response.userId = data

      // Update properties if provided
      if (traits && Object.keys(traits).length > 0) {
        await supabase
          .from('analytics.users')
          .update({ properties: traits })
          .eq('id', data)
      }
    }

    // Process session if provided
    if (session) {
      const { sessionId, anonId, landingPage, landingPath, referrer, utm, device } = session
      
      const { data, error } = await supabase
        .from('analytics.sessions')
        .insert({
          id: sessionId,
          user_id: anonId,
          landing_page: landingPage,
          landing_path: landingPath,
          referrer: referrer,
          utm_source: utm?.source,
          utm_medium: utm?.medium,
          utm_campaign: utm?.campaign,
          utm_term: utm?.term,
          utm_content: utm?.content,
          device_category: device?.category,
          browser_name: device?.browserName,
          browser_version: device?.browserVersion,
          os_name: device?.osName,
          os_version: device?.osVersion
        })
        .select('id')
        .single()

      if (error) {
        console.error('Error creating session in batch:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      response.sessionId = data.id
    }

    // Process pageviews if provided
    if (pageviews && pageviews.length > 0) {
      const { data, error } = await supabase
        .from('analytics.pageviews')
        .insert(pageviews.map(pv => ({
          session_id: pv.sessionId,
          user_id: pv.userId,
          url: pv.url,
          path: pv.path,
          title: pv.title,
          referrer: pv.referrer,
          properties: pv.properties || {},
          occurred_at: pv.occurredAt || new Date().toISOString()
        })))
        .select('id')

      if (error) {
        console.error('Error creating pageviews in batch:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      response.pageviewIds = data.map(d => d.id)
    }

    // Process events if provided
    if (events && events.length > 0) {
      const { data, error } = await supabase
        .from('analytics.events')
        .insert(events.map(ev => ({
          session_id: ev.sessionId,
          user_id: ev.userId,
          name: ev.name,
          label: ev.label,
          value_num: ev.valueNum,
          value_text: ev.valueText,
          properties: ev.properties || {},
          occurred_at: ev.occurredAt || new Date().toISOString()
        })))
        .select('id')

      if (error) {
        console.error('Error creating events in batch:', error)
        return new Response(JSON.stringify({ error: error.message }), {
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      response.eventIds = data.map(d => d.id)
    }

    return new Response(JSON.stringify(response), {
      headers: { 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error in batch:', error)
    
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
