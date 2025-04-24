interface SendNotificationParams {
    token: string
    title: string
    body: string
  }
  
  interface NotificationResponse {
    success: boolean
    message: string
    messageId?: string
  }
  
  /**
   * Sends a push notification using Firebase Cloud Messaging
   */
  export async function sendNotification({ token, title, body }: SendNotificationParams): Promise<NotificationResponse> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
      // Call the Supabase Edge Function
      const response = await fetch(`${supabaseUrl}/functions/v1/send-notification`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          token,
          notification: {
            title,
            body,
          },
        }),
      })
  
      // Handle response
      if (!response.ok) {
        let errorMessage = "Failed to send notification"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          errorMessage = (await response.text()) || errorMessage
        }
        throw new Error(errorMessage)
      }
  
      // Parse response
      const data = await response.json()
      return data
    } catch (error: any) {
      console.error("Error in sendNotification:", error)
      return {
        success: false,
        message: error.message || "Failed to send notification",
      }
    }
  }
  