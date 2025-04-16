import { supabase } from "@/integrations/supabase/client"

interface SendSmsParams {
  to: string
  message: string
}

interface SmsResponse {
  success: boolean
  message: string
  sid?: string
}

/**
 * Sends an SMS using the configured provider
 */
export async function sendSms({
  to,
  message,
}: SendSmsParams): Promise<SmsResponse> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey =  import.meta.env.SUPABASE_PUBLISHABLE_KEY;
    
    // Call the Supabase Edge Function
    const response = await fetch(`${supabaseUrl}/functions/v1/super-handler`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${supabaseKey}`
      },
      body: JSON.stringify({
        to,
        message
      }),
    });

    // Handle response
    if (!response.ok) {
      let errorMessage = "Failed to send SMS";
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || errorMessage;
      } catch (e) {
        // If response is not JSON, use text
        errorMessage = await response.text() || errorMessage;
      }
      throw new Error(errorMessage);
    }

    // Parse response
    let data;
    try {
      data = await response.json();
    } catch (e) {
      console.error("Error parsing response:", e);
      data = { success: true, message: "SMS sent successfully" };
    }

    return data;
  } catch (error: any) {
    console.error("Error in sendSms:", error);
    return {
      success: false,
      message: error.message || "Failed to send SMS",
    };
  }
}
