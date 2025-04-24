interface SendWhatsAppTemplateParams {
    to: string
    templateName: string
    language?: string
    components?: any[]
    fallbackToHelloWorld?: boolean // New parameter
  }
  
  interface WhatsAppResponse {
    success: boolean
    message: string
    messageId?: string
    usedFallback?: boolean // New field to indicate fallback was used
  }
  
  /**
   * Sends a WhatsApp template message using the WhatsApp Cloud API
   * with fallback to hello_world if the requested template isn't available
   */
  export async function sendWhatsAppTemplate({
    to,
    templateName,
    language = "en_US",
    components,
    fallbackToHelloWorld = true, // Default to using fallback
  }: SendWhatsAppTemplateParams): Promise<WhatsAppResponse> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
      // Call the Supabase Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/whatsapp-template`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          to,
          templateName,
          language,
          components,
          fallbackToHelloWorld,
        }),
      })
  
      // Parse response
      let data
      try {
        data = await response.json()
      } catch (e) {
        console.error("Error parsing response:", e)
        data = { success: false, message: "Failed to parse response" }
      }
  
      // If not successful and no fallback was attempted yet, we might need to handle it client-side
      if (!data.success && !data.usedFallback && fallbackToHelloWorld) {
        // Check if it's a template not found error
        const isTemplateError =
          data.message?.includes("Template name does not exist") || data.error?.error?.code === 132001
  
        if (isTemplateError) {
          console.warn(`Template ${templateName} not available, falling back to hello_world`)
  
          // Try again with hello_world template
          return sendWhatsAppTemplate({
            to,
            templateName: "hello_world",
            language,
            components: undefined, // hello_world doesn't need components
            fallbackToHelloWorld: false, // Prevent infinite recursion
          })
        }
      }
  
      return data
    } catch (error: any) {
      console.error("Error in sendWhatsAppTemplate:", error)
      return {
        success: false,
        message: error.message || "Failed to send WhatsApp message",
      }
    }
  }
  