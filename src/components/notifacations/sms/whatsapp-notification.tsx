"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { sendWhatsApp } from "@/services/whatsapp-service"
import { Loader2, MessageSquare } from "lucide-react"

interface WhatsAppNotificationProps {
  recipientPhone?: string
  defaultMessage?: string
  onSent?: (result: { success: boolean; message: string }) => void
}

export function WhatsAppNotification({ recipientPhone = "", defaultMessage = "", onSent }: WhatsAppNotificationProps) {
  const [phone, setPhone] = useState(recipientPhone)
  const [message, setMessage] = useState(defaultMessage)
  const [sending, setSending] = useState(false)

  const handleSend = async () => {
    if (!phone || !message) {
      toast.error("Please provide both phone number and message")
      return
    }

    try {
      setSending(true)
      const result = await sendWhatsApp({
        to: phone,
        message: message,
      })

      if (result.success) {
        toast.success("WhatsApp message sent successfully!")
      } else {
        toast.error(`Failed to send WhatsApp message: ${result.message}`)
      }

      if (onSent) {
        onSent(result)
      }
    } catch (error: any) {
      console.error("Error sending WhatsApp message:", error)
      toast.error(`Error: ${error.message || "Unknown error"}`)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label htmlFor="phone" className="text-sm font-medium">
          Recipient WhatsApp Number
        </label>
        <Input
          id="phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          placeholder="+972xxxxxxxxx"
          disabled={sending}
        />
        <p className="text-xs text-muted-foreground">Include country code (e.g., +972 for Israel)</p>
      </div>

      <div className="space-y-2">
        <label htmlFor="message" className="text-sm font-medium">
          Message
        </label>
        <Textarea
          id="message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your message here..."
          rows={4}
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
            <MessageSquare className="mr-2 h-4 w-4" />
            Send WhatsApp
          </>
        )}
      </Button>
    </div>
  )
}
