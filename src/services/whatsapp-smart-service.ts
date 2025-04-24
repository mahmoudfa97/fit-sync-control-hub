import { sendWhatsAppDirect } from "./whatsapp-direct-service"
import { sendWhatsAppTemplate } from "./whatsapp-template-service"

interface SendWhatsAppSmartParams {
  to: string
  message: string
  fallbackTemplate?: string
  fallbackLanguage?: string
}

interface WhatsAppResponse {
  success: boolean
  message: string
  messageId?: string
  usedTemplate?: boolean
}

/**
 * Smart WhatsApp sender - automatically chooses between direct message and template
 * based on whether the user is in the 24-hour window
 */
export async function sendWhatsAppSmart({
  to,
  message,
  fallbackTemplate = "hello_world",
  fallbackLanguage = "en_US",
}: SendWhatsAppSmartParams): Promise<WhatsAppResponse> {
  try {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

    // Call the Supabase Edge Function to check if user is in 24-hour window
    const checkResponse = await fetch(`${supabaseUrl}/functions/v1/check-message-window`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        phoneNumber: to,
      }),
    })

    if (!checkResponse.ok) {
      throw new Error("Failed to check messaging window")
    }

    const { inWindow } = await checkResponse.json()

    if (inWindow) {
      // User is in 24-hour window, send direct message
      const result = await sendWhatsAppDirect({
        to,
        message,
      })

      return {
        ...result,
        usedTemplate: false,
      }
    } else {
      // User is outside 24-hour window, use template
      console.log(`User ${to} outside 24-hour window, using template ${fallbackTemplate}`)

      const result = await sendWhatsAppTemplate({
        to,
        templateName: fallbackTemplate,
        language: fallbackLanguage,
      })

      return {
        ...result,
        usedTemplate: true,
      }
    }
  } catch (error: any) {
    console.error("Error in sendWhatsAppSmart:", error)
    return {
      success: false,
      message: error.message || "Failed to send WhatsApp message",
    }
  }
}