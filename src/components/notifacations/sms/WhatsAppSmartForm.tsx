"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { sendWhatsAppSmart } from "@/services/whatsapp-smart-service"
import { Loader2, MessageSquare } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface WhatsAppSmartFormProps {
  recipientPhone?: string
  defaultMessage?: string
  onSent?: (result: { success: boolean; message: string }) => void
}

export function WhatsAppSmartForm({ recipientPhone = "", defaultMessage = "", onSent }: WhatsAppSmartFormProps) {
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
      const result = await sendWhatsAppSmart({
        to: phone,
        message,
        fallbackTemplate: "hello_world",
      })

      if (result.success) {
        if (result.usedTemplate) {
          toast.success("Message sent using template (user hasn't messaged in 24 hours)")
        } else {
          toast.success("Direct message sent successfully!")
        }
        setMessage("") // Clear message after successful send
      } else {
        toast.error(`Failed to send message: ${result.message}`)
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Smart WhatsApp Messaging</CardTitle>
        <CardDescription>Automatically uses direct message or template as needed</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
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
          <p className="text-xs text-muted-foreground">
            If user hasn't messaged in 24 hours, we'll use a template instead
          </p>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={handleSend} disabled={sending} className="w-full">
          {sending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Smart Message
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}