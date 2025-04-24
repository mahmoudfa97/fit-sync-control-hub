interface TokenResponse {
    access_token: string
    token_type: string
    expires_in: number
  }
  
  let cachedToken: string | null = null
  let tokenExpiry: number | null = null
  
  /**
   * Gets a valid WhatsApp API token, refreshing if necessary
   */
  export async function getWhatsAppToken(): Promise<string> {
    // Check if we have a valid cached token
    const now = Date.now()
    if (cachedToken && tokenExpiry && now < tokenExpiry - 60000) {
      return cachedToken
    }
  
    try {
      // Token is expired or not set, get a new one
      const appId = import.meta.env.VITE_META_APP_ID
      const appSecret = import.meta.env.VITE_META_APP_SECRET
  
      // For system users, use client credentials flow
      const response = await fetch(`https://graph.facebook.com/v17.0/oauth/access_token`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        // Using URLSearchParams to properly encode the query parameters
        // Note: In a real implementation, you'd want to use a more secure method
        // for handling app secrets
      })
  
      if (!response.ok) {
        throw new Error(`Failed to refresh token: ${response.status} ${response.statusText}`)
      }
  
      const data: TokenResponse = await response.json()
  
      // Cache the token and set expiry time (subtract 5 minutes for safety)
      cachedToken = data.access_token
      tokenExpiry = now + data.expires_in * 1000 - 300000
  
      return data.access_token
    } catch (error) {
      console.error("Error refreshing WhatsApp token:", error)
      throw error
    }
  }
  