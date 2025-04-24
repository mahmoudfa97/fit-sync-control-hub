"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { sendNotification } from "@/services/firebase-service"
import { Loader2, Bell } from "lucide-react"

interface PushNotificationProps {
  defaultToken?: string
  defaultTitle?: string
  defaultBody?: string
  onSent?: (result: { success: boolean; message: string }) => void
}

export function PushNotification({
  defaultToken = "",
  defaultTitle = "",
  defaultBody = "",
  onSent,
}: PushNotificationProps) {
  const [token, setToken] = useState(defaultToken)
  const [title, setTitle] = useState(defaultTitle)
  const [body, setBody] = useState(defaultBody)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!token || !title || !body) {
      toast.error("Please fill in all fields")
      return
    }

    try {
      setSending(true)
      const result = await sendNotification({
        token,
        title,
        body,
      })

      if (result.success) {
        toast.success("Notification sent successfully!")
      } else {
        toast.error(`Failed to send notification: ${result.message}`)
      }

      if (onSent) {
        onSent(result)
      }
    } catch (error: any) {
      console.error("Error sending notification:", error)
      toast.error(`Error: ${error.message || "Unknown error"}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="token" className="text-sm font-medium">
          Device Token
        </label>
        <Input
          id="token"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="Firebase device token"
          disabled={sending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium">
          Notification Title
        </label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Enter notification title"
          disabled={sending}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="body" className="text-sm font-medium">
          Notification Body
        </label>
        <Textarea
          id="body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Enter notification message"
          rows={3}
          disabled={sending}
        />
      </div>

      <Button onClick={handleSend} disabled={sending} className="w-full">
        {sending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Bell className="mr-2 h-4 w-4" />
            Send Notification
          </>
        )}
      </Button>
    </div>
  )
}
