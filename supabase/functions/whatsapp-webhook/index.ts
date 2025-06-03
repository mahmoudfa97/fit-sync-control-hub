
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  // Handle webhook verification
  if (req.method === 'GET') {
    const url = new URL(req.url)
    const mode = url.searchParams.get('hub.mode')
    const token = url.searchParams.get('hub.verify_token')
    const challenge = url.searchParams.get('hub.challenge')

    const verifyToken = Deno.env.get('WHATSAPP_WEBHOOK_VERIFY_TOKEN') || 'default_verify_token'

    if (mode === 'subscribe' && token === verifyToken) {
      console.log('Webhook verified successfully')
      return new Response(challenge, { 
        status: 200,
        headers: { 'Content-Type': 'text/plain' }
      })
    } else {
      console.error('Webhook verification failed')
      return new Response('Verification failed', { status: 403 })
    }
  }

  // Handle incoming messages
  if (req.method === 'POST') {
    try {
      const body = await req.json()
      console.log('Received webhook:', JSON.stringify(body, null, 2))

      const supabaseUrl = Deno.env.get('SUPABASE_URL')!
      const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
      const supabase = createClient(supabaseUrl, supabaseServiceKey)

      // Process webhook data
      if (body.entry && body.entry.length > 0) {
        for (const entry of body.entry) {
          if (entry.changes && entry.changes.length > 0) {
            for (const change of entry.changes) {
              // Handle incoming messages
              if (change.value.messages && change.value.messages.length > 0) {
                for (const message of change.value.messages) {
                  await supabase
                    .from('whatsapp_incoming_messages')
                    .insert({
                      message_id: message.id,
                      sender: message.from,
                      content: message.text?.body || message.type,
                      message_type: message.type,
                      timestamp: new Date(parseInt(message.timestamp) * 1000).toISOString()
                    })
                }
              }

              // Handle message status updates
              if (change.value.statuses && change.value.statuses.length > 0) {
                for (const status of change.value.statuses) {
                  await supabase
                    .from('whatsapp_message_statuses')
                    .insert({
                      message_id: status.id,
                      status: status.status,
                      recipient: status.recipient_id,
                      timestamp: new Date(parseInt(status.timestamp) * 1000).toISOString()
                    })
                }
              }
            }
          }
        }
      }

      return new Response('OK', { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })

    } catch (error) {
      console.error('Error processing webhook:', error)
      return new Response('Error', { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
      })
    }
  }

  return new Response('Method not allowed', { 
    status: 405,
    headers: { ...corsHeaders, 'Content-Type': 'text/plain' }
  })
})
