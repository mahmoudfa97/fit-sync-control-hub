
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { organizationId, phoneNumberId, accessToken } = await req.json()

    if (!organizationId || !phoneNumberId || !accessToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get business account ID first
    const businessResponse = await fetch(`https://graph.facebook.com/v18.0/${phoneNumberId}?fields=whatsapp_business_account_id`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    const businessData = await businessResponse.json()
    
    if (!businessResponse.ok) {
      console.error('Error fetching business account:', businessData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch business account', details: businessData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const businessAccountId = businessData.whatsapp_business_account_id

    // Fetch message templates
    const templatesResponse = await fetch(`https://graph.facebook.com/v18.0/${businessAccountId}/message_templates`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      }
    })

    const templatesData = await templatesResponse.json()

    if (!templatesResponse.ok) {
      console.error('WhatsApp API error:', templatesData)
      return new Response(
        JSON.stringify({ error: 'Failed to fetch templates', details: templatesData }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        templates: templatesData.data || [],
        businessAccountId 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in get-whatsapp-templates:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
