"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Bell, BellOff, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { subscribeToPushNotifications } from "@/services/push-notification-service"

export function PushNotificationButton() {
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if push is supported
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setIsSubscribed(false)
      return
    }

    // Check existing subscription
    const checkSubscription = async () => {
      try {
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        setIsSubscribed(!!subscription)
      } catch (error) {
        console.error("Error checking subscription:", error)
        setIsSubscribed(false)
      }
    }

    checkSubscription()
  }, [])

  const handleSubscribe = async () => {
    try {
      setIsLoading(true)
      const subscription = await subscribeToPushNotifications()

      if (subscription) {
        setIsSubscribed(true)
        toast.success("Successfully subscribed to gym notifications!")
      } else {
        toast.error("Failed to subscribe to notifications")
      }
    } catch (error) {
      console.error("Error subscribing:", error)
      toast.error("Error subscribing to notifications")
    } finally {
      setIsLoading(false)
    }
  }

  const handleUnsubscribe = async () => {
    try {
      setIsLoading(true)
      const registration = await navigator.serviceWorker.ready
      const subscription = await registration.pushManager.getSubscription()

      if (subscription) {
        await subscription.unsubscribe()
        setIsSubscribed(false)
        toast.success("Unsubscribed from gym notifications")
      }
    } catch (error) {
      console.error("Error unsubscribing:", error)
      toast.error("Error unsubscribing from notifications")
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubscribed === null) {
    return (
      <Button disabled className="w-full">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Checking notification status...
      </Button>
    )
  }

  return isSubscribed ? (
    <Button variant="outline" onClick={handleUnsubscribe} disabled={isLoading} className="w-full">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellOff className="mr-2 h-4 w-4" />}
      Unsubscribe from Gym Notifications
    </Button>
  ) : (
    <Button onClick={handleSubscribe} disabled={isLoading} className="w-full">
      {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Bell className="mr-2 h-4 w-4" />}
      Get Gym Notifications
    </Button>
  )
}
