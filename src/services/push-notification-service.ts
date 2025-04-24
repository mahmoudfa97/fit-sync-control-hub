interface SendPushParams {
    subscription: PushSubscription
    title: string
    body: string
    icon?: string
    url?: string
  }
  
  interface PushResponse {
    success: boolean
    message: string
  }
  
  export async function sendPushNotification({
    subscription,
    title,
    body,
    icon,
    url,
  }: SendPushParams): Promise<PushResponse> {
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
      const response = await fetch(`${supabaseUrl}/functions/v1/send-push`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${supabaseKey}`,
        },
        body: JSON.stringify({
          subscription,
          notification: {
            title,
            body,
            icon,
            data: { url },
          },
        }),
      })
  
      if (!response.ok) {
        let errorMessage = "Failed to send push notification"
        try {
          const errorData = await response.json()
          errorMessage = errorData.message || errorMessage
        } catch (e) {
          errorMessage = (await response.text()) || errorMessage
        }
        throw new Error(errorMessage)
      }
  
      const data = await response.json()
      return data
    } catch (error: any) {
      console.error("Error in sendPushNotification:", error)
      return {
        success: false,
        message: error.message || "Failed to send push notification",
      }
    }
  }
  
  export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        console.warn("Push notifications not supported")
        return null
      }
  
      // Register service worker
      const registration = await navigator.serviceWorker.register("/service-worker.js")
  
      // Request permission
      const permission = await Notification.requestPermission()
      if (permission !== "granted") {
        console.warn("Notification permission denied")
        return null
      }
  
      // Get subscription
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(import.meta.env.VITE_VAPID_PUBLIC_KEY),
      })
  
      // Save subscription to your backend
      await saveSubscription(subscription)
  
      return subscription
    } catch (error) {
      console.error("Error subscribing to push notifications:", error)
      return null
    }
  }
  
  async function saveSubscription(subscription: PushSubscription): Promise<void> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY
  
    await fetch(`${supabaseUrl}/functions/v1/save-subscription`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({ subscription }),
    })
  }
  
  // Helper function to convert base64 to Uint8Array
  function urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = "=".repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/")
  
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
  
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
  }
  