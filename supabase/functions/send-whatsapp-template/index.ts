
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

  try {
    const { organizationId, phoneNumber, templateId, variables, phoneNumberId, accessToken } = await req.json()

    if (!organizationId || !phoneNumber || !templateId || !phoneNumberId || !accessToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Prepare template parameters
    const templateParameters = Object.values(variables || {}).map(value => ({
      type: 'text',
      text: value
    }))

    // Send template message via WhatsApp Cloud API
    const whatsappResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: phoneNumber,
        type: 'template',
        template: {
          name: templateId,
          language: {
            code: 'ar'
          },
          components: templateParameters.length > 0 ? [
            {
              type: 'body',
              parameters: templateParameters
            }
          ] : []
        }
      })
    })

    const result = await whatsappResponse.json()

    if (!whatsappResponse.ok) {
      console.error('WhatsApp API error:', result)
      return new Response(
        JSON.stringify({ error: 'Failed to send template message', details: result }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store the message in the database
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    await supabase
      .from('whatsapp_outgoing_messages')
      .insert({
        recipient: phoneNumber,
        content: `Template: ${templateId}`,
        message_type: 'template',
        template_id: templateId,
        template_variables: variables,
        message_id: result.messages?.[0]?.id,
        status: 'sent',
        timestamp: new Date().toISOString(),
        api_response: result
      })

    return new Response(
      JSON.stringify({ success: true, ...result }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in send-whatsapp-template:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
