"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { sendWhatsAppTemplate } from "@/services/whatsapp-template-service"
import { AlertCircle, Loader2, MessageSquare, RefreshCw } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface WhatsAppTemplateFormProps {
  recipientPhone?: string
  onSent?: (result: { success: boolean; message: string }) => void
}

// Templates with their approval status
const TEMPLATES = [
  { id: "hello_world", name: "Hello World", language: "en_US", status: "APPROVED" },
  { id: "gym_class_reminder", name: "Class Reminder", language: "en_US", status: "PENDING" },
  { id: "gym_booking_confirmation", name: "Booking Confirmation", language: "en_US", status: "PENDING" },
  { id: "gym_membership_renewal", name: "Membership Renewal", language: "en_US", status: "PENDING" },
  // Add other templates with their status
]

export function WhatsAppTemplateForm({ recipientPhone = "", onSent }: WhatsAppTemplateFormProps) {
  const [phone, setPhone] = useState(recipientPhone)
  const [templateId, setTemplateId] = useState("hello_world") // Default to hello_world
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [templates, setTemplates] = useState(TEMPLATES)
  const [showWarning, setShowWarning] = useState(false)

  // Check if selected template is pending
  const selectedTemplate = templates.find((t) => t.id === templateId)
  const isPending = selectedTemplate?.status === "PENDING"

  // Show warning when selecting a pending template
  useEffect(() => {
    setShowWarning(isPending || false)
  }, [templateId, isPending])

  // Function to fetch available templates (in a real app)
  const fetchTemplates = async () => {
    try {
      setLoading(true)
      // This would be an API call to your backend to get available templates
      // For now, we'll simulate it with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // In a real implementation, you would fetch this from your backend
      // const response = await fetch('/api/whatsapp/templates')
      // const data = await response.json()
      // setTemplates(data.templates)

      toast.success("Templates refreshed")
    } catch (error) {
      console.error("Error fetching templates:", error)
      toast.error("Failed to refresh templates")
    } finally {
      setLoading(false)
    }
  }

  const handleSend = async () => {
    if (!phone || !templateId) {
      toast.error("Please provide both phone number and template")
      return
    }

    try {
      setSending(true)

      // If template is pending, warn user and use fallback
      const useFallback = isPending

      if (useFallback) {
        toast.info("Using hello_world template as fallback since selected template is pending approval")
      }

      const result = await sendWhatsAppTemplate({
        to: phone,
        templateName: templateId,
        language: "en_US",
        fallbackToHelloWorld: useFallback,
      })

      if (result.success) {
        if (result.usedFallback) {
          toast.success("Message sent using hello_world fallback template!")
        } else {
          toast.success("WhatsApp message sent successfully!")
        }
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
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle>Send WhatsApp Template</CardTitle>
            <CardDescription>Send pre-approved WhatsApp templates</CardDescription>
          </div>
          <Button variant="outline" size="icon" onClick={fetchTemplates} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showWarning && (
          <Alert variant="warning">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Template Pending Approval</AlertTitle>
            <AlertDescription>
              This template is still pending quality review. We'll automatically fall back to the hello_world template.
            </AlertDescription>
          </Alert>
        )}

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
          <label htmlFor="template" className="text-sm font-medium">
            Message Template
          </label>
          <Select value={templateId} onValueChange={setTemplateId} disabled={sending}>
            <SelectTrigger id="template">
              <SelectValue placeholder="Select a template" />
            </SelectTrigger>
            <SelectContent>
              {templates.map((template) => (
                <SelectItem key={template.id} value={template.id}>
                  {template.name} {template.status === "PENDING" ? "(Pending)" : ""}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Only hello_world is guaranteed to work. Other templates are pending approval.
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
              Send Template
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
