import { supabase } from "../integrations/supabase/client"

/**
 * Sends a direct WhatsApp message (only works within 24-hour window)
 */
// Function to call your Supabase Edge Function
export async function callWhatsappDirectFunction(params: any) {
  try {
    // This is the correct way to call a Supabase Edge Function
    const { data, error } = await supabase.functions.invoke("whatsapp-direct", {
      body: params,
    })

    if (error) {
      console.error("Error calling Supabase function:", error)
      throw error
    }

    return data
  } catch (error) {
    console.error("Exception when calling Supabase function:", error)
    throw error
  }
}
